#!/usr/bin/env bashio

# Define the configuration for the sensor
SENSOR_CONFIG=$(bashio::var.json \
  name "Balkonsolar Total Photovoltaic Power" \
  state_topic "solix/site/Balkonsolar/scenInfo" \
  value_template "{{ value_json.solarbank_info.total_photovoltaic_power }}" \
  unit_of_measurement "W" \
  device '{"identifiers": ["balkonsolar"], "name": "Balkonsolar", "model": "Solarbank E1600", "manufacturer": "YourManufacturer"}'
)

# Announce the sensor to Home Assistant using bashio::discovery
if bashio::discovery "sensor" "balkonsolar_total_photovoltaic_power" "${SENSOR_CONFIG}" > /dev/null; then
  bashio::log.info "Successfully sent discovery information to Home Assistant."
else
  bashio::log.error "Discovery message to Home Assistant failed!"
fi


node ./bin/app.js