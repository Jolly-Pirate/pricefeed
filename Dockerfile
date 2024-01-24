FROM node:18.17-alpine

COPY package*.json ./
RUN node -v && npm install -g npm@latest && npm install

WORKDIR /home/pricefeed

CMD pm2-runtime start app/app.js --env production
