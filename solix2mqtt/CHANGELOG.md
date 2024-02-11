
# Version 1.2

## New features
- mqtt_host has been replaced by mqtt_uri
- Added mqtt_topic to use a custom topic
- Added statistics
- Added schedule (read-only)

## Breaking changes
- Replacement of parameter mqtt_host requires to specify the complete host URI (https://datatracker.ietf.org/doc/html/rfc3986).