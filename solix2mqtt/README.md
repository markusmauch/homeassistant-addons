# Anker Solix Solarbank E1600 to MQTT

This addon uses the [anker-splix-api](https://github.com/thomluther/anker-solix-api) library to poll the Solix API for the latest sample data and publish it to an MQTT broker.

## Prerequisites

You need to have a running [MQTT broker](https://github.com/home-assistant/addons/tree/master/mosquitto) instance.

## Configuration

The add-on can be configured using the following parameters:

**user**: A Solix API client id.

**password**: The client secret.

**country**: A two-letter country code (e.g. DE).

**mqtt_uri**: The MQTT broker URL, e.g. mqtt://homeassistant.local:1883.

**mqtt_username**: Optional username for MQTT authentication.

**mqtt_password**: Optional password for MQTT authentication.

**mqtt_topic**: Topic where data will be be published.

## Exposed sensors

For the data retrieved from the Anker endpoint the following sensor entites are generated _per site_ via [MQTT discovery](https://www.home-assistant.io/integrations/mqtt/#mqtt-discovery):

| name                                           | unique_id                                       | value type | value source |
| ---------------------------------------------- | ----------------------------------------------- | ---------- | ------------ |
| Solarbank E1600 {site_name} Battery Level      | solarbank*e1600*{site_name}\_battery_level      | numeric    | state        |
| Solarbank E1600 {site_name} Photovoltaic Power | solarbank*e1600*{site_name}\_photovoltaic_power | numeric    | state        |
| Solarbank E1600 {site_name} Photovoltaic Yield | solarbank*e1600*{site_name}\_photovoltaic_yield | numeric    | state        |
| Solarbank E1600 {site_name} Output Power       | solarbank*e1600*{site_name}\_output_power       | numeric    | state        |
| Solarbank E1600 {site_name} Charging Power     | solarbank*e1600*{site_name}\_charging_power     | numeric    | state        |
| Solarbank E1600 {site_name} Last Update        | solarbank*e1600*{site_name}\_last_update        | numeric    | state        |
| Solarbank E1600 {site_name} Charging Status    | solarbank*e1600*{site_name}\_charging_status    | numeric    | state        |
| Solarbank E1600 {site_name} CO2 Savings        | solarbank*e1600*{site_name}\_co2_savings        | numeric    | state        |
| Solarbank E1600 {site_name} Saved Costs        | solarbank*e1600*{site_name}\_saved_costs        | numeric    | state        |
| Solarbank E1600 {site_name} Schedule           | solarbank*e1600*{site_name}\_schedule           | JSON       | attribute    |
| Solarbank E1600 {site_name} Site Homepage      | solarbank*e1600*{site_name}\_site_homepage      | JSON       | attribute    |

## Troubleshooting

In order to test the communication it is helpful to use a MQTT client tool like [MQTT Explorer](https://mqtt-explorer.com/) which is also available as an [add-on](https://github.com/home-assistant/addons/tree/master/mosquitto) for Home Assistant.

The underlaying [anker-splix-api](https://github.com/thomluther/anker-solix-api/tree/main) library polls the data from the Anker API and publishes the result as JSON message to the specified MQTT topic for each site. If your ` mqtt_topic` is _anker/solix_ and one of your sites is named _Balkonsolar_ you should see a message for the topic `anker/solix/Balkonsolar/scene_info`.

## Aknowledgements

This add on is based on the great work of:

- [anker-solix-api](https://github.com/thomluther/anker-solix-api)
- [python-eufy-security](https://github.com/FuzzyMistborn/python-eufy-security)
- [solix2mqtt](https://github.com/tomquist/solix2mqtt)

## Support

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/markusmauch)
