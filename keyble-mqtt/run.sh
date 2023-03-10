#!/bin/bash
set -e

CONFIG_PATH=/data/options.json

ADDRESS="$(jq --raw-output '.address' $CONFIG_PATH)"
USER_ID="$(jq --raw-output '.user_id' $CONFIG_PATH)"
USER_KEY="$(jq --raw-output '.user_key' $CONFIG_PATH)"
HOST="$(jq --raw-output '.host' $CONFIG_PATH)"
USERNAME="$(jq --raw-output '.username' $CONFIG_PATH)"
PASSWORD="$(jq --raw-output '.password' $CONFIG_PATH)"
AUTO_DISCONNECT_TIME="$(jq --raw-output '.auto_disconnect_time' $CONFIG_PATH)"
POLL_INTERVAL="$(jq --raw-output '.poll_interval' $CONFIG_PATH)"
DEBUG="$(jq --raw-output '.debug' $CONFIG_PATH)"

if [ "$DEBUG" = "true" ]
then
    echo "Running in debug mode..."
    tail -f /dev/null
else
    ./node_modules/typescript/bin/tsc
    node ./out/Index.js --host $HOST --username $USERNAME --password $PASSWORD --address $ADDRESS --user_id $USER_ID --user_key $USER_KEY --auto_disconnect_time $AUTO_DISCONNECT_TIME --poll_interval $POLL_INTERVAL
fi
