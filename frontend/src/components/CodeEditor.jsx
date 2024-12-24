import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Box, Button, Select, MenuItem, Paper } from "@mui/material";
import axios from "axios";

const CodeEditor = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/code/run", {
        language,
        code,
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput(error.response?.data?.error || "Execution failed");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 2 }}>
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
