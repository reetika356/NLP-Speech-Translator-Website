import { Box, CircularProgress, IconButton, Tooltip } from "@chakra-ui/react";
import React from "react";

const UtilityButton = ({
  icon,
  isLoading = false,
  onClick = () => {},
  color,
  isRound = true,
  variant = "ghost",
  loadColor = "signal.cyan",
  fontSize = "16px",
  tooltip,
  ...rest
}) => {
  const loading = (
    <CircularProgress
      thickness="6px"
      size="4"
      isIndeterminate
      color={loadColor}
    />
  );
  return (
    <Tooltip label={tooltip} bg="void.700" color="ink.100">
      <Box position="relative">
        <IconButton
          icon={isLoading ? loading : icon}
          isRound={isRound}
          size="sm"
          variant={variant}
          onClick={onClick}
          fontSize={fontSize}
          colorScheme={color}
          color="ink.400"
          _hover={{ bg: "whiteAlpha.100", color: "ink.100" }}
          p="2"
          {...rest}
        />
      </Box>
    </Tooltip>
  );
};

export default UtilityButton;