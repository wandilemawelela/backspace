import React from "react";
import { IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

const ThemeSwitcher = ({ isDark, onToggle }) => (
  <IconButton onClick={onToggle} color="inherit">
    {isDark ? <Brightness7 /> : <Brightness4 />}
  </IconButton>
);

export default ThemeSwitcher;
