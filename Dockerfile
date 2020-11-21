
# No bash, can still use once confident
# FROM node:alpine

FROM node:current-alpine

RUN mkdir -p /app/server

WORKDIR /app/server
s
COPY package*.json /app/server/

RUN npm install

COPY . /app/server/

EXPOSE 4003

CMD ["npm", "run", "start:prod"]