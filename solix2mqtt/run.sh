#!/usr/bin/env bashio

export S2M_USER="$(bashio::config 'user')"
export S2M_PASSWORD="$(bashio::config 'password')"
export S2M_COUNTRY="$(bashio::config 'country')"
export S2M_MQTT_URI="$(bashio::config 'mqtt_uri')"
export S2M_MQTT_USERNAME="$(bashio::config 'mqtt_username')"
export S2M_MQTT_PASSWORD="$(bashio::config 'mqtt_password')"
export S2M_MQTT_TOPIC="$(bashio::config 'mqtt_topic')"
export S2M_POLL_INTERVAL="$(bashio::config 'poll_interval')"
export S2M_VERBOSE=true
SITE_NAME="$(bashio::config 'site_name')"

# Get username, password, scheme, hostname and port from URI
function parse_uri() {
	uri=$1
	key=$2
	echo $(python3 -c "from urllib.parse import urlparse; value=urlparse('$uri').$key; print(value) if value is not None else None")
}

# Publish MQTT messages for a sensor
publish_sensor() {
	local topic="$1"
	local name="$2"
	local unique_id="$3"
	local value_template="$4"
	local device_class="${5:-null}"
	local unit_of_measurement="${6:-null}"
	local state_topic=$S2M_MQTT_TOPIC/site/$SITE_NAME/scenInfo

	local username=$(parse_uri $S2M_MQTT_URI username)
	local password=$(parse_uri $S2M_MQTT_URI password)
	local scheme=$(parse_uri $S2M_MQTT_URI scheme)
	local hostname=$(parse_uri $S2M_MQTT_URI hostname)
	local port=$(parse_uri $S2M_MQTT_URI port)

	local payload=$(
		jq -c -n \
			--arg name "$name" \
			--arg topic "$topic" \
			--arg state_topic "$state_topic" \
			--arg value_template "$value_template" \
			--arg device_class "$device_class" \
			--arg unit_of_measurement "$unit_of_measurement" \
			--arg unique_id "$unique_id" \
			'{"name": $name, "state_topic": $state_topic, "value_template": $value_template, "device_class": $device_class, "unit_of_measurement": $unit_of_measurement, "unique_id": $unique_id} | with_entries(select(.value!="null"))'
	)
	echo Announcing entity \'$name\' to host: "$scheme"://"$hostname:${port:-1883}" with payload
	echo $payload
	mosquitto_pub -h "$hostname" -p "${port:-1883}" -u "${S2M_MQTT_USERNAME:-$username}" -P "${S2M_MQTT_PASSWORD:-$password}" -t "$topic" -m "$payload" --retain
	echo "Done."
	echo ""
}

# Publish battery level sensor
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/battery_level/config" \
	"Solarbank E1600 Battery Level"\
	"solarbank_e1600_battery_level" \
	"{{ value_json.solarbank_info.total_battery_power | (float*100) }}" \
	"battery" \
	"%"

# Publish photovoltaic power sensor
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/photovoltaic_power/config" \
	"Solarbank E1600 Photovoltaic Power" \
	"solarbank_e1600_photovoltaic_power" \
	"{{ value_json.solarbank_info.total_photovoltaic_power | float }}" \
	"power" \
	"W"

# Publish photovoltaic yield sensor
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/photovoltaic_yield/config" \
	"Solarbank E1600 Photovoltaic Yield" \
	"solarbank_e1600_photovoltaic_yield" \
	"{{ value_json.statistics[0].total | float }}" \
	"energy" \
	"kWh"

# Publish output power sensor
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/output_power/config" \
	"Solarbank E1600 Output Power" \
	"solarbank_e1600_output_power" \
	"{{ value_json.solarbank_info.total_output_power | float }}" \
	"power" \
	"W"

# Publish charging power sensor
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/charging_power/config" \
	"Solarbank E1600 Charging Power" \
	"solarbank_e1600_charging_power" \
	"{{ value_json.solarbank_info.total_charging_power | float }}" \
	"power" \
	"W"

# Publish last update
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/last_update/config" \
	"Solarbank E1600 Last Update" \
	"solarbank_e1600_last_update" \
	"{{ value_json.solarbank_info.updated_time }}"

# Publish charging status
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/charging_status/config" \
	"Solarbank E1600 Charging Status" \
	"solarbank_e1600_charging_status" \
	"{{ value_json.solarbank_info.solarbank_list[0].charging_status }}"

# Publish statistics yield
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/statistics/yield/config" \
	"Solarbank E1600 Statistics Yield" \
	"solarbank_e1600_statistics_yield" \
	"{{ value_json.solarbank_info.statistics[0].total }}" \
	"energy" \
	"kWh"

# Publish statistics co2 savings
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/statistics/co2_savings/config" \
	"Solarbank E1600 Statistics CO2 Savings" \
	"solarbank_e1600_statistics_co2_savings" \
	"{{ value_json.solarbank_info.statistics[1].total }}" \
	"mass" \
	"kg"

# Publish statistics saved costs
publish_sensor \
	"homeassistant/sensor/solarbank_e1600/statistics/saved_costs/config" \
	"Solarbank E1600 Charging Statistics Saved Costs" \
	"solarbank_e1600_statistics_saved_costs" \
	"{{ value_json.solarbank_info.statistics[2].total }}" \
	"currency" \
	"{{ value_json.solarbank_info.statistics[2].unit }}"

node ./bin/app.js
