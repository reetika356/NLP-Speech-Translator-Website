#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <driver/i2s.h>
#include <math.h>

const char* ssid     = "";
const char* password = "";

// Must match your laptop's IPv4 address (run `ipconfig` to confirm).
const char* ws_host  = "192.168.0.108";
const int   ws_port  = 8000;
const char* ws_path  = "/ws/esp32_out";

#define I2S_DOUT 25   // DIN on the amp
#define I2S_BCLK 26   // BCLK on the amp
#define I2S_LRC  27   // LRC on the amp

// Must match ESP32_SAMPLE_RATE in the backend's app.py
#define SAMPLE_RATE 16000

// Volume multiplier for speech. Try 2 to 6. Lower it if the sound crackles.
#define GAIN 4

WebSocketsClient webSocket;
bool wsConnected = false;

unsigned long totalBytesReceived = 0;
int messagesReceived = 0;

void i2s_install() {
  i2s_config_t config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 256,
    .use_apll = false,
    .tx_desc_auto_clear = true,
    .fixed_mclk = 0
  };
  i2s_driver_install(I2S_NUM_0, &config, 0, NULL);
}

void i2s_setpin() {
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_BCLK,
    .ws_io_num = I2S_LRC,
    .data_out_num = I2S_DOUT,
    .data_in_num = I2S_PIN_NO_CHANGE
  };
  i2s_set_pin(I2S_NUM_0, &pin_config);
}

// Short 440 Hz beep so you can confirm the speaker works at every boot.
void playBeep() {
  int16_t buf[256];
  double phase = 0.0;
  const double inc = 2.0 * PI * 440 / SAMPLE_RATE;
  for (int n = 0; n < 40; n++) {
    for (int i = 0; i < 256; i++) {
      buf[i] = (int16_t)(sin(phase) * 8000);
      phase += inc;
      if (phase >= 2.0 * PI) phase -= 2.0 * PI;
    }
    size_t w;
    i2s_write(I2S_NUM_0, buf, sizeof(buf), &w, portMAX_DELAY);
  }
}

void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("✅ Connected to backend (/ws/esp32_out)");
      wsConnected = true;
      break;

    case WStype_DISCONNECTED:
      Serial.println("❌ Disconnected from backend, retrying...");
      wsConnected = false;
      break;

    case WStype_BIN: {
      messagesReceived++;
      totalBytesReceived += length;
      Serial.printf("🔊 Playing audio #%d — %u bytes (total so far: %lu bytes)\n",
                    messagesReceived, (unsigned)length, totalBytesReceived);

      // Raw PCM16 from the backend: boost the volume, then play it.
      int16_t tmp[512];
      size_t total = length / 2;
      size_t done = 0;
      size_t bytes_written;
      while (done < total) {
        size_t n = min((size_t)512, total - done);
        memcpy(tmp, payload + done * 2, n * 2);
        for (size_t i = 0; i < n; i++) {
          int32_t v = (int32_t)tmp[i] * GAIN;
          if (v > 32767) v = 32767;
          if (v < -32768) v = -32768;
          tmp[i] = (int16_t)v;
        }
        i2s_write(I2S_NUM_0, tmp, n * 2, &bytes_written, portMAX_DELAY);
        done += n;
      }
      break;
    }

    case WStype_TEXT:
      Serial.print("📝 Text message: ");
      Serial.println((char*)payload);
      break;

    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  i2s_install();
  i2s_setpin();
  i2s_zero_dma_buffer(I2S_NUM_0);
  Serial.println("🔊 I2S output ready");
  playBeep();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin(ws_host, ws_port, ws_path);
  webSocket.onEvent(onWebSocketEvent);
  webSocket.setReconnectInterval(3000);

  Serial.println("🔌 Waiting for connection to backend...");
}

void loop() {
  webSocket.loop();
}