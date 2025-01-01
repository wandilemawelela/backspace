const Docker = require('dockerode');
const docker = new Docker();

const calculateCPUPercent = async (stats) => {
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const cpuPercent = (cpuDelta / systemDelta) * 100;
  return cpuPercent.toFixed(2);
};

module.exports = {
  calculateCPUPercent,
};
