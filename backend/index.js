require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { router: codeRouter, ensureImages } = require("./routes/code");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const healthRouter = require("./routes/health");
const Docker = require("dockerode");

const app = express();
const port = process.env.PORT || 3001;

// Security middleware first
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  })
);

// Parse requests
app.use(bodyParser.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Routes
app.use("/code", codeRouter);
app.use("/health", healthRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  logger.error('Server error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Add this before starting the server
const initializeServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Check Docker connection
    const docker = new Docker();
    await docker.ping();
    console.log('Docker connection successful');

    // Initialize images
    console.log('Ensuring required images are available...');
    await ensureImages();
    console.log('Docker images initialized successfully');
    
    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    if (error.message.includes('connect ENOENT')) {
      console.error('Docker socket not found. Make sure Docker is running and the socket is accessible');
    }
    process.exit(1);
  }
};

initializeServer();

module.exports = app;
