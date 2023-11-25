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

# Define the MQTT topic for Home Assistant auto-discovery
DISCOVERY_TOPIC="homeassistant/sensor/balkonsolar_total_photovoltaic_power/config"

# Publish the sensor configuration to the MQTT broker
bashio::mqtt.publish -t "$DISCOVERY_TOPIC" -m "$SENSOR_CONFIG" -r

# Log a message indicating that the sensor has been announced
bashio::log.info "Balkonsolar Total Photovoltaic Power sensor has been announced to Home Assistant."



node ./bin/app.js