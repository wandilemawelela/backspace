import React from "react";
import { Container, Typography, Box, AppBar, Toolbar } from "@mui/material";
import CodeEditor from "./components/CodeEditor";
import ErrorBoundary from "./components/ErrorHandler";
import StatusBadge from "./components/StatusBadge";

const App = () => {
  return (
    <>
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Kudu Code Execution Service
          </Typography>
          <StatusBadge />
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ my: 4 }}>
          <CodeEditor />
        </Box>
      </Container>
    </>
  );
};

export default App;
