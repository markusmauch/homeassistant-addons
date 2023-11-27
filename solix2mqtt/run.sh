#!/usr/bin/env bashio

export S2M_USER="$(bashio::config 'user')"
export S2M_PASSWORD="$(bashio::config 'password')"
export S2M_COUNTRY="$(bashio::config 'country')"
export S2M_MQTT_HOST="$(bashio::config 'mqtt_host')"
export S2M_MQTT_USERNAME="$(bashio::config 'mqtt_username')"
export S2M_MQTT_PASSWORD="$(bashio::config 'mqtt_password')"
export S2M_MQTT_URI="mqtt://$S2M_MQTT_HOST:1883"
# export S2M_MQTT_TOPIC="homeassistant/"

TOPIC="homeassistant/sensor/solarbank_e1600/battery_level/config"
PAYLOAD=$(echo '{
  "name": "Solarbank E1600 Battery Level",
  "state_topic": "solix/site/Balkonsolar/scenInfo",
  "value_template": "{{ value_json.solarbank_info.total_battery_power | float * 100 }}",
  "device_class": "battery",
  "unit_of_measurement": "%",
  "unique_id": "solarbank_e1600_battery_level"
}' | jq -c '.')
mosquitto_pub -h "$S2M_MQTT_HOST" -u "$S2M_MQTT_USERNAME" -P "$S2M_MQTT_PASSWORD" -t "$TOPIC" -m "$PAYLOAD"

TOPIC="homeassistant/sensor/solarbank_e1600/photovoltaic_power/config"
PAYLOAD=$(echo '{
  "name": "Solarbank E1600 Photovoltaic Power",
  "state_topic": "solix/site/Balkonsolar/scenInfo",
  "value_template": "{{ value_json.solarbank_info.total_photovoltaic_power | float }}",
  "device_class": "power",
  "unit_of_measurement": "W",
  "unique_id": "solarbank_e1600_photovoltaic_power"
}' | jq -c '.')
mosquitto_pub -h "$S2M_MQTT_HOST" -u "$S2M_MQTT_USERNAME" -P "$S2M_MQTT_PASSWORD" -t "$TOPIC" -m "$PAYLOAD"

TOPIC="homeassistant/sensor/solarbank_e1600/output_power/config"
PAYLOAD=$(echo '{
  "name": "Solarbank E1600 Output Power",
  "state_topic": "solix/site/Balkonsolar/scenInfo",
  "value_template": "{{ value_json.solarbank_info.total_output_power | float }}",
  "device_class": "power",
  "unit_of_measurement": "W",
  "unique_id": "solarbank_e1600_output_power"
}' | jq -c '.')
mosquitto_pub -h "$S2M_MQTT_HOST" -u "$S2M_MQTT_USERNAME" -P "$S2M_MQTT_PASSWORD" -t "$TOPIC" -m "$PAYLOAD"

TOPIC="homeassistant/sensor/solarbank_e1600/charging_power/config"
PAYLOAD=$(echo '{
  "name": "Solarbank E1600 Charging Power",
  "state_topic": "solix/site/Balkonsolar/scenInfo",
  "value_template": "{{ value_json.solarbank_info.total_charging_power | float }}",
  "device_class": "power",
  "unit_of_measurement": "W",
  "unique_id": "solarbank_e1600_charging_power"
}' | jq -c '.')
mosquitto_pub -h "$S2M_MQTT_HOST" -u "$S2M_MQTT_USERNAME" -P "$S2M_MQTT_PASSWORD" -t "$TOPIC" -m "$PAYLOAD"

echo $S2M_USER
echo $S2M_PASSWORD
echo $S2M_MQTT_HOST
echo $S2M_MQTT_USERNAME
echo $S2M_MQTT_PASSWORD
echo $TOPIC
echo $PAYLOAD

# top
node ./bin/app.js
