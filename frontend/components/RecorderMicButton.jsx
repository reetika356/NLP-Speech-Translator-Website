import { Box, IconButton, Tooltip, keyframes } from "@chakra-ui/react";
import React from "react";
import { CiMicrophoneOn } from "react-icons/ci";
import { CiMicrophoneOff } from "react-icons/ci";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(1.9); opacity: 0; }
`;

const RecorderMicButton = ({ isMicOn, onClick }) => {
  return (
    <Tooltip label={`Click to ${isMicOn ? "stop recording" : "record"}.`}>
      <Box
        position="relative"
        w="80px"
        h="80px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {isMicOn && (
          <>
            <Box
              position="absolute"
              inset="0"
              borderRadius="full"
              border="1px solid"
              borderColor="signal.amber"
              animation={`${pulse} 1.6s ease-out infinite`}
            />
            <Box
              position="absolute"
              inset="0"
              borderRadius="full"
              border="1px solid"
              borderColor="signal.amber"
              animation={`${pulse} 1.6s ease-out 0.8s infinite`}
            />
          </>
        )}
        <IconButton
          variant="solid"
          size="lg"
          w="70px"
          h="70px"
          icon={isMicOn ? <CiMicrophoneOff /> : <CiMicrophoneOn />}
          onClick={onClick}
          isRound={true}
          fontSize="34px"
          bgGradient={
            isMicOn
              ? "linear(to-br, signal.amber, #F97316)"
              : "linear(to-br, signal.azure, signal.cyan)"
          }
          color="void.900"
          boxShadow={
            isMicOn
              ? "0 0 30px -4px rgba(251,191,36,0.7)"
              : "0 0 24px -6px rgba(94,234,212,0.6)"
          }
          _hover={{ transform: "scale(1.05)" }}
          transition="all 0.25s ease"
        />
      </Box>
    </Tooltip>
  );
};

export default RecorderMicButton;