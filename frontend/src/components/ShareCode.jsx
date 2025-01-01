import React, { useState } from "react";
import { Button, Snackbar } from "@mui/material";

const ShareCode = ({ code, language }) => {
  const [open, setOpen] = useState(false);

  const handleShare = () => {
    const url = new URL(window.location);
    url.searchParams.set("code", btoa(code));
    url.searchParams.set("language", language);
    navigator.clipboard.writeText(url.toString());
    setOpen(true);
  };

  return (
    <>
      <Button variant="outlined" onClick={handleShare}>
        Share Code
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        message="Link copied to clipboard"
      />
    </>
  );
};

export default ShareCode;
