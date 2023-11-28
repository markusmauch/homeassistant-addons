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
  local unique_id="$3"
  local value_template="$4"
  local device_class="$5"
  local unit_of_measurement="$6"
  local state_topic="solix/site/Balkonsolar/scenInfo"

  local payload=$(jq -c -n --arg name "$name" --arg topic "$topic" --arg state_topic "$state_topic" --arg value_template "$value_template" --arg device_class "$device_class" --arg unit_of_measurement "$unit_of_measurement" --arg unique_id "$unique_id" '{"name": $name, "state_topic": $state_topic, "value_template": $value_template, "device_class": $device_class, "unit_of_measurement": $unit_of_measurement, "unique_id": $unique_id} | with_entries(select(.unit_of_measurement != "" or .device_class != ""))')
  echo Announcing entity $payload
  mosquitto_pub -h "$S2M_MQTT_HOST" -u "$S2M_MQTT_USERNAME" -P "$S2M_MQTT_PASSWORD" -t "$topic" -m "$payload"
}

# Publish battery level sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/battery_level/config" "Solarbank E1600 Battery Level" "solarbank_e1600_battery_level" "{{ value_json.solarbank_info.total_battery_power | float * 100 }}" "battery" "%"

# Publish photovoltaic power sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/photovoltaic_power/config" "Solarbank E1600 Photovoltaic Power" "solarbank_e1600_photovoltaic_power" "{{ value_json.solarbank_info.total_photovoltaic_power | float }}" "power" "W"

# Publish photovoltaic yield sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/photovoltaic_power/config" "Solarbank E1600 Photovoltaic Yield" "solarbank_e1600_photovoltaic_yield" "{{ value_json.statistics[0].total | float }}" "energy" "kWh"

# Publish output power sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/output_power/config" "Solarbank E1600 Output Power" "solarbank_e1600_output_power" "{{ value_json.solarbank_info.total_output_power | float }}" "power" "W"

# Publish charging power sensor
publish_sensor "homeassistant/sensor/solarbank_e1600/charging_power/config" "Solarbank E1600 Charging Power" "solarbank_e1600_charging_power" "{{ value_json.solarbank_info.total_charging_power | float }}" "power" "W"

# Publish last update
publish_sensor "homeassistant/sensor/solarbank_e1600/updated_time/config" "Solarbank E1600 Last Update" "solarbank_e1600_last_update" "{{ value_json.solarbank_info.updated_time, '%Y-%m-%d %H:%M:%S') }}"

# node ./bin/app.js
