ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN \ 
    apk add --no-cache \
        build-base \
        libgudev-dev \
        bluez-libs \
        nodejs=12.22.12-r0 \
        npm

COPY run.sh /
RUN npm install --update --global --unsafe-perm keyble
# keyble-mqtt
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
