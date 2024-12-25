import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Box, Button, Select, MenuItem, Paper } from "@mui/material";
import axios from "axios";
import ErrorHandler from "./ErrorHandler";
import LoadingSpinner from "./LoadingSpinner";
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
const initialCode = {
  python: '# Write your Python code here\nprint("Hello World!")',
  javascript: '// Write your JavaScript code here\nconsole.log("Hello World!")',
};

const CodeEditor = () => {
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [code, setCode] = useState(initialCode.python);
  const [executionTime, setExecutionTime] = useState(null);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setExecutionTime(null);
    const startTime = performance.now();
    try {
      const response = await axios.post(`${BACKEND_URL}/code/run`, {
        language,
        code,
      });
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
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

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(initialCode[newLang]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <ErrorHandler error={error} onClose={() => setError(null)} />
      <LoadingSpinner isLoading={loading} />
      <Box sx={{ mb: 2 }}>
        <Select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
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

      <Paper sx={{ p: 2, bgcolor: error ? "#fde8e8" : "#f5f5f5" }}>
        <pre style={{ margin: 0, color: error ? "#c62828" : "inherit" }}>
          {output || "No output"}
        </pre>
        {executionTime !== null && (
          <Box sx={{ mt: 1 }}>
            <strong>Execution Time:</strong> {executionTime.toFixed(2)} ms
          </Box>
        )}
      </Paper>
      <Button
        variant="outlined"
        onClick={() => {
          setCode(initialCode[language]);
          setOutput("");
          setError(null);
          setExecutionTime(null);
        }}
        sx={{ ml: 1 }}
      >
        Reset
      </Button>
    </Box>
  );
};

export default CodeEditor;
