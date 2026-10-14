import { IconButton } from "@chakra-ui/react";
import React from "react";
import { HiSwitchHorizontal } from "react-icons/hi";

const SwitchLangButton = ({ onClick }) => {
  return (
    <IconButton
      isRound={true}
      size="lg"
      bgGradient="linear(to-br, signal.azure, signal.cyan)"
      color="void.900"
      fontSize={{ base: "xl", md: "2xl" }}
      icon={<HiSwitchHorizontal />}
      onClick={onClick}
      boxShadow="0 0 20px -4px rgba(94,234,212,0.6)"
      _hover={{
        transform: "scale(1.08) rotate(180deg)",
        boxShadow: "0 0 28px -2px rgba(94,234,212,0.8)",
      }}
      transition="transform 0.4s ease, box-shadow 0.4s ease"
    />
  );
};

export default SwitchLangButton;