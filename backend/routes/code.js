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
 *     responses:
 *       200:
 *         description: Code executed successfully
 *       400:
 *         description: Invalid input
 *       408:
 *         description: Execution timeout
 *       500:
 *         description: Server error
 */

const express = require("express");
const Docker = require("dockerode");
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
      javascript: { image: "node:14" },
      python: { image: "python:3.8" },
    };

    try {
      container = await docker.createContainer({
        Image: images[language].image,
        Cmd:
          language === "python" ? ["python", "-c", code] : ["node", "-e", code],
        Tty: false,
        HostConfig: {
          AutoRemove: false, // Changed to false for proper cleanup
          Memory: 100 * 1024 * 1024,
          NanoCPUs: 1e9,
          NetworkMode: "none",
        },
      });

      await container.start();

      // Wait for container to initialize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const stats = await container.stats({ stream: false });
        if (stats && stats.memory_stats && stats.cpu_stats) {
          metrics.memoryUsage
            .labels(container.id)
            .set(stats.memory_stats.usage || 0);
          metrics.cpuUsage.labels(container.id).set(calculateCPUPercent(stats));
        }
      } catch (statsError) {
        logger.warn("Failed to collect container stats", {
          error: statsError.message,
        });
      }

      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Code execution timed out"));
        }, TIMEOUT_MS);
      });

      const stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
      });

      let output = "";
      try {
        await Promise.race([
          new Promise((resolve, reject) => {
            stream.on("data", (data) => {
              output += data
                .toString("utf8")
                .replace(/[\u0000-\u0008\u000B-\u001F]/g, "");
            });
            stream.on("end", resolve);
            stream.on("error", reject);
          }),
          timeoutPromise,
        ]);

        clearTimeout(timeoutId);

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
      // Enhanced cleanup
      if (container) {
        try {
          await container.stop({ t: 0 });
          await new Promise((resolve) => setTimeout(resolve, 1000));
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

      const status = error.message.includes("timed out") ? 408 : 500;
      res.status(status).json({
        success: false,
        error: error.message,
      });
    }
  }
);

module.exports = router;
