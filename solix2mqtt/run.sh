#!/usr/bin/env bashio

S2M_USER=$(bashio::config 'user')
S2M_PASSWORD=$(bashio::config 'password')
S2M_COUNTRY=$(bashio::config 'country')
S2M_MQTT_URI=$(bashio::config 'mqtt_uri')
S2M_MQTT_USERNAME=$(bashio::config 'mqtt_username')
S2M_MQTT_PASSWORD=$(bashio::config 'mqtt_password')


# Define the configuration for the sensor
PAYLOAD=$(echo '{
    "name": "Balkonsolar Total Photovoltaic Power",
    "state_topic": "solix/site/Balkonsolar/scenInfo",
    "value_template": "{{ value_json.solarbank_info.total_photovoltaic_power }}",
    "unit_of_measurement": "W",
    "device": {
        "identifiers": [ "balkonsolar" ],
        "name": "Balkonsolar",
        "model": "Solarbank E1600",
        "manufacturer": "YourManufacturer"
    }
}' | jq -c '.')

echo $PAYLOAD
TOPIC="homeassistant/sensor/my_sensor/config"
mosquitto_pub -h $S2M_MQTT_URI -t $TOPIC -m "$PAYLOAD"

# node ./bin/app.js