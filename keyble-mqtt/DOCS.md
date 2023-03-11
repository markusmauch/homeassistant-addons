# Documentation

This addon uses the [keyble](https://github.com/oyooyo/keyble) library. All prerequisites described there have to be met.

## Setup

A Bluetooth 4.0 compatible hardware is required. Deactivate potentially incompatible on-board Bluetooth devices in the Home Assistant intergations view.

To obtain the user id and key, [root SSH access to the Home Assistant host](https://developers.home-assistant.io/docs/operating-system/debugging/) is required. Then start the addon in debug mode and log in to it's container interactively from the root ssh terminal:

`docker exec -it $(docker ps -f name=keyble-mqtt -q) /bin/bash`

From there, run the `keyble-registeruser` command as described [here](https://github.com/oyooyo/keyble#keyble-registeruser).

Use the obtained parameters to start the addon in normal mode.

## Parameters

- address: The address of the Smart Lock
- user_id: The user id of the Smart Lock
- user_key: The user Key of the Smart lock
- host: The host name or IP address of the MQTT broker
- username: The MQTT user name
- password: The MQTT password
- auto*disconnect_time: The auto disconnection time in \_seconds* of the keyble command
- poll*interval: The polling time to retrieve the current state of the lock in \_seconds*
- debug: Runs the addon in debug mode
