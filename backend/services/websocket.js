const WebSocket = require('ws');
const { logger } = require('./monitoring');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      logger.info('New WebSocket connection established');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          // Handle different message types
          switch(data.type) {
            case 'execution_status':
              this.broadcastExecutionStatus(data);
              break;
            default:
              logger.warn('Unknown message type received', { type: data.type });
          }
        } catch (error) {
          logger.error('Error processing WebSocket message', { error: error.message });
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket connection closed');
      });
    });
  }

  broadcastExecutionStatus(data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = WebSocketService;
