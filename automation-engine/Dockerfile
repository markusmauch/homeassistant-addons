FROM denoland/deno:alpine

RUN apk add --no-cache npm curl jq bash

# bashio
ARG BASHIO_VERSION="v0.16.0"
RUN curl -J -L -o /tmp/bashio.tar.gz \
    "https://github.com/hassio-addons/bashio/archive/${BASHIO_VERSION}.tar.gz" \
    && mkdir /tmp/bashio \
    && tar zxvf /tmp/bashio.tar.gz --strip 1 -C /tmp/bashio \
    && mv /tmp/bashio/lib /usr/lib/bashio \
    && ln -s /usr/lib/bashio/bashio /usr/bin/bashio

# pm2
RUN npm install pm2 -g

# frontend
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
RUN npm install -D webpack-cli
COPY frontend/tsconfig.json ./
COPY frontend/webpack.config.js ./
COPY frontend/public ./public
COPY frontend/src ./src

RUN ./node_modules/.bin/webpack

#backend
WORKDIR /app/backend
COPY backend ./
# TODO

# app
WORKDIR /app
COPY run.sh /app/
RUN chmod a+x run.sh
CMD [ "/app/run.sh" ]