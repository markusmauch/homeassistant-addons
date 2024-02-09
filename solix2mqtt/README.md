# Anker Solix Solarbank E1600 to MQTT

This addon uses the [solix2mqtt](https://github.com/tomquist/solix2mqtt) library to poll the Solix API for the latest sample data and publish them to an MQTT broker.

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

### Change log

#### Version 1.2
- Added site_name parameter
- mqtt_host has been replaced by mqtt_uri
- Added mqtt_topic to use a custom topic

##### Breaking changes
- Replacement of parameter mqtt_host requires to specify the complete host URI (https://datatracker.ietf.org/doc/html/rfc3986).

<div>
    <script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="markusmauch" data-color="#FFDD00" data-emoji=""  data-font="Poppins" data-text="Buy me a coffee" data-outline-color="#000000" data-font-color="#000000" data-coffee-color="#ffffff" ></script>
</div>