ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
RUN apk add --no-cache caddy
COPY run.sh ./run.sh
RUN chmod +x run.sh
CMD [ "./run.sh" ]
