#!/usr/bin/env bashio

USERNAME=$(bashio::config 'username')

bashio::log.info "${USERNAME}"
# bashio::log.info "$(bashio::api 'GET' '/os/info')"
echo pwd
deno run https://examples.deno.land/hello-world.ts

deno run --allow-read options.ts

# pm2 start ping -- localhost
# pm2 monit