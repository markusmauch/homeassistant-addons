ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN \ 
    apk add --no-cache \
        nodejs \
        npm

COPY package.json /
COPY tsconfig.json /
COPY src/* src/
COPY run.sh /
RUN npm install
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]