import { getOptions } from "@/common_functions/translationAPIServices";
import { Stack } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import Selection from "./Selection";
import SwitchLangButton from "./SwitchLangButton";
import { TranslationContext } from "./TranslationContext";

const LaguageSelector = () => {
  const { state, dispatch } = useContext(TranslationContext);
  const [options, setOptions] = useState({});
  const fetchOptions = async () => {
    const optionsData = await getOptions();
    setOptions(optionsData);
  };
  useEffect(() => {
    fetchOptions();
  }, []);
  return (
    <Stack
      direction="row"
      align="center"
      spacing={{ base: "2", md: "6" }}
      bg="rgba(255,255,255,0.04)"
      backdropFilter="blur(16px)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      p={{ base: "3", sm: "5", md: "6" }}
      borderRadius="full"
      justifyContent="space-between"
      width={{ base: "full", sm: "md", md: "xl" }}
      boxShadow="0 0 40px -20px rgba(94,234,212,0.25)"
    >
      <Selection
        options={options}
        value={state.sourceLanguage}
        setValue={(value) =>
          dispatch({ type: "SET_SOURCE_LANGUAGE", payload: value })
        }
        placeholder="Select source"
      />
      <SwitchLangButton onClick={() => dispatch({ type: "SWAP_LANGUAGES" })} />
      <Selection
        options={options}
        value={state.destinationLanguage}
        setValue={(value) =>
          dispatch({ type: "SET_DESTINATION_LANGUAGE", payload: value })
        }
        placeholder="Select destination"
      />
    </Stack>
  );
};

export default LaguageSelector;