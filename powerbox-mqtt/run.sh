#!/bin/bash
set -e

CONFIG_PATH=/data/options.json
CONNECTION_STRING="$(jq --raw-output '.connectionString' $CONFIG_PATH)"

POLL_INTERVAL="$(jq --raw-output '.poll_interval' $CONFIG_PATH)"
MQTT_HOST="$(jq --raw-output '.mqtt_host' $CONFIG_PATH)"
MQTT_USERNAME="$(jq --raw-output '.mqtt_username' $CONFIG_PATH)"
MQTT_PASSWORD="$(jq --raw-output '.mqtt_password' $CONFIG_PATH)"
TOPIC="$(jq --raw-output '.topic' $CONFIG_PATH)"
POWERBOX_HOST="$(jq --raw-output '.powerbox_host' $CONFIG_PATH)"
POWERBOX_PORT="$(jq --raw-output '.powerbox_port' $CONFIG_PATH)"
POWERBOX_UNIT_ID="$(jq --raw-output '.powerbox_unit_id' $CONFIG_PATH)"

tsc
node ./out/index.js --poll_interval $POLL_INTERVAL --mqtt_host $MQTT_HOST --mqtt_username $MQTT_USERNAME --mqtt_password $MQTT_PASSWORD --topic $TOPIC --powerbox_host $POWERBOX_HOST --powerbox_port $POWERBOX_PORT --powerbox_unit_id $POWERBOX_UNIT_ID 

tail -f /dev/null