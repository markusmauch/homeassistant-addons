ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
WORKDIR /app
COPY backend/* /app/src/
COPY requirements.txt .
COPY run.sh .
RUN chmod a+x run.sh
RUN pip install --no-cache-dir -r requirements.txt
RUN pip show schedule
RUN chmod a+x run.sh
CMD [ "./run.sh" ]