import React, { useEffect, useState } from "react";
import { Chip } from "@mui/material";

const StatusBadge = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axios.get(`${BACKEND_URL}/health`);
        setStatus("online");
      } catch {
        setStatus("offline");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Chip
      label={status}
      color={status === "online" ? "success" : "error"}
      size="small"
    />
  );
};
