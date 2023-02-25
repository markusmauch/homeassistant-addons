#!/bin/bash
set -e

CONFIG_PATH=/data/options.json
# CONNECTION_STRING="$(jq --raw-output '.connectionString' $CONFIG_PATH)"

ADDRESS="$(jq --raw-output '.address' $CONFIG_PATH)"
USER_ID="$(jq --raw-output '.user_id' $CONFIG_PATH)"
USER_KEY="$(jq --raw-output '.user_key' $CONFIG_PATH)"
HOST="$(jq --raw-output '.host' $CONFIG_PATH)"
USERNAME="$(jq --raw-output '.username' $CONFIG_PATH)"
PASSWORD="$(jq --raw-output '.password' $CONFIG_PATH)"
AUTO_DISCONNECT_TIME="$(jq --raw-output '.auto_disconnect_time' $CONFIG_PATH)"
POLL_INTERVAL="$(jq --raw-output '.poll_interval' $CONFIG_PATH)"

# ADDRESS=$(bashio::config "address")
# USER_ID=$(bashio::config "user_id")
# USER_KEY=$(bashio::config "user_key")
# HOST=$(bashio::services mqtt "host")
# USERNAME=$(bashio::services mqtt "username")
# PASSWORD=$(bashio::services mqtt "password")
# AUTO_DISCONNECT_TIME=$(bashio::config "auto_disconnect_time")
# POLL_INTERVAL=$(bashio::config "poll_interval")

./node_modules/typescript/bin/tsc
node ./out/Index.js --host $HOST --username $USERNAME --password $PASSWORD --address $ADDRESS --user_id $USER_ID --user_key $USER_KEY --auto_disconnect_time $AUTO_DISCONNECT_TIME --poll_interval $POLL_INTERVAL