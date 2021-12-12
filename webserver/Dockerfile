FROM python:3.10.1-alpine

EXPOSE 5000

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

RUN pip install Flask \
  && pip install requests

COPY . .

ENTRYPOINT [ "python", "/usr/src/app/app.py" ]
