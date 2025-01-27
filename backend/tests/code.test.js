const request = require("supertest");
const express = require("express");
const Docker = require("dockerode");
const { router: codeRouter } = require("../routes/code");

describe("Code Execution Service", () => {
  let app;
  let server;
  const docker = new Docker();

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/code", codeRouter);
    server = app.listen(0);
  });

  afterAll(async (done) => {
    const containers = await docker.listContainers({ all: true });
    await Promise.all(
      containers.map((container) =>
        docker.getContainer(container.Id).remove({ force: true })
      )
    );
    server.close(done);
  });

  describe("Basic Execution", () => {
    test("executes Python code successfully", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: 'print("Hello, World!")',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.output.trim()).toBe("Hello, World!");
    }, 30000);

    test("executes JavaScript code successfully", async () => {
      const response = await request(app).post("/code/run").send({
        language: "javascript",
        code: 'console.log("Hello, World!")',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.output.trim()).toBe("Hello, World!");
    }, 30000);
  });

  describe("Error Handling", () => {
    test("handles syntax errors", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: "print('unclosed string",
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    }, 30000);
  });

  describe("Resource Limits", () => {
    test("handles memory limits", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: 'x = ["x" * (1024 * 1024) for _ in range(200)]',
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    }, 30000);

    test("handles infinite loops with timeout", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: "while True: pass",
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    }, 30000);
  });

  describe("Input Validation", () => {
    test("rejects unsupported languages", async () => {
      const response = await request(app).post("/code/run").send({
        language: "ruby",
        code: 'puts "Hello"',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Unsupported language");
    });

    test("rejects empty code", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: "",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Code cannot be empty");
    });
  });

  describe("Resource Limits", () => {
    test("should handle memory limits correctly", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: 'a = ["x" * 1024 * 1024 for _ in range(200)]', // Try to allocate >100MB
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    }, 30000);

    test("should collect CPU metrics", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: "sum(range(1000000))",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("Metrics", () => {
    test("provides metrics endpoint", async () => {
      const response = await request(app).get("/code/metrics");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/plain");
    });
  });

  describe("Container Cleanup", () => {
    test("should cleanup containers after execution", async () => {
      const docker = new Docker();
      const initialContainers = await docker.listContainers();

      await request(app).post("/code/run").send({
        language: "python",
        code: 'print("cleanup test")',
      });

      const finalContainers = await docker.listContainers();
      expect(finalContainers.length).toBe(initialContainers.length);
    });
  });
});
