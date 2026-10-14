import os
import io
import json
import wave
import asyncio

import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deep_translator import GoogleTranslator, MyMemoryTranslator
from gtts import gTTS
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from pydub import AudioSegment

load_dotenv()

app = FastAPI()

DEEPGRAM_API_KEY = os.environ["DEEPGRAM_API_KEY"]

# Holds the currently-connected ESP32 output device, if any.
esp32_output_ws: WebSocket | None = None

LANGUAGES = {
    "en": "english",
    "hi": "hindi",
    "mr": "marathi",
    "fr": "french",
    "de": "german",
    "es": "spanish",
    "ja": "japanese",
    "ko": "korean",
    "pt": "portuguese",
    "ru": "russian",
    "it": "italian",
}

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://172.17.0.1:3000",
    "http://localhost:5173",
    "null",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    dest_lang: str


class TextToSpeechRequest(BaseModel):
    text: str
    lang: str


# MyMemoryTranslator needs locale-style codes (en-US, hi-IN, etc.), not the
# plain two-letter codes Google Translate and the rest of this app use.
MYMEMORY_LOCALE = {
    "en": "en-US",
    "hi": "hi-IN",
    "mr": "mr-IN",
    "fr": "fr-FR",
    "de": "de-DE",
    "es": "es-ES",
    "ja": "ja-JP",
    "ko": "ko-KR",
    "pt": "pt-PT",
    "ru": "ru-RU",
    "it": "it-IT",
}


def translate_with_fallback(text: str, source_lang: str, dest_lang: str) -> str:
    """
    Tries Google Translate first. If it's rate-limited, falls back to
    MyMemory instead of failing outright.
    """
    try:
        return GoogleTranslator(source=source_lang, target=dest_lang).translate(text)
    except Exception as e:
        print(f"⚠️ Google Translate failed ({e}); falling back to MyMemory")
        mm_source = MYMEMORY_LOCALE.get(source_lang, source_lang)
        mm_dest = MYMEMORY_LOCALE.get(dest_lang, dest_lang)
        return MyMemoryTranslator(source=mm_source, target=mm_dest).translate(text)


@app.get("/")
def welcome():
    return {"msg": "Welcome to translator API backend."}


@app.get("/languages")
def get_supported_languages():
    return LANGUAGES


@app.post("/translate")
def translate_text(request: TranslationRequest):
    translated = translate_with_fallback(
        request.text, request.source_lang, request.dest_lang
    )
    return {"translated_text": translated}


@app.post("/text-to-speech")
def text_to_speech(request: TextToSpeechRequest):
    tts = gTTS(text=request.text, lang=request.lang)
    audio_file = io.BytesIO()
    tts.write_to_fp(audio_file)
    audio_file.seek(0)
    return StreamingResponse(audio_file, media_type="audio/mpeg")


def build_deepgram_url(source_lang: str, interim_results: bool) -> str:
    return (
        "wss://api.deepgram.com/v1/listen"
        f"?model=nova-2"
        f"&language={source_lang}"
        "&punctuate=true"
        "&encoding=linear16"
        "&sample_rate=16000"
        "&channels=1"
        "&endpointing=1000"  # wait ~1s of silence before ending a phrase
        f"&interim_results={'true' if interim_results else 'false'}"
    )


# ---------------------------------------------------------------------------
# MP3 -> raw PCM16 mono, so the ESP32 can play it directly with i2s_write().
# Must match SAMPLE_RATE in the ESP32 firmware (main.cpp).
# ---------------------------------------------------------------------------
ESP32_SAMPLE_RATE = 16000


def mp3_bytes_to_pcm16(mp3_bytes: bytes, sample_rate: int = ESP32_SAMPLE_RATE) -> bytes:
    audio = AudioSegment.from_file(io.BytesIO(mp3_bytes), format="mp3")
    audio = audio.set_frame_rate(sample_rate).set_channels(1).set_sample_width(2)
    return audio.raw_data


# Only one send to the ESP32 at a time, so two sentences never overlap.
esp32_send_lock = asyncio.Lock()


async def send_to_esp32(mp3_bytes: bytes):
    """
    Converts MP3 to PCM and streams it to the ESP32 in small chunks.
    Runs as its own task, so it keeps going even if the browser disconnects.
    """
    ws = esp32_output_ws
    if ws is None:
        print("⚠️ No ESP32 connected, skipping")
        return
    try:
        pcm_bytes = await asyncio.to_thread(mp3_bytes_to_pcm16, mp3_bytes)
        async with esp32_send_lock:
            for i in range(0, len(pcm_bytes), 4096):
                await ws.send_bytes(pcm_bytes[i : i + 4096])
                await asyncio.sleep(0.1)  # keeps pace with playback
        print(f"📡 Forwarded {len(pcm_bytes)} bytes of PCM audio to ESP32")
    except Exception as e:
        print(f"⚠️ Failed to forward audio to ESP32: {e}")


# ---------------------------------------------------------------------------
# STT-only endpoint for the real website.
# ---------------------------------------------------------------------------
@app.websocket("/ws/stt")
async def stt_websocket(websocket: WebSocket):
    await websocket.accept()
    print("✅ Client connected to /ws/stt")

    try:
        init_raw = await websocket.receive_text()
        init_data = json.loads(init_raw)
        source_lang = init_data.get("source_lang", "en")
    except Exception as e:
        print(f"⚠️ Failed to read init message: {e}")
        await websocket.close()
        return

    print(f"🌐 /ws/stt source_lang={source_lang}")
    deepgram_url = build_deepgram_url(source_lang, interim_results=True)

    try:
        async with websockets.connect(
            deepgram_url,
            additional_headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"},
        ) as dg_ws:
            print("🎙️ Deepgram connected! (STT-only)")

            async def receive_from_deepgram():
                async for message in dg_ws:
                    data = json.loads(message)
                    try:
                        transcript = data["channel"]["alternatives"][0]["transcript"]
                    except (KeyError, IndexError):
                        continue
                    if not transcript.strip():
                        continue
                    is_final = bool(data.get("is_final", False))
                    await websocket.send_json(
                        {"type": "transcript", "text": transcript, "is_final": is_final}
                    )

            receiver_task = asyncio.create_task(receive_from_deepgram())
            try:
                while True:
                    data = await websocket.receive_bytes()
                    await dg_ws.send(data)
            except WebSocketDisconnect:
                print("❌ Client disconnected from /ws/stt")
            finally:
                receiver_task.cancel()
    except Exception as e:
        print(f"⚠️ Error in /ws/stt: {e}")


# ---------------------------------------------------------------------------
# Main pipeline: mic -> Deepgram -> translate -> TTS -> browser + ESP32.
# ---------------------------------------------------------------------------
@app.websocket("/ws/translate")
async def translate_websocket(websocket: WebSocket):
    await websocket.accept()
    print("✅ Client connected to /ws/translate")

    try:
        init_raw = await websocket.receive_text()
        init_data = json.loads(init_raw)
        source_lang = init_data.get("source_lang", "en")
        dest_lang = init_data.get("dest_lang", "hi")
    except Exception as e:
        print(f"⚠️ Failed to read init message: {e}")
        await websocket.close()
        return

    print(f"🌐 source_lang={source_lang}  dest_lang={dest_lang}")
    deepgram_url = build_deepgram_url(source_lang, interim_results=False)

    try:
        async with websockets.connect(
            deepgram_url,
            additional_headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"},
        ) as dg_ws:
            print("🎙️ Deepgram connected!")

            last_transcript = {"text": None}

            async def receive_from_deepgram():
                async for message in dg_ws:
                    data = json.loads(message)
                    try:
                        transcript = data["channel"]["alternatives"][0]["transcript"]
                    except (KeyError, IndexError):
                        continue
                    if not transcript.strip():
                        continue

                    # Skip duplicate finalisations of the same utterance.
                    if transcript == last_transcript["text"]:
                        continue
                    last_transcript["text"] = transcript

                    print(f"📝 Recognized ({source_lang}): {transcript}")

                    try:
                        translated = await asyncio.to_thread(
                            translate_with_fallback, transcript, source_lang, dest_lang
                        )
                    except Exception as e:
                        print(f"⚠️ Translation failed on both services: {e}")
                        continue

                    print(f"🌍 Translated ({dest_lang}): {translated}")

                    await websocket.send_json(
                        {"type": "transcript", "original": transcript, "translated": translated}
                    )

                    try:
                        tts = gTTS(text=translated, lang=dest_lang)
                        audio_buffer = io.BytesIO()
                        tts.write_to_fp(audio_buffer)
                        audio_buffer.seek(0)
                        mp3_bytes = audio_buffer.read()
                    except Exception as e:
                        print(f"⚠️ TTS error: {e}")
                        continue

                    # ESP32 first, as its own task, so it is never cut off
                    # if the browser disconnects.
                    asyncio.create_task(send_to_esp32(mp3_bytes))

                    # Browser no longer receives the MP3, so the laptop stays
                    # silent and the speech plays only on the ESP32 earphone.
                    # (To hear it on the laptop again, uncomment the lines below.)
                    # try:
                    #     await websocket.send_bytes(mp3_bytes)
                    # except Exception:
                    #     pass

            receiver_task = asyncio.create_task(receive_from_deepgram())
            try:
                while True:
                    data = await websocket.receive_bytes()
                    await dg_ws.send(data)
            except WebSocketDisconnect:
                print("❌ Client disconnected")
            finally:
                receiver_task.cancel()
    except Exception as e:
        print(f"⚠️ Error: {e}")


@app.websocket("/ws/esp32_out")
async def esp32_output_websocket(websocket: WebSocket):
    global esp32_output_ws
    await websocket.accept()

    # Drop any stale old connection so audio always goes to the newest one.
    if esp32_output_ws is not None:
        try:
            await esp32_output_ws.close()
        except Exception:
            pass
    esp32_output_ws = websocket
    print("✅ ESP32 connected to /ws/esp32_out (ready to receive translated audio)")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        print("❌ ESP32 disconnected from /ws/esp32_out")
    finally:
        if esp32_output_ws is websocket:
            esp32_output_ws = None


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)