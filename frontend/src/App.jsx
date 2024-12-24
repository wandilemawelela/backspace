import React from "react";
import { Container, Typography, Box } from "@mui/material";
import CodeEditor from "./components/CodeEditor";

const App = () => {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Code Execution Service
        </Typography>
        <CodeEditor />
      </Box>
    </Container>
  );
};

export default App;
