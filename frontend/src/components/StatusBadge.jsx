import React, { useEffect, useState } from "react";
import { Chip, Tooltip } from "@mui/material";
import axios from "axios";

const StatusBadge = () => {
  const [status, setStatus] = useState({
    state: "checking",
    latency: null,
    lastCheck: null
  });
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = performance.now();
      try {
        await axios.get(`${BACKEND_URL}/health`);
        const latency = (performance.now() - startTime).toFixed(0);
        setStatus({
          state: "online",
          latency,
          lastCheck: new Date().toISOString()
        });
      } catch {
        setStatus({
          state: "offline",
          latency: null,
          lastCheck: new Date().toISOString()
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTooltipContent = () => {
    return `Status: ${status.state}
${status.latency ? `Latency: ${status.latency}ms` : ''}
Last Check: ${new Date(status.lastCheck).toLocaleTimeString()}`;
  };

  return (
    <Tooltip title={getTooltipContent()} arrow>
      <Chip
        label={`${status.state}${status.latency ? ` (${status.latency}ms)` : ''}`}
        color={status.state === "online" ? "success" : "error"}
        size="small"
      />
    </Tooltip>
  );
};

export default StatusBadge;
