# Version 1.8

## New features

- Bump anker-solix-api to latest version (1.8.0)
- Add support for long term statistics sensors
- Fix state topic string

# Version 1.6

## New features

- Create sensors for all sites
- Upgrade to latest anker-solix-api library (https://github.com/thomluther/anker-solix-api)

## Breaking changes

- In order to create sensors for all sites it was required to add the site name in the unique id of the sensors that are automatically provided by the MQTT discovery. Existing refernces (e.g. in dahsboard cards or templates) need to be updated.

# Version 1.5

## New features

- Use official home-assistant python:3.12/alpine3.19 base image

# Version 1.4

## New features

- Use python library (https://github.com/thomluther/anker-solix-api)
- Retrieve all available sites.
- Add support for aarch64, amd64, armhf and i386

# Version 1.3

## New features

- Added schedule (read-only)
- Added site homepage (read-only)

# Version 1.2

## New features

- mqtt_host has been replaced by mqtt_uri
- Added mqtt_topic to use a custom topic
- Added statistics

## Breaking changes

- Replacement of parameter mqtt_host requires to specify the complete host URI (https://datatracker.ietf.org/doc/html/rfc3986).
