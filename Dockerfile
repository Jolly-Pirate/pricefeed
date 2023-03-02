FROM node:lts-slim

RUN useradd -ms /bin/bash pricefeed -G sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

COPY package*.json ./
RUN npm install && npm install -g pm2 npm@9.5.1

USER pricefeed
WORKDIR /home/pricefeed

CMD pm2-runtime start app/app.js --env production
