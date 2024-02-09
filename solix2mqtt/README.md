# Anker Solix Solarbank E1600 to MQTT

This addon uses the [solix2mqtt](https://github.com/tomquist/solix2mqtt) library to poll the Solix API for the latest sample data and publish them to an MQTT broker.

## Configuration

The app can be configured using the following parameters:

__user__: A Solix API client id

__password__: The client secret

__country__: A two-letter country code (e.g. DE)

__mqtt_uri__: The MQTT broker URL, e.g. mqtt://homeassistant.local:1883

__mqtt_username__: Optional username for MQTT authentication

__mqtt_password__: Optional password for MQTT authentication

## Breaking changes

### Version 1.2

- Configuration parameter mqtt_host has been replaced by mqtt_uri. So it is now possible __and required__ to also specify the protocol and port.