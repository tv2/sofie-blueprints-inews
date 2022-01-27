FROM node:12-alpine

RUN apk update
RUN apk add git

COPY . /opt/blueprints
WORKDIR /opt/blueprints/

RUN yarn install --production

CMD ["./docker-entrypoint.sh"]