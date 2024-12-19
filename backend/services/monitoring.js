const promClient = require("prom-client");
const winston = require("winston");

const metrics = {
  executionDuration: new promClient.Histogram({
    name: "code_execution_duration_seconds",
    help: "Duration of code execution in seconds",
    labelNames: ["language"],
  }),

  memoryUsage: new promClient.Gauge({
    name: "container_memory_usage_bytes",
    help: "Memory usage of containers",
    labelNames: ["container_id"],
  }),

  cpuUsage: new promClient.Gauge({
    name: "container_cpu_usage_percent",
    help: "CPU usage percentage of containers",
    labelNames: ["container_id"],
  }),

  executionCount: new promClient.Counter({
    name: "code_execution_total",
    help: "Total number of code executions",
    labelNames: ["language", "status"],
  }),
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

module.exports = { metrics, logger };
