import { Box } from "@chakra-ui/react";
import React from "react";

const NavLink = (props) => {
  const { children, link } = props;
  return (
    <Box
      as="a"
      px={3}
      py={1.5}
      rounded="full"
      _hover={{
        textDecoration: "none",
        bg: "whiteAlpha.100",
        color: "ink.100",
      }}
      color="ink.400"
      alignSelf="center"
      fontSize="sm"
      fontWeight="500"
      transition="background 0.2s ease, color 0.2s ease"
      href={link}
    >
      {children}
    </Box>
  );
};

export default NavLink;