const { metrics, logger } = require("../services/monitoring");

const monitorExecution = async (req, res, next) => {
  const start = Date.now();
  const { language } = req.body;

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    metrics.executionDuration.labels(language).observe(duration);
    metrics.executionCount.labels(language, res.statusCode).inc();

    logger.info("Code execution completed", {
      language,
      duration,
      status: res.statusCode,
    });
  });

  next();
};

module.exports = { monitorExecution };
