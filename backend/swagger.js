const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Code Execution API',
      version: '1.0.0',
      description: 'API for executing code in isolated containers',
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
