# Matomo Advanced tag for Google Tag Manager Server Side

Matomo Advanced provides an ability to send events to Matomo using Measurement Protocol. 
There are few key features provided by current tag:
- Ability to override parameters
- Auth token support
- Compatible with Google Analytics 4 Measurement Protocol

## How to use the Matomo Advanced tag:

1. Create a Matomo Advanced tag and add GA4 triggers
2. Provide Required parameters (Tracking url and Matomo site ID)

**Tracking url** - Provide your Matomo tracking url. For example: https://your-matomo-domain.com/matomo.php

**Matomo site ID** - Provide your Matomo site ID. For example: 1

**Redact visitor IP address** - Remove visitor IP address from the event. Reports based on the event will not include geographic information.

**Event Name** - The event name to send to Matomo. If this field is blank, the value of the event_name parameter will be sent.

**Event Parameters** - Specify which parameters you want to include by default, add overwrites or remove existing.

**Logs Settings** - Specify whether the tag should write to the logs.


### Useful links:

## Open Source

Matomo Advanced Tag for GTM Server Side is developed and maintained by [Stape Team](https://stape.io/) under the Apache 2.0 license.
