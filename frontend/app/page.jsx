"use client";
import React from "react";
import { TranslationProvider } from "@/components/TranslationContext";
import { Stack, Text, Box, HStack } from "@chakra-ui/react";
import LaguageSelector from "@/components/LaguageSelector";
import TranslationPanel from "@/components/TranslationPanel";
import dynamic from "next/dynamic";
import "regenerator-runtime/runtime";

// NOTE: this previously pointed at "@/components/SpeechRecognition", a file
// that doesn't exist in the project — your actual component is
// SpeechRecorder.jsx. Fixed here.
const SpeechRecorder = dynamic(() => import("@/components/SpeechRecognition"), {
  ssr: false,
});

const HomePage = () => {
  return (
    <TranslationProvider>
      <Stack
        direction="column"
        spacing={{ base: 8, md: 10 }}
        px={4}
        py={{ base: 10, md: 16 }}
        maxW="6xl"
        mx="auto"
        align="center"
      >
        <Stack spacing={3} align="center" textAlign="center">
          <HStack
            spacing={2}
            px={3}
            py={1}
            borderRadius="full"
            border="1px solid"
            borderColor="whiteAlpha.200"
            bg="whiteAlpha.50"
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg="signal.cyan"
              boxShadow="0 0 8px 1px #5EEAD4"
            />
            <Text
              fontFamily="mono"
              fontSize="xs"
              letterSpacing="wider"
              color="ink.400"
              textTransform="uppercase"
            >
              Live translation pipeline
            </Text>
          </HStack>
          <Text
            fontFamily="heading"
            fontWeight="700"
            fontSize={{ base: "3xl", md: "5xl" }}
            letterSpacing="tight"
            bgGradient="linear(to-r, ink.100, signal.cyan)"
            bgClip="text"
          >
            Speak. Hear it, translated.
          </Text>
          <Text color="ink.400" maxW="lg" fontSize={{ base: "sm", md: "md" }}>
            HearLink listens through your mic, translates in real time, and
            streams the result to your earpiece.
          </Text>
        </Stack>

        <LaguageSelector />
        <TranslationPanel />
        <SpeechRecorder />
      </Stack>
    </TranslationProvider>
  );
};

export default HomePage;