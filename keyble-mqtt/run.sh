#!/bin/bash
set -e

CONFIG_PATH=/data/options.json
CONNECTION_STRING="$(jq --raw-output '.connectionString' $CONFIG_PATH)"

ADDRESS="$(jq --raw-output '.address' $CONFIG_PATH)"
USER_ID="$(jq --raw-output '.user_id' $CONFIG_PATH)"
USER_KEY="$(jq --raw-output '.user_key' $CONFIG_PATH)"
HOST="$(jq --raw-output '.host' $CONFIG_PATH)"
USERNAME="$(jq --raw-output '.username' $CONFIG_PATH)"
PASSWORD="$(jq --raw-output '.password' $CONFIG_PATH)"

echo ADDRESS: $ADDRESS
echo USER_ID: $USER_ID
echo USER_KEY: $USER_KEY
echo HOST: $HOST
echo USERNAME: $USERNAME
echo PASSWORD: $PASSWORD


./node_modules/typescript/bin/tsc
node ./out/Index.js --host $HOST --username $USERNAME --password $PASSWORD

#keyble-mqtt $ADDRESS $USER_ID $USER_KEY --host $HOST --username $USERNAME --password $PASSWORD
tail -f /dev/null