# Anker Solix Solarbank E1600 to MQTT

This addon uses the [anker-splix-api](https://github.com/thomluther/anker-solix-api/tree/main) library to poll the Solix API for the latest sample data and publish it to an MQTT broker.

## Prerequisites

You need to have a running [MQTT broker](https://github.com/home-assistant/addons/tree/master/mosquitto) instance.

## Configuration

The add-on can be configured using the following parameters:

__user__: A Solix API client id.

__password__: The client secret.

__country__: A two-letter country code (e.g. DE).

__mqtt_uri__: The MQTT broker URL, e.g. mqtt://homeassistant.local:1883.

__mqtt_username__: Optional username for MQTT authentication.

__mqtt_password__: Optional password for MQTT authentication.

__mqtt_topic__: Topic where data will be be published.

## Troubleshooting
In order to test the communication it is helpful to use a MQTT client tool like [MQTT Explorer](https://mqtt-explorer.com/) which is also available as an [add-on](https://github.com/home-assistant/addons/tree/master/mosquitto) for Home Assistant.

The underlaying [anker-splix-api](https://github.com/thomluther/anker-solix-api/tree/main) library polls the data from the Anker API and publishes the result as JSON message to the specified MQTT topic for each site. If your `` mqtt_topic`` is _anker/solix_ and one of your sites is named _Balkonsolar_ you should see a message for the topic ```anker/solix/Balkonsolar/scenInfo```.

## Support
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/markusmauch)
