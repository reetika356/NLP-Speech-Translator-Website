"use client";
import { Box, Stack, useDisclosure } from "@chakra-ui/react";
import React from "react";
import Logo from "./Logo";
import MenuButton from "./MenuButton";
import MenuLinks from "./MenuLinks";

const NavContainer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      justify="space-between"
      w="full"
      spacing={2}
      py={4}
      px={{ base: 4, md: 8 }}
      align="center"
      position="sticky"
      top="0"
      zIndex="10"
      bg="rgba(10,14,19,0.7)"
      backdropFilter="blur(14px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
    >
      <Stack
        align="center"
        direction="row"
        justify="space-between"
        w={{ base: "full", md: "max-content" }}
      >
        <Logo />
        <MenuButton isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
      </Stack>
      <Box display={{ base: isOpen ? "block" : "none", md: "block" }}>
        <MenuLinks />
      </Box>
    </Stack>
  );
};

export default NavContainer;