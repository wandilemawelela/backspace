const express = require("express");
const Docker = require("dockerode");
const router = express.Router();
const docker = new Docker();

router.post("/run", async (req, res) => {
  const { language, code } = req.body;

  const images = {
    javascript: { image: "node:14" },
    python: { image: "python:3.8" },
  };

  if (!images[language]) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const { image } = images[language];

  try {
    const container = await docker.createContainer({
      Image: image,
      Cmd:
        language === "python" ? ["python", "-c", code] : ["node", "-e", code],
      Tty: false,
      HostConfig: {
        AutoRemove: true,
      },
    });

    await container.start();

    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    let output = "";

    await new Promise((resolve, reject) => {
      stream.on("data", (chunk) => {
        // Remove control characters and convert to string
        output += chunk
          .toString("utf8")
          .replace(/[\u0000-\u0008\u000B-\u001F]/g, "");
      });

      stream.on("end", resolve);
      stream.on("error", reject);
    });

    res.json({
      output: output.trim(),
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
      success: false,
    });
  }
});

module.exports = router;
