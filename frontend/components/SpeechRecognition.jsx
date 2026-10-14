"use client";
import { Box, Text } from "@chakra-ui/react";
import React, { useContext, useRef, useState } from "react";
import RecorderMicButton from "./RecorderMicButton";
import { TranslationContext } from "./TranslationContext";

// Same backend WebSocket used by mic_client.html — this is the proven
// working pipeline (Deepgram STT -> translate -> TTS -> forwarded to ESP32).
const BACKEND_WS_URL = "ws://127.0.0.1:8000/ws/translate";

// Downsample Float32 mic audio to 16kHz 16-bit PCM, which is what the
// backend's Deepgram connection expects. Copied from mic_client.html.
function downsampleTo16kPCM16(float32Array, inputSampleRate) {
  const targetRate = 16000;
  const ratio = inputSampleRate / targetRate;
  const outLength = Math.floor(float32Array.length / ratio);
  const result = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const srcIndex = Math.floor(i * ratio);
    let sample = float32Array[srcIndex];
    sample = Math.max(-1, Math.min(1, sample));
    result[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return result;
}

const SpeechRecorder = () => {
  const { state, dispatch, destinationAudioRef } = useContext(TranslationContext);

  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const processorRef = useRef(null);
  const micSourceRef = useRef(null);
  const micStreamRef = useRef(null);

  // Refs (not state) so the ws.onmessage closure always accumulates onto
  // the latest text, instead of a stale value captured at connect-time.
  const sourceTextRef = useRef("");
  const destTextRef = useRef("");

  const startListening = async () => {
    if (!navigator.mediaDevices || !window.WebSocket) {
      setSupported(false);
      return;
    }

    sourceTextRef.current = state.sourceText || "";
    destTextRef.current = state.destinationText || "";

    const ws = new WebSocket(BACKEND_WS_URL);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = async () => {
      ws.send(
        JSON.stringify({
          type: "init",
          source_lang: state.sourceLanguage,
          dest_lang: state.destinationLanguage,
        })
      );

      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const micSource = audioCtx.createMediaStreamSource(micStream);
      micSourceRef.current = micSource;

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const input = e.inputBuffer.getChannelData(0);
        const pcm16 = downsampleTo16kPCM16(input, audioCtx.sampleRate);
        ws.send(pcm16.buffer);
      };

      // Route through a silent gain node so onaudioprocess fires without
      // audibly looping the mic back to speakers.
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;

      micSource.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      setListening(true);
      dispatch({ type: "SET_IS_RECORDING", payload: true });
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        const msg = JSON.parse(event.data);
        if (msg.type === "transcript") {
          sourceTextRef.current = sourceTextRef.current
            ? sourceTextRef.current + " " + msg.original
            : msg.original;
          destTextRef.current = destTextRef.current
            ? destTextRef.current + " " + msg.translated
            : msg.translated;

          dispatch({ type: "SET_SOURCE_TEXT", payload: sourceTextRef.current });
          dispatch({ type: "SET_DESTINATION_TEXT", payload: destTextRef.current });
        }
      } else {
        // Binary = translated MP3 audio from the backend. It's already
        // been forwarded to the ESP32 server-side by this point — this
        // just lets it also play in the browser tab.
        const blob = new Blob([event.data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        destinationAudioRef.current = audio;
        // audio.play();  // disabled: sound now comes from the ESP32 earphone
      }
    };

    ws.onerror = (e) => {
      console.error("Translation WebSocket error:", e);
    };

    ws.onclose = () => {
      setListening(false);
      dispatch({ type: "SET_IS_RECORDING", payload: false });
    };
  };

  const stopListening = () => {
    if (processorRef.current) processorRef.current.disconnect();
    if (micSourceRef.current) micSourceRef.current.disconnect();
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (wsRef.current) wsRef.current.close();

    setListening(false);
    dispatch({ type: "SET_IS_RECORDING", payload: false });
  };

  if (!supported) {
    return (
      <Text textAlign="center" color="red.300" fontFamily="mono" fontSize="sm">
        Your browser does not support microphone streaming.
      </Text>
    );
  }

  return (
    <Box>
      <RecorderMicButton
        isMicOn={listening}
        onClick={listening ? stopListening : startListening}
      />
    </Box>
  );
};

export default SpeechRecorder;