#!/bin/bash/env bash
set -e

CONFIG_PATH=/data/options.json

export MQTT_URI="$(jq --raw-output '.mqtt_uri' $CONFIG_PATH)"
export MQTT_TOPIC="$(jq --raw-output '.mqtt_topic' $CONFIG_PATH)"
export MQTT_USERNAME="$(jq --raw-output '.mqtt_username' $CONFIG_PATH)"
export MQTT_PASSWORD="$(jq --raw-output '.mqtt_password' $CONFIG_PATH)"
export MODBUS_URI="$(jq --raw-output '.modbus_uri' $CONFIG_PATH)"
export MODBUS_UNIT_ID="$(jq --raw-output '.modbus_unit_id' $CONFIG_PATH)"
export POLL_INTERVAL="$(jq --raw-output '.poll_interval' $CONFIG_PATH)"

python3 powerbox2mqtt.py