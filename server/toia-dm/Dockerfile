FROM ubuntu:20.04

ENV FLASK_RUN_HOST 0.0.0.0
RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install python3-pip -y

COPY requirements.txt /app/

WORKDIR /app

RUN apt-get install libmysqlclient-dev -y
RUN pip3 install -r requirements.txt
# RUN python3 -m spacy download en_core_web_lg
RUN apt-get install python3-mysqldb -y

COPY . /app

EXPOSE 5001

ENTRYPOINT ["python3"]
CMD ["main.py"]