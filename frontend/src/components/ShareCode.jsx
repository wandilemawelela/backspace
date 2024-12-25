import React from "react";
import { Button, Snackbar } from "@mui/material";

const ShareCode = ({ code, language }) => {
  const handleShare = () => {
    const url = new URL(window.location);
    url.searchParams.set("code", btoa(code));
    url.searchParams.set("language", language);
    navigator.clipboard.writeText(url.toString());
  };

  return (
    <Button variant="outlined" onClick={handleShare}>
      Share Code
    </Button>
  );
};
