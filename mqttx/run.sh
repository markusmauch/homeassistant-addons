#!/bin/bash
set -e

CONFIG_PATH=/data/options.json
CONNECTION_STRING="$(jq --raw-output '.connectionString' $CONFIG_PATH)"

HOST="$(jq --raw-output '.host' $CONFIG_PATH)"
USERNAME="$(jq --raw-output '.username' $CONFIG_PATH)"
PASSWORD="$(jq --raw-output '.password' $CONFIG_PATH)"

http-server -p 6789 /app

# node ./out/Index.js --host $HOST --username $USERNAME --password $PASSWORD --address $ADDRESS --user_id $USER_ID --user_key $USER_KEY
# keyble-mqtt $ADDRESS $USER_ID $USER_KEY --host $HOST --username $USERNAME --password $PASSWORD
# tail -f /dev/null