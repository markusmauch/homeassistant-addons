FROM denoland/deno:alpine
# SHELL ["/bin/ash", "-o", "pipefail", "-c"]
ARG BASHIO_VERSION="v0.16.0"
RUN apk add --no-cache npm curl jq bash
RUN curl -J -L -o /tmp/bashio.tar.gz \
    "https://github.com/hassio-addons/bashio/archive/${BASHIO_VERSION}.tar.gz" \
    && mkdir /tmp/bashio \
    && tar zxvf /tmp/bashio.tar.gz --strip 1 -C /tmp/bashio \
    && mv /tmp/bashio/lib /usr/lib/bashio \
    && ln -s /usr/lib/bashio/bashio /usr/bin/bashio
RUN npm install pm2 -g
WORKDIR /app
COPY run.sh /app/
COPY src/* /app/
RUN chmod a+x run.sh
CMD [ "/app/run.sh" ]