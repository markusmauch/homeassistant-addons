ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
WORKDIR /app
COPY backend/* /app/
RUN pip3 install schedule pymodbus paho-mqtt pyyaml debugpy jsonpath-ng flask flask-cors jsonata
CMD [ "python", "modbus2mqtt.py" ]