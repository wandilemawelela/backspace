import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";

const snippets = {
  python: {
    "Hello World": 'print("Hello World!")',
    "For Loop": "for i in range(10):\n    print(i)",
  },
  javascript: {
    "Hello World": 'console.log("Hello World!")',
    "For Loop": "for(let i = 0; i < 10; i++) {\n    console.log(i);\n}",
  },
};

const CodeSnippets = ({ onSelect, language }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code) => {
    onSelect(code);
    handleClose();
  };

  return (
    <>
      <Button onClick={handleClick}>
        Load Snippet
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {Object.entries(snippets[language] || {}).map(([name, code]) => (
          <MenuItem key={name} onClick={() => handleSelect(code)}>
            {name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CodeSnippets;
