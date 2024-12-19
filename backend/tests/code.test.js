const request = require("supertest");
const express = require("express");
const Docker = require("dockerode");
const codeRouter = require("..routes/code");

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

  afterAll((done) => {
    docker
      .listContainers({ all: true })
      .then((containers) => {
        return Promise.all(
          containers.map((container) =>
            docker.getContainer(container.Id).remove({ force: true })
          )
        );
      })
      .then(() => server.close(done))
      .catch(done);
  });

  describe("Language Support", () => {
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
    test("handles syntax errors in Python", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: 'print("Unclosed string',
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("SyntaxError");
    }, 30000);

    test("handles syntax errors in JavaScript", async () => {
      const response = await request(app).post("/code/run").send({
        language: "javascript",
        code: 'console.log("Unclosed string',
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("SyntaxError");
    }, 30000);
  });

  describe("Resource Limits", () => {
    test("handles infinite loops with timeout", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: "while True: pass",
      });

      expect(response.status).toBe(408);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("timed out");
    }, 30000);

    test("handles memory limits", async () => {
      const response = await request(app).post("/code/run").send({
        language: "python",
        code: 'x = ["x" * 1000000 for _ in range(1000000)]',
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
});
