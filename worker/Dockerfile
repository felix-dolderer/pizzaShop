FROM node:17.2.0-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install && npm cache clean --force

COPY . .

CMD [ "node", "automations.js" ]
