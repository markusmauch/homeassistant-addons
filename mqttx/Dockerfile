ARG BUILD_FROM

FROM emqx/mqttx-web:latest AS mqttx
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN \ 
    apk add --no-cache \
        nodejs \
        npm

COPY --from=mqttx /app ./app
RUN npm i -g http-server
COPY run.sh /
RUN chmod a+x /run.sh
CMD [ "/run.sh" ]


# EXPOSE 80
# CMD [ "http-server", "-p", "80" ]

# COPY package.json /
# COPY tsconfig.json /
# COPY src/* src/

# RUN npm install --update --global --unsafe-perm keyble
# RUN npm install
