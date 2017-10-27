FROM node:8.8-alpine
MAINTAINER Petr Bugyík

ENV PROJECT_ROOT /src/apib2json
ENV PATH ${PROJECT_ROOT}/bin:$PATH

WORKDIR ${PROJECT_ROOT}

RUN apk add --no-cache \
    python \
    make \
    g++

ADD package.json .
ADD package-lock.json .
RUN npm install --production && \
    npm cache --force clean

COPY . .

ENTRYPOINT ["apib2json"]
