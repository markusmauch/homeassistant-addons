ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN \ 
    apk add --no-cache \
        build-base \
        libgudev-dev \
        bluez-libs \
        nodejs \
        npm

COPY package.json /
COPY out/* out/
COPY run.sh /
RUN npm install
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]