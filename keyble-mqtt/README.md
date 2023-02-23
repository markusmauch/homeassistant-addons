# Eqiva Bluetooth Smart Lock
This addon uses the [keyble](https://github.com/oyooyo/keyble) library to operate the lock and publishes it's state to the specified MQTT broker.

## Configuration
- address: The address of the Smart Lock
- user_id: The user id of the Smart Lock
- user_key: The user Key of the Smart lock
- host: The host name or IP address of the MQTT broker
- username: The MQTT user name
- password: The MQTT password
- auto_disconnect_time: The auto disconnection time *in seconds* of the keyble command
- poll_interval: The polling time to retrieve the current state of the lock *in minutes*

Please follow the procedure described [here](https://github.com/oyooyo/keyble#keyble-registeruser) to obtain the user id and key.