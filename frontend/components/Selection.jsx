import { Select } from "@chakra-ui/react";
import React from "react";

const Selection = ({
  options,
  value,
  setValue,
  placeholder = "Please Select",
}) => {
  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      size={{ base: "md", md: "lg" }}
      textTransform="capitalize"
      fontFamily="mono"
      fontSize={{ base: "sm", md: "md" }}
      color="ink.100"
      bg="transparent"
      border="none"
      _focus={{ boxShadow: "none" }}
      sx={{
        option: { background: "#10151D", color: "#E7EDF3" },
      }}
      borderRadius="full"
      w={{ base: "28", md: "sm" }}
    >
      {Object.entries(options ?? {}).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </Select>
  );
};

export default Selection;