#!/usr/bin/env bash
set -e

CONFIG_PATH=/data/options.json

export S2M_USER=$(jq --raw-output '.user // empty' $CONFIG_PATH)
export S2M_PASSWORD=$(jq --raw-output '.password // empty' $CONFIG_PATH)
export S2M_COUNTRY=$(jq --raw-output '.country // empty' $CONFIG_PATH)
export S2M_MQTT_URI=$(jq --raw-output '.mqtt_uri // empty' $CONFIG_PATH)
export S2M_MQTT_USERNAME=$(jq --raw-output '.mqtt_username // empty' $CONFIG_PATH)
export S2M_MQTT_PASSWORD=$(jq --raw-output '.mqtt_password // empty' $CONFIG_PATH)
export S2M_MQTT_TOPIC=$(jq --raw-output '.mqtt_topic // empty' $CONFIG_PATH)
export S2M_POLL_INTERVAL=$(jq --raw-output '.poll_interval // 30' $CONFIG_PATH)
export S2M_VERBOSE=true

echo $S2M_USER
echo $S2M_PASSWORD
echo $S2M_COUNTRY
echo $S2M_MQTT_URI
echo $S2M_MQTT_USERNAME
echo $S2M_MQTT_PASSWORD
echo $S2M_MQTT_TOPIC
echo $S2M_POLL_INTERVAL
echo $S2M_VERBOSE

python3 solix2mqtt.py
