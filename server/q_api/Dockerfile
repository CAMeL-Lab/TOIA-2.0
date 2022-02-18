FROM ubuntu:20.04

ENV FLASK_RUN_HOST 0.0.0.0
RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install python3-pip -y
RUN apt install libncurses5 -y

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip3 install -r requirements.txt

COPY . /app
EXPOSE 5000

