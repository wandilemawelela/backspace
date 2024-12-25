import React from "react";
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
