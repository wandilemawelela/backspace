// routes/code.js
const express = require("express");
const Docker = require("dockerode");
const promClient = require("prom-client");
const {
  validateCode,
  validate,
  TIMEOUT_MS,
} = require("../middleware/validator");
const { metrics, logger } = require("../services/monitoring");
const { monitorExecution } = require("../middleware/monitoring");
const { calculateCPUPercent } = require("../utils/metrics");

const router = express.Router();
const docker = new Docker();

/**
 * @swagger
 * /code/run:
 *   post:
 *     summary: Execute code in isolated container
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - code
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [python, javascript]
 *               code:
 *                 type: string
 */
router.post(
  "/run",
  validateCode,
  validate,
  monitorExecution,
  async (req, res) => {
    const { language, code } = req.body;
    let container = null;
    const startTime = Date.now();

    const images = {
      javascript: { image: "node:14", memoryLimit: 100 * 1024 * 1024 },
      python: { image: "python:3.8", memoryLimit: 100 * 1024 * 1024 },
    };

    try {
      container = await docker.createContainer({
        Image: images[language].image,
        Cmd:
          language === "python" ? ["python", "-c", code] : ["node", "-e", code],
        Tty: false,
        HostConfig: {
          AutoRemove: false,
          Memory: images[language].memoryLimit,
          NanoCPUs: 1e9,
          NetworkMode: "none",
          OomKillDisable: false,
        },
      });

      await container.start();

      const stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
      });

      let output = "";
      let hasError = false;
      let timeoutId;

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Code execution timed out"));
        }, TIMEOUT_MS);
      });

      try {
        await Promise.race([
          new Promise((resolve, reject) => {
            stream.on("data", (data) => {
              const chunk = data.toString("utf8");
              const errorPatterns = [
                "SyntaxError",
                "ReferenceError",
                "MemoryError",
                "JavaScript heap out of memory",
                "Killed",
                "allocation failed",
                "MemoryError",
                "OutOfMemoryError",
              ];

              if (errorPatterns.some((pattern) => chunk.includes(pattern))) {
                hasError = true;
                reject(new Error("Memory limit exceeded or runtime error"));
              }
              output += chunk.replace(/[\u0000-\u0008\u000B-\u001F]/g, "");
            });
            stream.on("end", resolve);
            stream.on("error", reject);
          }),
          timeoutPromise,
        ]);

        clearTimeout(timeoutId);

        if (hasError) {
          throw new Error("Execution failed");
        }

        const duration = (Date.now() - startTime) / 1000;
        metrics.executionDuration.labels(language).observe(duration);
        metrics.executionCount.labels(language, "success").inc();

        res.json({
          success: true,
          output: output.trim(),
          executionTime: duration,
        });
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      if (container) {
        try {
          await container.stop({ t: 0 });
          await container.remove({ force: true });
        } catch (cleanupError) {
          logger.error("Container cleanup failed", {
            containerId: container.id,
            error: cleanupError.message,
          });
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      metrics.executionCount.labels(language, "error").inc();

      logger.error("Code execution failed", {
        language,
        error: error.message,
        duration,
      });

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.get("/metrics", async (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

module.exports = router;
