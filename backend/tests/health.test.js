const request = require("supertest");
const express = require("express");
const healthRouter = require("../routes/health");

describe("Health Check Endpoint", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use("/health", healthRouter);
  });

  test("should return healthy status when all services are up", async () => {
    const response = await request(app).get("/health");
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("metrics");
  });

  test("should include system metrics in response", async () => {
    const response = await request(app).get("/health");
    
    expect(response.body.metrics).toHaveProperty("memory");
    expect(response.body.metrics).toHaveProperty("uptime");
    expect(response.body.metrics).toHaveProperty("containers");
  });
}); 