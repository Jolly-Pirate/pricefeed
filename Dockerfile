FROM node:lts-slim

RUN useradd -ms /bin/bash pricefeed -G sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

COPY package*.json ./
RUN node -v && npm install -g npm@latest && npm install

USER pricefeed
WORKDIR /home/pricefeed

CMD pm2-runtime start app/app.js --env production
