ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
WORKDIR /app
COPY backend/* /app/
RUN pip install --no-cache-dir schedule pymodbus paho-mqtt pyyaml debugpy jsonpath-ng
CMD [ "python", "modbus2mqtt.py" ]