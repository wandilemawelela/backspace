// backend/tests/code.test.js
const request = require("supertest");
const express = require("express");
const Docker = require("dockerode");
const codeRouter = require("../routes/code");

const app = express();
const docker = new Docker();
app.use(express.json());
app.use("/code", codeRouter);

describe("Code Execution API", () => {
  jest.setTimeout(30000); // Increase global timeout

  const cleanupContainers = async () => {
    try {
      const containers = await docker.listContainers({ all: true });
      await Promise.all(
        containers.map(async (container) => {
          const containerInstance = docker.getContainer(container.Id);
          try {
            await containerInstance.stop();
          } catch (error) {
            // Container may already be stopped
          }
          try {
            await containerInstance.remove({ force: true });
          } catch (error) {
            // Container may already be removed
          }
        })
      );
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  beforeAll(async () => {
    await cleanupContainers();
  }, 30000);

  afterEach(async () => {
    await cleanupContainers();
  }, 30000);

  afterAll(async () => {
    await cleanupContainers();
    // Close Docker connection
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }, 30000);

  test("should execute Python code successfully", async () => {
    const response = await request(app).post("/code/run").send({
      language: "python",
      code: 'print("Hello, World!")',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.output.trim()).toBe("Hello, World!");
  }, 30000);

  test("should execute JavaScript code successfully", async () => {
    const response = await request(app).post("/code/run").send({
      language: "javascript",
      code: 'console.log("Hello, World!")',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.output.trim()).toBe("Hello, World!");
  }, 30000);

  test("should handle unsupported language", async () => {
    const response = await request(app).post("/code/run").send({
      language: "invalid",
      code: 'print("Hello")',
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Unsupported language");
  }, 30000);
});
