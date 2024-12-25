import React, { useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import axios from "axios";
import ErrorHandler from "./ErrorHandler";
import LoadingSpinner from "./LoadingSpinner";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

const initialState = {
  language: "python",
  code: "# Write your Python code here\nprint('Hello, World!')",
  output: "",
  loading: false,
  error: null,
  executionTime: null,
  history: [],
  backendStatus: "checking",
};

const CodeEditor = () => {
  const theme = useTheme();
  const [state, setState] = useState(initialState);

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        await axios.get(`${BACKEND_URL}/health`);
        updateState({ backendStatus: "online" });
      } catch (error) {
        updateState({ backendStatus: "offline" });
      }
    };

    checkBackendStatus();
    const statusInterval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(statusInterval);
  }, [updateState]);

  const handleExecute = useCallback(async () => {
    updateState({ loading: true, error: null });
    const startTime = performance.now();

    try {
      const response = await axios.post(`${BACKEND_URL}/code/run`, {
        language: state.language,
        code: state.code,
      });

      const executionTime = (performance.now() - startTime) / 1000;

      if (response.data.output) {
        updateState({
          output: response.data.output,
          executionTime,
          history: [
            {
              code: state.code,
              language: state.language,
              timestamp: new Date().toISOString(),
              output: response.data.output,
            },
            ...state.history.slice(0, 9),
          ],
        });
      } else {
        throw new Error(response.data.error || "No output received");
      }
    } catch (error) {
      updateState({
        error: {
          message:
            error.response?.data?.error || error.message || "Execution failed",
        },
      });
    } finally {
      updateState({ loading: false });
    }
  }, [state.code, state.language, state.history, updateState]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleExecute();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleExecute]);

  const handleReset = useCallback(() => {
    updateState({
      code: initialState.code,
      output: "",
      error: null,
      executionTime: null,
    });
  }, [updateState]);

  return (
    <Box
      sx={{ p: 2, height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Select
          value={state.language}
          onChange={(e) => updateState({ language: e.target.value })}
          size="small"
        >
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="javascript">JavaScript</MenuItem>
        </Select>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={state.language}
          value={state.code}
          onChange={(value) => updateState({ code: value })}
          theme={theme.palette.mode === "dark" ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            lineNumbers: "on",
            folding: true,
            automaticLayout: true,
          }}
        />
      </Box>

      <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
        <Button
          variant="contained"
          onClick={handleExecute}
          disabled={state.loading || state.backendStatus !== "online"}
        >
          Run Code (Ctrl+Enter)
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
        {state.backendStatus === "offline" && (
          <Typography color="error" variant="body2">
            Backend server is offline
          </Typography>
        )}
      </Box>

      {state.loading && <LoadingSpinner />}
      <ErrorHandler
        error={state.error}
        onClose={() => updateState({ error: null })}
      />

      {(state.output || state.error) && (
        <Paper
          sx={{
            mt: 2,
            p: 2,
            bgcolor: state.error ? "error.light" : "background.paper",
            maxHeight: "30vh",
            overflow: "auto",
          }}
        >
          <Typography component="pre" sx={{ m: 0, fontFamily: "monospace" }}>
            {state.output || state.error?.message}
          </Typography>
          {state.executionTime && (
            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
              Execution time: {state.executionTime.toFixed(3)}s
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CodeEditor;
