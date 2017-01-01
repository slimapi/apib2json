FROM node:7.3-alpine
MAINTAINER Petr Bugyík

ENV PROJECT_ROOT /src/apib2json
ENV PATH ${PROJECT_ROOT}/bin:$PATH

WORKDIR ${PROJECT_ROOT}

RUN apk add --update \
    python \
    make \
    g++ \
  && rm -rf /var/cache/apk/*

ADD package.json .
ADD npm-shrinkwrap.json .
RUN npm install --production && \
    rm -rf /root/.npm && \
    npm cache clear

COPY . .

ENTRYPOINT ["apib2json"]
