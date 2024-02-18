ARG BUILD_FROM
FROM ${BUILD_FROM}
RUN apk add --no-cache git mosquitto-clients
RUN pip install cryptography aiohttp paho-mqtt
WORKDIR /solix2mqtt
COPY bin ./
COPY run.sh ./
RUN chmod a+x run.sh
CMD [ "./run.sh" ]