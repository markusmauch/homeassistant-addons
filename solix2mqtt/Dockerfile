FROM node:21-alpine3.17
RUN apk add --no-cache git curl jq bash
ARG BASHIO_VERSION="v0.16.0"
RUN curl -J -L -o /tmp/bashio.tar.gz \
    "https://github.com/hassio-addons/bashio/archive/${BASHIO_VERSION}.tar.gz" \
    && mkdir /tmp/bashio \
    && tar zxvf /tmp/bashio.tar.gz --strip 1 -C /tmp/bashio \
    && mv /tmp/bashio/lib /usr/lib/bashio \
    && ln -s /usr/lib/bashio/bashio /usr/bin/bashio
RUN git clone https://github.com/tomquist/solix2mqtt.git
WORKDIR /solix2mqtt
RUN npm install
RUN ./node_modules/.bin/tsc
ENV S2M_USER=markus.mauch@gmail.com
ENV S2M_PASSWORD="C@qF3ab\$u&RYNhgsJJ"
ENV S2M_COUNTRY=DE
ENV S2M_MQTT_URI=mqtt://192.168.0.4:1883
ENV S2M_MQTT_USERNAME=pi
ENV S2M_MQTT_PASSWORD=fli4l2WL500g
ENTRYPOINT [ "/bin/sh" ]