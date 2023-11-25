#!/usr/bin/env bashio

# Define the configuration for the sensor
SENSOR_CONFIG='{
  "name": "Balkonsolar Total Photovoltaic Power",
  "state_topic": "solix/site/Balkonsolar/scenInfo",
  "value_template": "{{ value_json.solarbank_info.total_photovoltaic_power }}",
  "unit_of_measurement": "W",
  "device": {
    "identifiers": ["balkonsolar"],
    "name": "Balkonsolar",
    "model": "Solarbank E1600",
    "manufacturer": "YourManufacturer"
  }
}'

# Remove newlines and spaces to make the JSON a single line
SENSOR_CONFIG=$(echo "$SENSOR_CONFIG" | tr -d '\n' | tr -d ' ')

# Announce the sensor to Home Assistant using bashio::discovery
bashio::discovery "sensor" "balkonsolar_total_photovoltaic_power" "$SENSOR_CONFIG"

# Log a message indicating that the sensor has been announced
bashio::log.info "Balkonsolar Total Photovoltaic Power sensor has been announced to Home Assistant."

node ./bin/app.js