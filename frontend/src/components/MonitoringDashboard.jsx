import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Grid, Paper, Typography } from '@mui/material';
import axios from 'axios';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState({
    executionTimes: [],
    memoryUsage: [],
    cpuUsage: [],
    errorRates: []
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await axios.get('/api/metrics');
      setMetrics(response.data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Execution Times</Typography>
          <Line data={metrics.executionTimes} />
        </Paper>
      </Grid>
      {/* Additional metric charts */}
    </Grid>
  );
}; 