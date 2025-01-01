const express = require("express");
const router = express.Router();
const promClient = require("prom-client");
const Docker = require("dockerode");

const docker = new Docker();

router.get("/", async (req, res) => {
  try {
    // Check Docker service
    await docker.ping();
    
    // Get system metrics
    const metrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      containers: await docker.listContainers(),
    };

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      metrics
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 