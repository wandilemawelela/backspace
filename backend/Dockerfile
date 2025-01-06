FROM node:16-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies with npm install instead of npm ci
RUN npm install

COPY . .

# Clean npm cache
RUN npm cache clean --force

EXPOSE 3001

CMD ["node", "index.js"]

