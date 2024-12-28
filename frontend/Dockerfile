FROM node:20

WORKDIR /app

# Add docker group and set permissions
#RUN apt-get update && \
#    apt-get install -y docker.io && \
#    groupadd -g 999 docker && \
#    usermod -aG docker node

COPY package.json /app
RUN npm install -g npm@latest

COPY . /app

CMD ["npm", "start"]

