import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { Box } from "@chakra-ui/react";
import Providers from "./providers";
import React from "react";

const HomeLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Box minH="100vh" bg="surface.base">
            <Nav />
            {children}
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
  );
};

export default HomeLayout;