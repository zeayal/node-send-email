FROM node:14-slim
# Create app directory
WORKDIR /usr/src/app/node-send-email

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./


RUN npm config set registry https://registry.npm.taobao.org
RUN npm i

# Bundle app source
COPY . .

RUN npm install pm2 -g

EXPOSE 8080

CMD ["pm2", "start ./src/index.js --name app"]