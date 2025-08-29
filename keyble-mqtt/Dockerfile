ARG BUILD_FROM

FROM node:18-alpine AS node
FROM $BUILD_FROM

ENV LANG C.UTF-8

# Install system deps needed for keyble & bluetooth
RUN apk add --no-cache \
    build-base \
    libgudev-dev \
    bluez \
    bluez-libs \
    python3 \
    make \
    g++

# Copy Node 18 from builder stage (no need for apk npm!)
COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

# Upgrade npm to match Node 18 (fixes "idealTree" error)
RUN npm install -g npm@10

# Install keyble globally
RUN npm install -g --unsafe-perm keyble

# Apply your patch
COPY patch/keyble.js /usr/local/lib/node_modules/keyble

# Set workdir
WORKDIR /usr/src/app

# Copy only package.json first to leverage Docker cache
COPY package*.json tsconfig.json ./

# Install app dependencies cleanly
RUN npm ci

# Copy source code
COPY src ./src
COPY run.sh ./

RUN chmod a+x run.sh

CMD [ "./run.sh" ]
