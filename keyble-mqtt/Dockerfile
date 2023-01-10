FROM node:14.21.2-alpine AS node

ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN \ 
    apk add --no-cache \
        build-base \
        libgudev-dev \
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
# keyble-mqtt
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
