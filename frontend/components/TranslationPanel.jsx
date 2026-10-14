import {
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Box,
  keyframes,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import TranscriptionEditor from "./TranscriptionEditor";
import { TranslationContext } from "./TranslationContext";

// The traveling dot mirrors the real pipeline: audio flows from the source
// panel to the destination panel while a translation request is in flight.
const travel = keyframes`
  0% { left: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
`;

const TranslationPanel = () => {
  const {
    state,
    dispatch,
    sourceAudioRef,
    destinationAudioRef,
    playAudio,
    pauseAudio,
    resetAudio,
  } = useContext(TranslationContext);

  const sourceTranscriptionEditor = (
    <TranscriptionEditor
      title="Source"
      isEditable={true}
      value={state.sourceText}
      playAudio={playAudio}
      pauseAudio={pauseAudio}
      resetAudio={resetAudio}
      audioRef={sourceAudioRef}
      setEditingListener={(value) =>
        dispatch({ type: "SET_IS_EDITING", payload: value })
      }
      setValue={(value) =>
        dispatch({ type: "SET_SOURCE_TEXT", payload: value })
      }
      isLoding={state.isFetching}
    />
  );

  const destinationTranscriptionEditor = (
    <TranscriptionEditor
      title="Destination"
      isEditable={false}
      value={state.destinationText}
      playAudio={playAudio}
      pauseAudio={pauseAudio}
      resetAudio={resetAudio}
      audioRef={destinationAudioRef}
      isLoding={state.isFetching}
    />
  );

  return (
    <>
      <HStack spacing="10" display={{ base: "none", md: "flex" }}>
        {sourceTranscriptionEditor}
        <Box position="relative" w="10" h="1px" bg="whiteAlpha.200" alignSelf="center">
          {state.isFetching && (
            <Box
              position="absolute"
              top="-2px"
              w="5px"
              h="5px"
              borderRadius="full"
              bg="signal.cyan"
              boxShadow="0 0 8px 2px #5EEAD4"
              animation={`${travel} 1.1s linear infinite`}
            />
          )}
        </Box>
        {destinationTranscriptionEditor}
      </HStack>
      <Tabs display={{ base: "block", md: "none" }} variant="soft-rounded" colorScheme="cyan">
        <TabList display="flex" justifyContent="space-between">
          <Tab color="ink.400" _selected={{ color: "void.900", bg: "signal.cyan" }}>
            Source
          </Tab>
          <Tab color="ink.400" _selected={{ color: "void.900", bg: "signal.cyan" }}>
            Destination
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>{sourceTranscriptionEditor}</TabPanel>
          <TabPanel px={0}>{destinationTranscriptionEditor}</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default TranslationPanel;