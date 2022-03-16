FROM node:14-alpine AS REACT_BUILD

WORKDIR /app
COPY interface/package.json .
RUN npm install
COPY interface/ .

RUN npm run-script build

RUN node css-fix.js

FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install python3-pip -y

RUN DEBIAN_FRONTEND='noninteractive' apt install nodejs -y
RUN apt install npm -y
RUN apt install sox -y

RUN apt install wget -y
RUN npm install -g n
RUN n 14.18.1

WORKDIR /app

COPY server/package.json .

RUN npm install

COPY server/ .
# Copy React Files
COPY --from=REACT_BUILD /app/build interface/build

ENTRYPOINT ["node", "app.js"]