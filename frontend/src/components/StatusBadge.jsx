import React, { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import axios from "axios";

const StatusBadge = () => {
  const [status, setStatus] = useState("checking");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

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

export default StatusBadge;
