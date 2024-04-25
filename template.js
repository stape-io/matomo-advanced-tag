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
if (postUrl.indexOf('matomo.php', postUrl.length - 10) === -1) {
  postUrl = postUrl + 'matomo.php';
}

const params = getMatomoParams(eventNameData);

if (data.parametersToOverride && data.parametersToOverride.length) {
  data.parametersToOverride.forEach((param) => {
    if (isValidParam(param.value)) {
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
    if (!data.useOptimisticScenario) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        data.gtmOnSuccess();
      } else {
        data.gtmOnFailure();
      }
    }
  })
  .catch(() => {
    if (!data.useOptimisticScenario) {
      data.gtmOnFailure();
    }
  });

if (data.useOptimisticScenario) {
  data.gtmOnSuccess();
}

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
    if (
      eventData.event_name === 'page_view' ||
      eventData.event_name === 'Data' ||
      !eventData.event_name
    ) {
      return {
        e_c: '',
        e_a: '',
        e_n: 'page_view',
      };
    }

    return {
      e_c: eventData.event_category,
      e_a: eventData.event_action,
      e_n: eventData.event_name,
    };
  } else {
    return {
      e_c: data.eventCategory,
      e_a: data.eventAction,
      e_n: data.eventName,
    };
  }
}

function getECItems() {
  if (eventData.ec_items) {
    return eventData.ec_items;
  }

  return eventData.items
    ? JSON.stringify(
        eventData.items.map((item) => [
          item.item_id,
          item.item_name,
          item.item_category,
          item.price,
          item.quantity,
        ])
      )
    : '';
}

function getVisitorId() {
  if (eventData['_id']) {
    return eventData['_id'];
  }

  return eventData.client_id
    ? sha256Sync(eventData.client_id.split('.').join(''))
        .split(']')
        .join('')
        .split('[')
        .join('')
        .slice(0, 16)
    : '';
}

function getMatomoParams(eventNameData) {
  const visitorId = getVisitorId();

  const matomoParams = {
    // Required parameters
    idsite: data.siteId,
    rec: eventData.rec || 1,

    // Recommended parameters
    action_name:
      eventNameData.e_n === 'page_view'
        ? eventData.page_title || eventData.action_name
        : eventNameData.e_a,
    url: eventData.page_location || eventData.url,
    _id: visitorId,
    rand: eventData['x-ga-page_id'],
    apiv: eventData.apiv || 1,

    // Optional User info
    urlref: eventData.page_referrer || eventData.urlref || eventData.referrer,
    res: eventData.screen_resolution || eventData.res,
    h: eventData.h,
    m: eventData.m,
    s: eventData.s,
    cookie: eventData.cookie,
    ua: eventData.user_agent,
    uadata: eventData.uadata,
    lang: eventData.lang || eventData.language,
    uid: eventData.uid || eventData.user_id,
    cid: visitorId,
    new_visit: eventData.new_visit,

    // Acquisition Channel Attribution
    _rcn: eventData.affiliation || eventData['_rcn'],
    _rck: eventData['_rck'],

    // Optional Action info
    cvar: eventData.cvar,
    link: eventData.link,
    download: eventData.download,
    search: eventData.search || eventData.search_term,
    search_cat: eventData.search_cat,
    search_count: eventData.search_count,
    pv_id: eventData['x-ga-page_id'],
    idgoal: data.enableEcommerceTracking ? 0 : '',
    revenue: eventData.revenue || eventData.value,
    gt_ms: eventData.gt_ms,
    cs: eventData.cs,
    // ca: eventData.ca, // Not supported

    // Page Performance Info
    pf_net: eventData.pf_net,
    pf_srv: eventData.pf_srv,
    pf_tfr: eventData.pf_tfr,
    pf_dm1: eventData.pf_dm1,
    pf_dm2: eventData.pf_dm2,
    pf_onl: eventData.pf_onl,

    // Event Tracking info
    e_c: eventNameData.e_c,
    e_a: eventNameData.e_a,
    e_n: eventNameData.e_n,
    e_v: eventNameData.e_n === 'page_view' ? '' : eventData.value,

    // Optional Content Tracking info
    c_n: eventData.c_n,
    c_p: eventData.c_p,
    c_t: eventData.c_t,
    c_i: eventData.c_i,

    // Optional Ecommerce info
    ec_id: eventData.ec_id || eventData.transaction_id,
    ec_items: getECItems(),
    ec_st: eventData.value || eventData.ec_st,
    ec_tx: eventData.ec_tx || eventData.tax,
    ec_sh: eventData.ec_sh || eventData.shipping,
    ec_dt: eventData.ec_dt || eventData.discount_amount,

    // Other parameters
    token_auth: data.tokenAuth,
    cip: data.tokenAuth ? eventData.cip || eventData.ip_override : '',
    cdt: eventData.cdt,
    country: eventData.country,
    region: eventData.region,
    city: eventData.city,
    lat: eventData.lat,
    long: eventData.long,

    // Media Analytics
    ma_id: eventData.ma_id,
    ma_ti: eventData.ma_ti,
    ma_re: eventData.ma_re,
    ma_mt: eventData.ma_mt,
    ma_pn: eventData.ma_pn,
    ma_st: eventData.ma_st,
    ma_le: eventData.ma_le,
    ma_ps: eventData.ma_ps,
    ma_ttp: eventData.ma_ttp,
    ma_w: eventData.ma_w,
    ma_h: eventData.ma_h,
    ma_fs: eventData.ma_fs,
    ma_se: eventData.ma_se,
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
