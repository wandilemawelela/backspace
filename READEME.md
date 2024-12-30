# Kudu: The open-source web-based code execution platform with a client-server architecture that provides secure, containerized code execution.

## Overview

Kudu is a robust, containerized code execution platform that enables secure running of code snippets in isolated environments. It features a React-based frontend with Monaco editor integration and a Node.js/Express backend that orchestrates Docker containers for code execution.

## Architecture

### Frontend (`frontend/`)

- Tech Stack: React 18, Material-UI, Monaco Editor
- Key Components:
  - `CodeEditor.jsx`: Main editor interface with real-time code execution
  - `ErrorHandler.js`: Global error boundary and error display
  - `LoadingSpinner.js`: Execution state indicator
  - `ThemeSwitcher.jsx`: Dark/light mode toggle

### Backend (`backend/`)

- Tech Stack: Node.js, Express, Dockerode
- Core Modules:
  - `routes/code.js`: Code execution endpoint handlers
  - `middleware/validator.js`: Input validation and security checks
  - `services/monitoring.js`: Prometheus metrics and logging
  - `utils/metrics.js`: Container resource monitoring

## Features

### Code Execution

```
// Resource limits per container
const containerConfig = {
  Memory: 100 * 1024 * 1024,  // 100MB
  NanoCPUs: 1e9,              // 1 CPU core
  NetworkMode: "none"         // Network isolation
};
```

### Security

```
// Blocked patterns from validator.js
const blockedPatterns = [
  /process\.env/i,
  /require\s*\(/i,
  /import\s+(?:os|sys|subprocess)/i,
  /open\s*\(/i,
  /eval\s*\(/i,
  /exec\s*\(/i
];
```

### Monitoring

```
// Prometheus metrics
const metrics = {
  executionDuration: new promClient.Histogram({
    name: "code_execution_duration_seconds",
    help: "Duration of code execution in seconds",
    labelNames: ["language"]
  }),
  memoryUsage: new promClient.Gauge({
    name: "container_memory_usage_bytes",
    help: "Memory usage of containers",
    labelNames: ["container_id"]
  })
};
```

## Installation

### Prerequisites

- Docker Engine 20.10+
- Node.js 16+
- npm 7+

### Local Development Setup

```
# Clone repository
git clone https://github.com/wandilemawelela/kudu.git
cd kudu

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Start development servers
# Terminal 1:
cd frontend && npm start

# Terminal 2:
cd backend && npm start
```

### Docker Deployment

```
# Build and run with docker-compose
docker-compose up --build
```

## Configuration

### Environment Variables

### Backend (`backend/`)

```
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend/`)

```
REACT_APP_BACKEND_URL=http://localhost:3001
```

### Docker Configuration

```
services:
  backend:
    build:
      context: ./backend
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "3001:3001"

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
```

## API Documentation

### Code Execution Endpoint

```
POST /code/run
Content-Type: application/json

{
  "language": "python|javascript",
  "code": "string"
}
```

### Response Format

```
{
  "success": true,
  "output": "string",
  "executionTime": 0.123
}
```

## Security Consideration

1. Container Isolation

- Memory limits: 100MB per container
- CPU limits: 1 core
- Network access: Disabled
- Auto-removal: Containers destroyed after execution

2. Code Validation

- Blocked patterns prevention
- Maximum code length enforcement
- Language-specific restrictions

3. Rate Limiting

- Request limits per IP
- Execution timeouts
- Resource quotas

## Monitoring and Metrics

### Prometheus Metrics

- Execution duration
- Memory usage
- CPU utilization
- Error rates
- Container lifecycle events

### Logging

```
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" })
  ]
});
```

## Testing

### Beckend Tests

```
cd backend
npm test
```

Key test suites:

-
-

### Frontend Tests

### Performance Optimization

1. Container Management

- Container pooling
- Resource cleanup
- Cache optimization

2. Frontend Optimization

- Code editor performance
- Request debouncing
- Error handling

### License

MIT License - see `LICENSE` for details

### Minimum Requirements

- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- Docker Engine 20.10+
- Node.js 16+

### Recommended Requirements

- CPU: 4+ cores
- RAM: 8GB+
- Storage: 40GB+
- SSD storage
- Docker Engine 20.10+
- Node.js 16+
