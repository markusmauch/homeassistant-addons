# Anker Solix Solarbank E1600 to MQTT

This addon uses the [solix2mqtt](https://github.com/tomquist/solix2mqtt) library to poll the Solix API for the latest sample data and publish it to an MQTT broker.

## Prerequisites

You need to have a running [MQTT broker](https://github.com/home-assistant/addons/tree/master/mosquitto) instance.

## Configuration

The add-on can be configured using the following parameters:

__user__: A Solix API client id

__password__: The client secret

__country__: A two-letter country code (e.g. DE)

__mqtt_uri__: The MQTT broker URL, e.g. mqtt://homeassistant.local:1883

__mqtt_username__: Optional username for MQTT authentication

__mqtt_password__: Optional password for MQTT authentication

__mqtt_topic__: Topic where data will be be published

## Troubleshooting
 In order to test the communication it is helpful to use a MQTT client tool like [MQTT Explorer](https://mqtt-explorer.com/) which is also [available as an add-on](https://github.com/home-assistant/addons/tree/master/mosquitto) for Home Assistant.

The underlaying solix2mqtt library polls the data from the Anker API and publishes the result as JSON to the specified __mqtt_topic__. If your mqtt_topic is '' You should see

```
site_list:
  - site_id: string
    site_name: string
    site_img: string
    device_type_list:
      - integer
      - integer
    ms_type: integer
    power_site_type: integer
    is_allow_delete: boolean

solar_list:
  - device_sn: string
    device_name: string
    device_img: string
    bind_site_status: string
    generate_power: string
    power_unit: string
    status: string
    wireless_type: string
    device_pn: string
    main_version: string

pps_list: []

solarbank_list:
  - device_pn: string
    device_sn: string
    device_name: string
    device_img: string
    battery_power: string
    bind_site_status: string
    charging_power: string
    power_unit: string
    charging_status: string
    status: string
    wireless_type: string
    main_version: string
    photovoltaic_power: string
    output_power: string
    create_time: integer
    set_load_power: string

powerpanel_list: []
```

```
type: object
properties:
  home_info:
    type: object
    properties:
      home_name: string
      home_img: string
      charging_power: string
      power_unit: string
    required: [home_name, home_img, charging_power, power_unit]

  solar_list:
    type: array
    items:
      type: object
      properties:
        device_sn: string
        device_name: string
        device_img: string
        bind_site_status: string
        generate_power: string
        power_unit: string
        status: string
        wireless_type: string
        device_pn: string
        main_version: string
      required: [device_sn, device_name, device_img, bind_site_status, generate_power, power_unit, status, wireless_type, device_pn, main_version]

  pps_info:
    type: object
    properties:
      pps_list: array
      total_charging_power: string
      power_unit: string
      total_battery_power: string
      updated_time: string
      pps_status: integer
    required: [pps_list, total_charging_power, power_unit, total_battery_power, updated_time, pps_status]

  statistics:
    type: array
    items:
      type: object
      properties:
        type: string
        total: string
        unit: string
      required: [type, total, unit]

  topology_type: string

  solarbank_info:
    type: object
    properties:
      solarbank_list:
        type: array
        items:
          type: object
          properties:
            device_pn: string
            device_sn: string
            device_name: string
            device_img: string
            battery_power: string
            bind_site_status: string
            charging_power: string
            power_unit: string
            charging_status: string
            status: string
            wireless_type: string
            main_version: string
            photovoltaic_power: string
            output_power: string
            create_time: integer
            set_load_power: string
          required: [device_pn, device_sn, device_name, device_img, battery_power, bind_site_status, charging_power, power_unit, charging_status, status, wireless_type, main_version, photovoltaic_power, output_power, create_time, set_load_power]
      total_charging_power: string
      power_unit: string
      charging_status: string
      total_battery_power: string
      updated_time: string
      total_photovoltaic_power: string
      total_output_power: string
      display_set_power: boolean
    required: [solarbank_list, total_charging_power, power_unit, charging_status, total_battery_power, updated_time, total_photovoltaic_power, total_output_power, display_set_power]

  retain_load: string
  updated_time: string
  power_site_type: integer
  site_id: string
  powerpanel_list: array

required: [home_info, solar_list, pps_info, statistics, topology_type, solarbank_info, retain_load, updated_time, power_site_type, site_id, powerpanel_list]


```

## Support
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/markusmauch)
