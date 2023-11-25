#!/usr/bin/env bashio

USERNAME=$(bashio::config 'username')

bashio::log.info "${USERNAME}"
# bashio::log.info "$(bashio::api 'GET' '/os/info')"
bashio::log.info "$(bashio::network)"
echo `pwd`
deno run https://examples.deno.land/hello-world.ts

deno run --allow-read --allow-net --allow-env /app/index.ts

# pm2 start ping -- localhost
# pm2 monit