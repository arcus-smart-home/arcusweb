/**
 * Copyright 2019 Arcus Project
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'can-stache-bindings';
import config from 'i2web/config';
import stache from 'can-stache';
import moment from 'moment/';
import momentDurationFormatSetup from 'moment-duration-format';
import temperatureConverter from 'i2web/plugins/temperature-converter';
import { plans } from 'config/plans.json';
import SidePanel from 'i2web/plugins/side-panel';
import AppState from 'i2web/plugins/get-app-state';
import canDev from 'can-util/js/dev/';
import isString from 'lodash/isString';

momentDurationFormatSetup(moment);

/**
 * @function close-button
 * @param {Object} An options that optionally includes the following properties on the hash:
 * @option {String} [type] Adds a default class and text to build a Cancel button
 * @option {String} [text] The text to display on the button (default: Done)
 * @option {String} [class] Space-separate class list to apply to the button (default: '')
 * @option {boolean} [disabled] Whether the button should be disabled (default: false)
 */
const closeButtonTemplate = stache('<button type="button" class="btn-{{className}}" ($click)="closePanel()" {$disabled}="disabled">{{{text}}}</button>');
stache.registerSimpleHelper('close-button', function helper(options) {
  const text = (options.hash.type === 'cancel' && !options.hash.text && 'Cancel') || options.hash.text || 'Done';
  const className = (options.hash.type === 'cancel' && !options.hash.class && 'cancel') || options.hash.class || '';
  const disabled = options.hash.disabled && options.hash.disabled.isComputed ? options.hash.disabled() : !!options.hash.disabled;

  return closeButtonTemplate({
    closePanel() {
      SidePanel.close();
    },
    text,
    className,
    disabled,
  });
});

export function getRedirectionURL(key) {
  const sessionRedirectUrl = AppState().attr('session.redirectBaseUrl');
  const redirectUrl = sessionRedirectUrl || config.redirectUrl;
  return `${redirectUrl}/${key}`;
}
stache.registerSimpleHelper('redirectToUrl', getRedirectionURL);

stache.registerSimpleHelper('round', function round(value) {
  return Math.round(value);
});

stache.registerSimpleHelper('iconOf', function matchRoute(thing, type) {
  // If thing doesn't have an icon attribute, return the empty string
  if (!thing.attr('icon')) { return ''; }

  return (function iconOf(returnType, value) {
    switch (returnType) {
      case 'url':
        return `<img class="avatar" src="${value}" />`;
      case 'class':
        return value;
      case 'icon':
      default:
        return `<i class="${value} icon"></i>`;
    }
  }((typeof type === 'string' ? type : thing.attr('icon').type), thing.attr('icon').value));
});

stache.registerSimpleHelper('%indexNum', function indexNum(offset, options) {
  return options.scope.get('%index') + offset;
});

export const costOf = function costOf(planName, per = false, cycle = 'month') {
  const plan = planName && plans[planName];
  if (plan) {
    const price = plan.price || 0;
    const displayPrice = plan[`${cycle}DisplayPrice`] || '-';
    const frequency = (per) ? ` per ${cycle}` : `/${cycle}`;
    return `${price > 0 ? '$' : ''}${displayPrice}${price > 0 ? frequency : ''}`;
  }
  return '-';
};

stache.registerConverter('FtoC', {
  get(compute) {
    const val = compute();
    return temperatureConverter(val, 'F');
  },
  set(newVal, compute) {
    compute(temperatureConverter(newVal, 'C'));
  },
});

export const formatTime = function formatTime(timestamp, format) {
  let fmt = format;
  if (typeof format !== 'string') {
    fmt = 'h:mm A';
  }
  return moment(timestamp).format(fmt);
};


export const formatDate = function formatDate(mostRecent, format) {
  const today = moment().startOf('day');
  if (moment(mostRecent).isSameOrAfter(today)) {
    return 'Today';
  }

  const yesterday = today.subtract(1, 'day').startOf('day');
  if (moment(mostRecent).isSameOrAfter(yesterday)) {
    return 'Yesterday';
  }

  let fmt = format;
  if (typeof format !== 'string') {
    fmt = 'ddd MMM DD';
  }

  return moment(mostRecent).format(fmt);
};

// formats a duration into a string like 'X hours', 'X minutes' or 'X hours, Y minutes'
// could be further expanded to take more configuration to handle other scenarios
export function formatDuration(value, unit, templateOrHelperInfo) {
  const template = isString(templateOrHelperInfo) ? templateOrHelperInfo : null;
  const units = unit.toLowerCase();

  switch (units) {
    case 'minutes':
    case 'hours':
    case 'seconds':
    case 'days':
      break;
    default:
      canDev.warn('formatDuration helper: unknown unit provided');
      return '';
  }

  return moment.duration(value, units).format({
    template: template || 'd [days], h [hours], m [minutes]',
    trim: 'both',
  });
}

export const formatTemp = function formatTemp(value, destDegree = 'F') {
  // The strings and values undefined and null should return '-' but 0 should not
  // since it is a value that should be converted to fahrenheit.
  if (!(+value) && (+value) !== 0) {
    return '-';
  }

  return temperatureConverter(value, destDegree);
};

export const formatPrice = function formatPrice(value) {
  return (value) ? value.toFixed(2) : Number(0).toFixed(2);
};

export const formatPhoneNumber = function formatPhone(value) {
  return value.replace(/[^\d]/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

stache.registerSimpleHelper('costOf', costOf);
stache.registerSimpleHelper('format-time', formatTime);
stache.registerSimpleHelper('format-date', formatDate);
stache.registerSimpleHelper('format-duration', formatDuration);
stache.registerSimpleHelper('format-temp', formatTemp);
stache.registerSimpleHelper('format-price', formatPrice);
stache.registerSimpleHelper('format-phone-number', formatPhoneNumber);

stache.registerHelper('isIE', function isIE(options) {
  const userAgent = window.navigator.userAgent;
  const areWeIE = userAgent.indexOf('MSIE') !== -1 ||
    userAgent.indexOf('Trident') !== -1;

  if (areWeIE) {
    return options.fn();
  }

  return options.inverse();
});

export const isIE11 = function isIE11() {
  const userAgent = window.navigator.userAgent;
  const trident = userAgent.indexOf('Trident/');
  if (trident >= 0) {
    const rv = userAgent.indexOf('rv:');
    return parseInt(userAgent.substring(rv + 3, userAgent.indexOf('.', rv)), 10) === 11;
  }
  return false;
};

export const isMobileBrowser = function isMobileBrowser() {
  const userAgent = window.navigator.userAgent;
  return /Mobi/i.test(userAgent) || /Tablet/i.test(userAgent);
};

export const isMobileSafari = function isMobileSafari() {
  const userAgent = window.navigator.userAgent;
  const isMobile = userAgent.indexOf('Mobile') > -1;
  const isSafari = (userAgent.indexOf('Safari') > -1) && !(userAgent.indexOf('Android') > -1);
  const isChrome = userAgent.indexOf('CriOS') > -1;
  return isMobile && isSafari && !isChrome;
};

export function isAndroid() {
  return /android/i.test(window.navigator.userAgent)
    && !/windows phone/i.test(window.navigator.userAgent);
}

export const isIOS = function isIOS() {
  const userAgent = window.navigator.userAgent;
  const isiPad = userAgent.match(/iPad/i);
  const isiPhone = userAgent.match(/iPhone/i);
  const isiPod = userAgent.match(/iPod/i);
  return isiPad || isiPhone || isiPod;
};

export const iosVersion = function iosVersion() {
  const v = (window.navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (v) {
    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
  }
  return undefined;
};
export const isIOS9 = function isIOS9() {
  if (isIOS()) {
    const version = iosVersion();
    return (version && version[0] === 9);
  }
  return false;
};
export const isIOS8 = function isIOS8() {
  if (isIOS()) {
    const version = iosVersion();
    return (version && version[0] === 8);
  }
  return false;
};

export const isDesktopSafari = function isDesktopSafari() {
  const userAgent = window.navigator.userAgent;
  const isMobile = userAgent.indexOf('Mobile') > -1;
  const isSafari = (userAgent.indexOf('Safari') > -1) && !(userAgent.indexOf('Android') > -1);
  const isChrome = (userAgent.indexOf('Chrome') > -1) || (userAgent.indexOf('Chromium') > -1);
  const isPhantomJS = userAgent.indexOf('PhantomJS') > -1;
  return !isMobile && isSafari && !isChrome && !isPhantomJS;
};

export const desktopSafariVersion = function desktopSafariVersion() {
  const userAgent = window.navigator.userAgent;
  const versionResult = /Version\/(\S+)/.exec(userAgent);
  return versionResult && versionResult[1];
};

export const isAndroidChrome = function isAndroidChrome() {
  const userAgent = window.navigator.userAgent;
  // per https://developer.chrome.com/multidevice/user-agent
  const osPattern = userAgent.indexOf('Android') > -1;
  const phonePattern = /Chrome\/[.0-9]* Mobile/.exec(userAgent);
  const tabletPattern = /Chrome\/[.0-9]* (?!Mobile)/.exec(userAgent);
  return osPattern && (phonePattern || tabletPattern);
};

stache.registerSimpleHelper('isIE11', isIE11);
stache.registerSimpleHelper('isMobileSafari', isMobileSafari);
stache.registerSimpleHelper('isIOS9', isIOS9);
stache.registerSimpleHelper('isIOS8', isIOS8);
stache.registerSimpleHelper('isIOS', isIOS);
stache.registerSimpleHelper('isDesktopSafari', isDesktopSafari);
stache.registerSimpleHelper('isAndroid', isAndroid);
stache.registerSimpleHelper('isAndroidChrome', isAndroidChrome);

// prevent double-tap-to-zoom behavior on Safari on iOS 10+
// However, this behavior is rather broad since it blocks some taps entirely, not just
// preventing particular behavior of those taps.
// Ideally we should use 'touch-action: manipulation' CSS rule. At the time of writing
// this rule didn't function as specified on Safari / iOS11.
let tappedRecently = false;
function tapHandler(event) {
  if (!tappedRecently) {
    tappedRecently = true;
    setTimeout(() => { tappedRecently = false; }, 400);
  } else {
    event.preventDefault();
  }
}

if (isMobileSafari()) {
  document.body.addEventListener('touchend', tapHandler);
}
