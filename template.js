const logToConsole = require('logToConsole');
const getContainerVersion = require('getContainerVersion');
const getRequestHeader = require('getRequestHeader');
const getAllEventData = require('getAllEventData');
const encodeUriComponent = require('encodeUriComponent');
const JSON = require('JSON');
const Object = require('Object');
const sendHttpRequest = require('sendHttpRequest');
const getType = require('getType');
const sha256Sync = require('sha256Sync');

const isLoggingEnabled = determinateIsLoggingEnabled();
const traceId = isLoggingEnabled ? getRequestHeader('trace-id') : undefined;

const eventData = getAllEventData();
const eventNameData = getEventNameData();
const eventName = eventNameData.e_n;

let postUrl = data.trackingUrl;
const params = getMatomoParams(eventNameData);

if (data.parametersToOverride && data.parametersToOverride.length) {
  data.parametersToOverride.forEach((param) => {
    if (isValidParam(params[param.name])) {
      params[param.name] = param.value;
    }
  });
}

const queryParamsString = objectToQueryString(params);
if (queryParamsString) {
  postUrl = postUrl + '?' + queryParamsString;
}

const headers = {
  'Content-Type': 'text/plain;charset=UTF-8',
};

if (data.requestHeaders && data.requestHeaders.length) {
  data.requestHeaders.forEach((header) => {
    headers[header.name] = header.value;
  });
}

if (isLoggingEnabled) {
  logToConsole(
    JSON.stringify({
      Name: 'MatomoAdvancedTag',
      Type: 'Request',
      TraceId: traceId,
      EventName: eventName,
      RequestMethod: 'POST',
      RequestUrl: postUrl,
      RequestHeaders: headers,
    })
  );
}

sendHttpRequest(postUrl, {
  headers: headers,
  method: 'POST',
})
  .then((response) => {
    if (isLoggingEnabled) {
      logToConsole(
        JSON.stringify({
          Name: 'MatomoAdvancedTag',
          Type: 'Response',
          TraceId: traceId,
          EventName: eventName,
          ResponseStatusCode: response.statusCode,
          ResponseHeaders: response.headers,
          ResponseBody: response.body,
        })
      );
    }
    if(!data.useOptimisticScenario) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        data.gtmOnSuccess();
      } else {
        data.gtmOnFailure();
      }
    }
  })
  .catch(() => {
    data.gtmOnFailure();
  });

function objectToQueryString(obj) {
  return Object.keys(obj)
    .map((key) =>
      isValidParam(obj[key]) ? key + '=' + encodeUriComponent(obj[key]) : key
    )
    .join('&');
}

function determinateIsLoggingEnabled() {
  const containerVersion = getContainerVersion();
  const isDebug = !!(
    containerVersion &&
    (containerVersion.debugMode || containerVersion.previewMode)
  );

  if (!data.logType) {
    return isDebug;
  }

  if (data.logType === 'no') {
    return false;
  }

  if (data.logType === 'debug') {
    return isDebug;
  }

  return data.logType === 'always';
}

function getEventNameData() {
  if (data.eventType === 'inherit') {
    if (eventData.event_name === 'page_view') {
      return {
        'e_c': '',
        'e_a': '',
        'e_n': eventData.event_name
      };
    }
    return {
      'e_c': eventData.event_category,
      'e_a': eventData.event_action,
      'e_n': eventData.event_name
    };
  } else {
    return {
      'e_c': data.eventCategory,
      'e_a': data.eventAction,
      'e_n': data.eventName,
    };
  }
}

function getMatomoParams(eventNameData) {
  const visitorId = eventData.client_id
    ? sha256Sync(eventData.client_id.split('.').join(''))
        .split(']')
        .join('')
        .split('[')
        .join('')
        .slice(0, 16)
    : '';

  const matomoParams = {
    // Required parameters
    idsite: data.siteId,
    rec: 1,

    // Recommended parameters
    action_name: eventNameData.e_n === 'page_view' ? eventData.page_title : eventNameData.e_a,
    url: eventData.page_location,
    _id: visitorId,
    rand: eventData['x-ga-page_id'],
    apiv: 1,

    // Optional User info
    urlref: eventData.page_referrer,
    res: eventData.screen_resolution,
    h: '',
    m: '',
    s: '',
    cookie: '',
    ua: eventData.user_agent,
    uadata: '',
    lang: eventData.lang || eventData.language,
    uid: eventData.uid || eventData.user_id,
    cid: visitorId,
    new_visit: '',

    // Acquisition Channel Attribution
    _rcn: eventData.affiliation,
    _rck: '',

    // Optional Action info
    cvar: '',
    link: '',
    download: '',
    search: eventData.search || eventData.search_term,
    search_cat: '',
    search_count: '',
    pv_id: eventData['x-ga-page_id'],
    idgoal: data.enableEcommerceTracking ? 0 : '',
    revenue: eventData.value,
    gt_ms: '',
    cs: '',
    ca: '',

    // Page Performance Info
    pf_net: '',
    pf_srv: '',
    pf_tfr: '',
    pf_dm1: '',
    pf_dm2: '',
    pf_onl: '',

    // Event Tracking info
    e_c: eventNameData.e_c,
    e_a: eventNameData.e_a,
    e_n: eventNameData.e_n,
    e_v: eventNameData.e_n === 'page_view' ? '' : eventData.value,

    // Optional Content Tracking info
    c_n: '',
    c_p: '',
    c_t: '',
    c_i: '',

    // Optional Ecommerce info
    ec_id: eventData.ec_id || eventData.transaction_id,
    ec_items: eventData.items
      ? JSON.stringify(
          eventData.items.map((item) => [
            item.item_id,
            item.item_name,
            item.item_category,
            item.price,
            item.quantity,
          ])
        )
      : '',
    ec_st: eventData.value,
    ec_tx: eventData.tax,
    ec_sh: eventData.shipping,
    ec_dt: eventData.discount_amount,

    // Other parameters
    token_auth: data.tokenAuth,
    cip: data.tokenAuth ? eventData.ip_override : '',
    cdt: '',
    country: '',
    region: '',
    city: '',
    lat: '',
    long: '',

    // Media Analytics
    ma_id: '',
    ma_ti: '',
    ma_re: '',
    ma_mt: '',
    ma_pn: '',
    ma_st: '',
    ma_le: '',
    ma_ps: '',
    ma_ttp: '',
    ma_w: '',
    ma_h: '',
    ma_fs: '',
    ma_se: '',
  };

  return Object.keys(matomoParams).reduce((acc, key) => {
    if (isValidParam(matomoParams[key])) {
      acc[key] = matomoParams[key];
    }
    return acc;
  }, {});
}

function isValidParam(value) {
  const valueType = getType(value);
  return valueType !== 'undefined' && valueType !== 'null' && value !== '';
}
