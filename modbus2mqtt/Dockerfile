ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
WORKDIR /app
COPY backend/* /app/

CMD [ "python3", "modbus2mqtt.py" ]