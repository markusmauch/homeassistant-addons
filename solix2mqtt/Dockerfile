FROM node:21-alpine3.17
RUN apk add --no-cache git curl jq bash mosquitto-clients python3
ARG BASHIO_VERSION="v0.16.0"
RUN curl -J -L -o /tmp/bashio.tar.gz \
    "https://github.com/hassio-addons/bashio/archive/${BASHIO_VERSION}.tar.gz" \
    && mkdir /tmp/bashio \
    && tar zxvf /tmp/bashio.tar.gz --strip 1 -C /tmp/bashio \
    && mv /tmp/bashio/lib /usr/lib/bashio \
    && ln -s /usr/lib/bashio/bashio /usr/bin/bashio
# RUN git clone https://github.com/tomquist/solix2mqtt.git
WORKDIR /solix2mqtt
COPY bin ./
RUN npm i
COPY run.sh ./
RUN chmod a+x run.sh
CMD [ "./run.sh" ]