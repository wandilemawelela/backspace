FROM node:16-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies without updating npm globally
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

