## Configuration

- address: The address of the Smart Lock
- user_id: The user id of the Smart Lock
- user_key: The user Key of the Smart lock
- host: The host name or IP address of the MQTT broker
- username: The MQTT user name
- password: The MQTT password
- auto*disconnect_time: The auto disconnection time in \_seconds* of the keyble command
- poll*interval: The polling time to retrieve the current state of the lock in \_seconds*
- debug: Runs the addon in debug mode

To obtain the user id and key, start the addon in debug mode and log into the container:

`docker exec -it $(docker ps -f name=keyble-mqtt -q) /bin/bash`

Then run the `keyble-registeruser` command as described [here](https://github.com/oyooyo/keyble#keyble-registeruser).
