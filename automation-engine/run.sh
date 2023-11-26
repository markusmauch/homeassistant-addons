#!/usr/bin/env bashio

# USERNAME=$(bashio::config 'username')
# bashio::log.info "${USERNAME}"
# bashio::log.info "$(bashio::api 'GET' '/os/info')"
# bashio::log.info "$(bashio::network)"
# deno run https://examples.deno.land/hello-world.ts

#Launch nginx with debug options.
# nginx -g "daemon off;error_log /dev/stdout debug;" &
deno run --allow-run --allow-net --allow-read /app/backend/service.ts &
wait

# deno run --allow-read --allow-net --allow-env /app/index.ts

# pm2 start ping -- localhost
# pm2 monit