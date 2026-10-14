import { extendTheme } from "@chakra-ui/react";

const colors = {
  void: {
    900: "#0A0E13",
    800: "#0F151D",
    700: "#141B24",
  },
  signal: {
    cyan: "#5EEAD4",
    azure: "#38BDF8",
    amber: "#FBBF24",
  },
  ink: {
    100: "#E7EDF3",
    400: "#8592A0",
    600: "#5B6672",
  },
};

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors,
  fonts: {
    heading: "var(--font-display), sans-serif",
    body: "var(--font-body), sans-serif",
    mono: "var(--font-mono), monospace",
  },
  styles: {
    global: {
      "html, body": {
        bg: "void.900",
        color: "ink.100",
        backgroundImage:
          "radial-gradient(60% 50% at 15% 0%, rgba(94,234,212,0.10) 0%, transparent 60%), radial-gradient(50% 40% at 100% 20%, rgba(56,189,248,0.08) 0%, transparent 60%)",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      },
      "*::selection": {
        background: "rgba(94,234,212,0.25)",
      },
    },
  },
});

export default theme;