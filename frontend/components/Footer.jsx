import { HStack, Text, Box } from "@chakra-ui/react";
import React from "react";

const Footer = () => {
  return (
    <HStack
      justify="center"
      spacing={2}
      py={5}
      w="full"
      borderTop="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(10,14,19,0.5)"
    >
      <Box w="6px" h="6px" borderRadius="full" bg="signal.cyan" />
      <Text fontFamily="mono" fontSize="xs" color="ink.400" letterSpacing="wide">
        HearLink · prototype build
      </Text>
    </HStack>
  );
};

export default Footer;