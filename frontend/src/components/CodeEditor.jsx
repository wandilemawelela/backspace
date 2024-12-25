import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Box, Button, Select, MenuItem, Paper } from "@mui/material";
import axios from "axios";
import ErrorHandler from "./ErrorHandler";
import LoadingSpinner from "./LoadingSpinner";
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

const CodeEditor = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/code/run`, {
        language,
        code,
      });
      if (response.data.success) {
        setOutput(response.data.output);
      } else {
        setError({ message: response.data.error || "Execution failed" });
      }
    } catch (error) {
      console.error("Execution error:", error);
      setError({
        message: error.response?.data?.error || "Server connection failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <ErrorHandler error={error} onClose={() => setError(null)} />
      <Box sx={{ mb: 2 }}>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          sx={{ mr: 2 }}
        >
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="javascript">JavaScript</MenuItem>
        </Select>
        <Button variant="contained" onClick={handleExecute} disabled={loading}>
          Run Code
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={setCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </Paper>

      <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <pre>{output}</pre>
      </Paper>
    </Box>
  );
};

export default CodeEditor;
