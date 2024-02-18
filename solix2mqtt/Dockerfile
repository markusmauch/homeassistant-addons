# ARG BUILD_FROM
# FROM ${BUILD_FROM}

FROM alpine:3.17
RUN apk add --no-cache git curl jq bash mosquitto-clients python3 py3-pip
RUN pip install cryptography aiohttp paho-mqtt --break-system-packages

ARG BASHIO_VERSION="v0.16.0"
RUN curl -J -L -o /tmp/bashio.tar.gz \
    "https://github.com/hassio-addons/bashio/archive/${BASHIO_VERSION}.tar.gz" \
    && mkdir /tmp/bashio \
    && tar zxvf /tmp/bashio.tar.gz --strip 1 -C /tmp/bashio \
    && mv /tmp/bashio/lib /usr/lib/bashio \
    && ln -s /usr/lib/bashio/bashio /usr/bin/bashio

WORKDIR /solix2mqtt
COPY bin ./
COPY run.sh ./
RUN chmod a+x run.sh
CMD [ "./run.sh" ]