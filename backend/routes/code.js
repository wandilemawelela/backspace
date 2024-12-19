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

const router = express.Router();
const docker = new Docker();

router.post("/run", validateCode, validate, async (req, res) => {
  const { language, code } = req.body;
  let container = null;

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
        AutoRemove: true,
        Memory: 100 * 1024 * 1024, // 100MB memory limit
        NanoCPUs: 1e9, // 1 CPU
        NetworkMode: "none", // Disable network access
      },
    });

    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Code execution timed out"));
      }, TIMEOUT_MS);
    });

    await container.start();

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
      res.json({
        success: true,
        output: output.trim(),
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    if (container) {
      try {
        await container.stop();
        await container.remove({ force: true });
      } catch (cleanupError) {
        console.error("Container cleanup error:", cleanupError);
      }
    }

    const status = error.message.includes("timed out") ? 408 : 500;
    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
