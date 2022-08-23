FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install python3-pip -y

RUN DEBIAN_FRONTEND='noninteractive' apt install nodejs -y
RUN apt install npm -y
RUN npm install -g n
RUN apt install wget -y
RUN n 14.18.1

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "start"]