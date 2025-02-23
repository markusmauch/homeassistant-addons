#!/usr/bin/env bashio

# Read JSON configuration from Home Assistant options
CONFIG_PATH="/config/caddy/config.json"
CONFIG_JSON=$(bashio::config 'json_config')

# Write JSON configuration to file
echo "$CONFIG_JSON" > "$CONFIG_PATH"

# Start Caddy using the JSON config
exec caddy run --config "$CONFIG_PATH" --adapter json
