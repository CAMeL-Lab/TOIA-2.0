FROM node:16.13-alpine3.15
RUN apk --no-cache add --virtual .builds-deps build-base python3

RUN apk add sox

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

ENTRYPOINT ["node", "app.js"]