ARG BUILD_FROM
FROM $BUILD_FROM
ENV LANG C.UTF-8

RUN apk add curl --no-cache curl
RUN curl -fsSL https://deno.land/x/install/install.sh | sh

RUN echo "OK"

# COPY run.sh"
# RUN chmod a+x /run.sh
# CMD [ "/run.sh" ]