#!/usr/bin/env bashio

export S2M_USER="$(bashio::config 'user')"
export S2M_PASSWORD="$(bashio::config 'password')"
export S2M_COUNTRY="$(bashio::config 'country')"
export S2M_MQTT_URI="$(bashio::config 'mqtt_uri')"
export S2M_MQTT_USERNAME="$(bashio::config 'mqtt_username')"
export S2M_MQTT_PASSWORD="$(bashio::config 'mqtt_password')"
export S2M_MQTT_TOPIC="$(bashio::config 'mqtt_topic')"
export S2M_POLL_INTERVAL=$(bashio::config 'poll_interval')
export S2M_VERBOSE=true

python3 solix2mqtt.py
