# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /app
RUN mkdir -p /app/files/srts
RUN mkdir -p /app/files/vtts
RUN mkdir -p /app/files/txts

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 5672

ENTRYPOINT ["python3"]
CMD ["rabbit.py"]
# CMD [ "python3", "rabbit.py"]