ARG BUILD_FROM

FROM node:14.21.2-alpine AS node
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN \ 
    apk add --no-cache \
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

RUN npm install --update --global --unsafe-perm keyble@0.3.2

COPY patch/keyble.js /usr/local/lib/node_modules/keyble

COPY package.json /
COPY tsconfig.json /
COPY src/* src/
COPY run.sh /

RUN npm install
RUN chmod a+x /run.sh
CMD [ "/run.sh" ]
