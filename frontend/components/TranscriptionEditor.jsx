import {
  Box,
  HStack,
  Heading,
  Text,
  Tooltip,
  Textarea,
  CircularProgress,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaDeleteLeft } from "react-icons/fa6";
import { HiSpeakerWave } from "react-icons/hi2";
import { MdOutlineReplay } from "react-icons/md";
import { FaPause } from "react-icons/fa6";
import CopyButton from "./CopyButton";
import UtilityButton from "./UtilityButton";
import TranslateButton from "./TranslateButton";

const TranscriptionEditor = ({
  isEditable = false,
  value,
  setValue,
  audioRef,
  playAudio,
  pauseAudio,
  resetAudio,
  setEditingListener,
  isLoding = false,
  title = "Editor",
  placeholder = "Please say something .....",
}) => {
  const [isPlaying, setIsplaying] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const togglePlaying = () => {
    if (audioRef.current) {
      setIsplaying(!isPlaying);
    }
  };
  const textareaRef = useRef(null);
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      playAudio(audioRef);
    } else {
      pauseAudio(audioRef);
    }
  }, [isPlaying]);
  const handleEditText = () => {
    if (isEditable) {
      setEditing(true);
      setEditingListener(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target)
      ) {
        setEditing(false);
        setEditingListener(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (isEditing && textarea) {
      textarea.focus();
      textarea.setSelectionRange(value.length, value.length);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!audioRef.current) return;
    const handleEnded = () => {
      setIsplaying(false);
    };
    const audioElement = audioRef.current;
    audioElement.addEventListener("ended", handleEnded);
    return () => {
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, [audioRef.current]);

  const lodingIndication = (
    <CircularProgress
      color="signal.cyan"
      thickness="4px"
      size="8"
      isIndeterminate
    />
  );

  return (
    <Box
      position="relative"
      w={{ base: "xs", sm: "sm", md: "sm", lg: "md" }}
      pb={10}
      bg="rgba(255,255,255,0.04)"
      backdropFilter="blur(16px)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      overflow="hidden"
      transition="border-color 0.25s ease, box-shadow 0.25s ease"
      _hover={{
        borderColor: "whiteAlpha.300",
        boxShadow: "0 0 40px -18px rgba(94,234,212,0.35)",
      }}
    >
      <Box
        h="2px"
        w="full"
        bgGradient="linear(to-r, signal.cyan, signal.azure)"
        opacity={0.7}
      />
      <HStack justify="space-between" w="full" px={5} pt={4} pb={2}>
        <Heading
          size="sm"
          fontFamily="heading"
          color="ink.100"
          letterSpacing="tight"
        >
          {title}
        </Heading>
        <HStack>
          <UtilityButton
            icon={isPlaying ? <FaPause /> : <HiSpeakerWave />}
            onClick={togglePlaying}
            isLoading={isLoding}
            variant="ghost"
            color="teal"
            tooltip={`${!isPlaying ? "Play" : "Pause"} speech.`}
          />
          <UtilityButton
            icon={
              <Box
                transition="0.3s transform ease"
                _active={{ transform: "rotate(180deg)" }}
              >
                <MdOutlineReplay />
              </Box>
            }
            onClick={() => resetAudio(audioRef)}
            isLoading={isLoding}
            color="teal"
            variant="ghost"
            tooltip="Reset speech"
          />
        </HStack>
      </HStack>
      <Box px={5}>
        {!isEditing ? (
          <Tooltip label={isEditable ? "Double click to edit" : null}>
            <Box
              height={{ base: "56", md: "44" }}
              onDoubleClick={handleEditText}
              overflowY="scroll"
              sx={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-thumb": {
                  borderRadius: "10px",
                  bg: "whiteAlpha.200",
                },
              }}
            >
              <Text
                fontSize="md"
                color={value ? "ink.100" : "ink.600"}
                lineHeight="1.6"
              >
                {value || placeholder}
              </Text>
            </Box>
          </Tooltip>
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            height={{ base: "56", md: "44" }}
            fontSize="md"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            color="ink.100"
            _focus={{ borderColor: "signal.cyan", boxShadow: "none" }}
          />
        )}
      </Box>
      <HStack position="absolute" bottom="2" left="3">
        {isEditable && (
          <HStack>
            <UtilityButton
              icon={<FaDeleteLeft />}
              onClick={() => setValue("")}
              color="red"
              tooltip="Clear text"
            />
            <UtilityButton
              icon={<FaEdit />}
              onClick={handleEditText}
              color="blue"
              tooltip="Edit text"
            />
          </HStack>
        )}
        <CopyButton text={value} />
      </HStack>
      <Box position="absolute" bottom="2" right="3">
        <HStack>
          {isEditable && <TranslateButton />}
          {isLoding && !isEditable && lodingIndication}
        </HStack>
      </Box>
    </Box>
  );
};

export default TranscriptionEditor;