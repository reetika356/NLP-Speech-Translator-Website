import { HStack, Text, Box } from "@chakra-ui/react";
import React from "react";

const Logo = () => {
  return (
    <HStack spacing={2} alignSelf="center" w="max-content">
      <HStack spacing="2px" align="center" h="18px">
        {[6, 12, 8, 16, 6].map((h, i) => (
          <Box
            key={i}
            w="2px"
            h={`${h}px`}
            borderRadius="full"
            bgGradient="linear(to-t, signal.azure, signal.cyan)"
          />
        ))}
      </HStack>
      <Text
        fontFamily="heading"
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="700"
        letterSpacing="tight"
        color="ink.100"
      >
        HearLink
      </Text>
    </HStack>
  );
};

export default Logo;