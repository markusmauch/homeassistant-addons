#!/usr/bin/env bashio

export S2M_USER="$(bashio::config 'user')"
export S2M_PASSWORD="$(bashio::config 'password')"
export S2M_COUNTRY="$(bashio::config 'country')"
export S2M_MQTT_HOST="$(bashio::config 'mqtt_host')"
export S2M_MQTT_USERNAME="$(bashio::config 'mqtt_username')"
export S2M_MQTT_PASSWORD="$(bashio::config 'mqtt_password')"
export S2M_MQTT_URI="mqtt://$S2M_MQTT_HOST:1883"
# export S2M_MQTT_TOPIC="homeassistant/"


# Function to publish MQTT messages for a sensor
publish_sensor() {
  local topic="$1"
  local name="$2"
  local value_template="$3"
  local device_class="$4"
  local unit_of_measurement="$5"
  local unique_id="$6"

  local payload=$(jq -c -n --arg name "$name" --arg topic "$topic" --arg value_template "$value_template" --arg device_class "$device_class" --arg unit_of_measurement "$unit_of_measurement" --arg unique_id "$unique_id" '{"name": $name, "state_topic": $topic, "value_template": $value_template, "device_class": $device_class, "unit_of_measurement": $unit_of_measurement, "unique_id": $unique_id}')
  echo Announcing entity '$name'.
  mosquitto_pub -h "$S2M_MQTT_HOST" -u "$S2M_MQTT_USERNAME" -P "$S2M_MQTT_PASSWORD" -t "$topic" -m "$payload"
}

# Publish battery level sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/battery_level/config" "Solarbank E1600 Battery Level" "{{ value_json.solarbank_info.total_battery_power | float * 100 }}" "battery" "%" "solarbank_e1600_battery_level"

# Publish photovoltaic power sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/photovoltaic_power/config" "Solarbank E1600 Photovoltaic Power" "{{ value_json.solarbank_info.total_photovoltaic_power | float }}" "power" "W" "solarbank_e1600_photovoltaic_power"

# Publish output power sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/output_power/config" "Solarbank E1600 Output Power" "{{ value_json.solarbank_info.total_output_power | float }}" "power" "W" "solarbank_e1600_output_power"

# Publish charging power sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/charging_power/config" "Solarbank E1600 Charging Power" "{{ value_json.solarbank_info.total_charging_power | float }}" "power" "W" "solarbank_e1600_charging_power"

# Publish last update
publish_sensor "homeassistant/sensor/solarbank_e1600/updated_time/config" "Solarbank E1600 Last Update" "{{ value_json.solarbank_info.updated_time, '%Y-%m-%d %H:%M:%S') }}" "timestamp" "" "solarbank_e1600_charging_power"

# top
node ./bin/app.js
