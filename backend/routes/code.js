const express = require("express");
const Docker = require("dockerode");
const router = express.Router();
const docker = new Docker();

router.post("/run", async (req, res) => {
  const { language, code } = req.body;

  // Map language to Docker image
  const images = {
    javascript: "node:14",
    python: "python:3.8",
    // Add more languages as needed
  };

  if (!images[language]) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const image = images[language];
  const scriptPath = "/usr/src/app/script";

  const container = await docker.createContainer({
    Image: image,
    Cmd: [
      "bash",
      "-c",
      `echo "${code}" > ${scriptPath} && ${getRunCommand(
        language,
        scriptPath
      )}`,
    ],
    Tty: false,
  });

  await container.start();

  container.logs(
    { stdout: true, stderr: true, follow: true },
    (err, stream) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let output = "";
      stream.on("data", (data) => {
        output += data.toString();
      });

      stream.on("end", () => {
        container.remove();
        res.json({ output });
      });
    }
  );
});

function getRunCommand(language, scriptPath) {
  switch (language) {
    case "javascript":
      return `node ${scriptPath}`;
    case "python":
      return `python ${scriptPath}`;
    // Add more languages as needed
    default:
      return "";
  }
}

module.exports = router;
