ARG BUILD_FROM

FROM node:14.21.2-alpine AS node
FROM $BUILD_FROM

ENV LANG C.UTF-8

VOLUME /var/run/dbus/:/var/run/dbus/:z

RUN \ 
    apk add --no-cache \
        openrc \
        build-base \
        libgudev-dev \
        bluez \
        bluez-libs \
        npm

# nodejs
# copy node v14 manually
COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

COPY run.sh /
RUN npm install --update --global --unsafe-perm keyble
# RUN npm install --update --global --unsafe-perm keyble-mqtt
RUN chmod a+x /run.sh
CMD [ "/run.sh" ]
