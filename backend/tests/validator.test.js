const request = require("supertest");
const express = require("express");
const { validateCode, validate } = require("../middleware/validator");

describe("Code Validator", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post("/test", validateCode, validate, (req, res) => {
      res.json({ success: true });
    });
  });

  describe("Language Validation", () => {
    test("should reject missing language", async () => {
      const response = await request(app)
        .post("/test")
        .send({ code: 'console.log("test")' });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Language is required");
    });

    test("should reject invalid language type", async () => {
      const response = await request(app)
        .post("/test")
        .send({ language: 123, code: "test" });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Language must be a string");
    });

    test("should reject unsupported language", async () => {
      const response = await request(app)
        .post("/test")
        .send({ language: "ruby", code: 'puts "test"' });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Unsupported language");
    });
  });

  describe("Code Validation", () => {
    test("should reject missing code", async () => {
      const response = await request(app)
        .post("/test")
        .send({ language: "python" });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Code is required");
    });

    test("should reject empty code", async () => {
      const response = await request(app)
        .post("/test")
        .send({ language: "python", code: "" });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toBe("Code cannot be empty");
    });

    test("should reject code exceeding length limit", async () => {
      const response = await request(app)
        .post("/test")
        .send({
          language: "python",
          code: "x".repeat(1001),
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].msg).toContain("maximum length");
    });

    test("should reject harmful code patterns", async () => {
      const harmfulPatterns = [
        "process.env.SECRET",
        'require("fs")',
        "import os",
        'open("/etc/passwd")',
        'eval("alert(1)")',
        'exec("rm -rf /")',
      ];

      for (const code of harmfulPatterns) {
        const response = await request(app)
          .post("/test")
          .send({ language: "python", code });

        expect(response.status).toBe(400);
        expect(response.body.errors[0].msg).toBe(
          "Code contains potentially harmful patterns"
        );
      }
    });
  });

  test("should accept valid request", async () => {
    const response = await request(app).post("/test").send({
      language: "python",
      code: 'print("Hello World")',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
