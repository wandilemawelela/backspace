const { body, validationResult } = require("express-validator");

const MAX_CODE_LENGTH = 1000;
const TIMEOUT_MS = 5000;

const validateCode = [
  body("language")
    .exists()
    .withMessage("Language is required")
    .isString()
    .withMessage("Language must be a string")
    .custom((value) => {
      if (!["python", "javascript"].includes(value)) {
        throw new Error("Unsupported language");
      }
      return true;
    }),

  body("code")
    .exists()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be a string")
    .notEmpty()
    .withMessage("Code cannot be empty")
    .isLength({ max: MAX_CODE_LENGTH })
    .withMessage(`Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`)
    .custom((code) => {
      const blockedPatterns = [
        /process\.env/i,
        /require\s*\(/i,
        /import\s+(?:os|sys|subprocess)/i,
        /open\s*\(/i,
        /eval\s*\(/i,
        /exec\s*\(/i,
      ];

      if (blockedPatterns.some((pattern) => pattern.test(code))) {
        throw new Error("Code contains potentially harmful patterns");
      }
      return true;
    }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateCode,
  validate,
  TIMEOUT_MS,
  MAX_CODE_LENGTH,
};
