import React, { useState } from 'react';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');

  const runCode = async () => {
    const response = await fetch('http://localhost:3001/code/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language, code }),
    });

    const data = await response.json();
    setOutput(data.output);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Online Code Editor</h1>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          {/* Add more options as needed */}
        </select>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows="10" cols="50" />
        <button onClick={runCode}>Run Code</button>
        <pre>{output}</pre>
      </header>
    </div>
  );
}

export default App;

