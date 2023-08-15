# Matomo Advanced tag for Google Tag Manager Server Side

Matomo Advanced Tag automatically parses event data in the server Google Tag Manager container and tries to map it to standard events or e-commerce tracking.

Event set-up methods:
- Inherit from client. The tag will automatically parse event data and map available data.
- Custom. With the help of this method, you can track pageviews and other custom events by adding event category, event action, and event name.

Types of actions that server-side Matomo tag supports:
- pageview
- event tracking
- e-commerce tracking

## How to use the Matomo Advanced tag:


**Tracking URL** - Tracking HTTP API endpoint, for example, https://your-matomo-domain.example/matomo.php

**Matomo site ID** - The ID of the website you want to set up tracking for. To find the tracking ID click on the gear button in the top right corner, click Websites, then manage and you will find the site ID in Manage Measurables table.

**Auth token** - AuthToken is used to set the correct IP Address. Available In Matomo under Settings > Personal > Security > Auth Token. Optional (if it isn’t set, the IP & Region displayed in Matomo will be incorrect).

**Enable E-commerce Tracking** - Tag will try to map ecommerce data.

**Use Optimistic Scenario** - The tag will call gtmOnSuccess() without waiting for a response from the API.

**Event Parameters** - Here, you can specify which parameters you want to override.

**Request Headers** - Add the request headers name and value you want to add to the Matomo requests.

**Logs Settings** - Specify whether the tag should write to the logs to stape.


## Open Source

Matomo Advanced Tag for GTM Server Side is developed and maintained by [Stape Team](https://stape.io/) under the Apache 2.0 license.
