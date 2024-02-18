# Version 1.4
## New features
- Use python library (https://github.com/thomluther/anker-solix-api/tree/main)
- Show sensors for all available sites.

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