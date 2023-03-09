#!/usr/bin/with-contenv bashio

bashio::cache.flush_all
hostname="hassio"
if bashio::supervisor.ping; then
        hostname=${bashio::host.hostname}
fi

echo "> ${hostname}"

USERNAME=$(bashio::config 'mqtt_username')
bashio::log.info "${USERNAME}"