ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
WORKDIR /app
RUN mkdir backend frontend
COPY backend/* backend/
COPY frontend/* frontend/
# COPY requirements.txt .
ENTRYPOINT [ "./backend/run" ]