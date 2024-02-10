# Anker Solix Solarbank E1600 to MQTT

This addon uses the [solix2mqtt](https://github.com/tomquist/solix2mqtt) library to poll the Solix API for the latest sample data and publish it to an MQTT broker.

## Prerequisites

You need to have a running [MQTT broker](https://github.com/home-assistant/addons/tree/master/mosquitto) instance.

## Configuration

The add-on can be configured using the following parameters:

__user__: A Solix API client id

__password__: The client secret

__country__: A two-letter country code (e.g. DE)

__site_name__: The system name (can be specified in the anker app)

__mqtt_uri__: The MQTT broker URL, e.g. mqtt://homeassistant.local:1883

__mqtt_username__: Optional username for MQTT authentication

__mqtt_password__: Optional password for MQTT authentication

__mqtt_topic__: Topic where data will be be published

## Support
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/markusmauch)
