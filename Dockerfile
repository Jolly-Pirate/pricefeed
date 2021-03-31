FROM node:12

RUN apt-get update && apt-get -y install sudo
RUN npm i npm@latest -g 
#RUN npm i forever -g # fixed with sudoers and preinstalled in package.json

RUN useradd -ms /bin/bash pricefeed -G sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

COPY package*.json ./
RUN npm install #&& npm audit fix
#COPY . .
CMD forever --minUptime 1000 --spinSleepTime 10000 -m 10 app/app.js

USER pricefeed
WORKDIR /home/pricefeed
