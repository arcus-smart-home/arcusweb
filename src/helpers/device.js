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

import stache from 'can-stache';
import _keysIn from 'lodash/keysIn';

stache.registerHelper('device-action', function deviceGetActionComponent(device, actionName, options) { // eslint-disable-line prefer-arrow-callback
  const componentName = `arcus-device-action-${actionName}`;
  const attributes = `{(device)}="device"`;
  const template = `<${componentName} ${attributes}/>`;

  return stache(template)({ device }, options.helpers, options.nodeList);
});

stache.registerHelper('device-badge', function deviceGetBadgeComponent(device, badgeName, options) { // eslint-disable-line prefer-arrow-callback
  const componentName = `arcus-device-badge-${badgeName}`;
  const attributes = `{(device)}="device"`;
  const template = `<${componentName} ${attributes}/>`;

  return stache(template)({ device }, options.helpers, options.nodeList);
});

stache.registerHelper('device-configurator', function deviceGetConfiguratorComponent(device, configuratorName, options) { // eslint-disable-line prefer-arrow-callback
  const componentName = `arcus-device-configurator-${configuratorName}`;
  const attributes = `{(device)}="device"`;
  const template = `<${componentName} ${attributes}/>`;

  return stache(template)({ device }, options.helpers, options.nodeList);
});

stache.registerHelper('device-configurator-accordion-panel', function deviceGetConfiguratorComponent(device, configuratorName, index, options) { // eslint-disable-line prefer-arrow-callback
  const componentName = `arcus-device-configurator-${configuratorName}`;
  const attributes = `{(device)}="device" {^title}="*title"`;

  return stache(`
    <arcus-accordion-panel {{#eq index 0}}{active}="true"{{/eq}}>
      <arcus-accordion-panel-heading>
        <h2>
          {{{*title}}}
        </h2>
      </arcus-accordion-panel-heading>
      <arcus-accordion-panel-body>
        <${componentName} ${attributes} />
      </arcus-accordion-panel-body>
    </arcus-accordion-panel>`)({ device, index }, options.helpers, options.nodeList);
});

stache.registerHelper('device-details', function deviceGetDetailsComponent(device, options) { // eslint-disable-line prefer-arrow-callback
  const componentName = `arcus-device-details-${device.attr('web:dev:devtypehint')}`;
  const attributes = `{(device)}="device"`;
  const template = `<${componentName} ${attributes}/>`;

  return stache(template)({ device }, options.helpers, options.nodeList);
});

stache.registerHelper('device-errors', function deviceGetErrorsComponent(device, msgType, options) { // eslint-disable-line prefer-arrow-callback
  const componentName = `arcus-device-errors-${device.attr('web:dev:customErrorComponent')}`;
  const attributes = `{(device)}="device" {(msg-type)}="'${msgType}'"`;
  const template = `<${componentName} ${attributes}/>`;

  return stache(template)({ device }, options.helpers, options.nodeList);
});

stache.registerHelper('device-template-to-string', function deviceMakeStringFromTemplate(device, property, options) { // eslint-disable-line prefer-arrow-callback
  const template = device.attr(property);
  if (template) {
    const renderer = stache(template);
    return renderer(device, options.helpers, options.nodeList);
  }
  const component = device.attr(`${property}Component`);
  if (component) {
    // web:card:status
    // web:card:hoverstatus
    // web:icon:onText
    // web:panel:status
    const [, location, type] = property.split(':');
    const renderer = stache(`<arcus-device-${location}-${type}-${component} {device}="device" />`);
    return renderer({ device }, options.helpers, options.nodeList);
  }
  return '';
});

export const deviceSupportLinkKey = function deviceSupportLinkKey(device) {
  if (device.attr('isOffline')) {
    return 's_devicetroubleshooting';
  } else if (device.attr('web:dev:hasCustomErrorLink')) {
    const deviceType = device.attr('web:dev:devtypehint');
    const baseURI = `support/devices/${deviceType}/${device.attr('dev:productId')}`;
    const devErrors = device.attr('errors');
    if (devErrors) {
      const devErrorKeys = _keysIn(devErrors);
      if (devErrorKeys.length) {
        const devErrorKey = devErrorKeys[0].replace(/\s/g, '').toLowerCase();
        return `${baseURI}/${devErrorKey}`;
      }
    }
  }
  return device.attr('web:dev:supportLinkKey');
};

stache.registerHelper('device-support-link-key', deviceSupportLinkKey);

export const signalSecurityIcon = function signalSecurityIcon(encryption) {
  if (encryption && encryption.toUpperCase() !== 'NONE') {
    return 'icon-platform-lock-1';
  }
  return '';
};

stache.registerHelper('signal-security-icon', signalSecurityIcon);

export const signalStrengthIcon = function signalStrengthIcon(rssi) {
  if (rssi < 0) {
    if (rssi < -100) return 'icon-app-wi-fi-0';
    if (rssi < -85 && rssi >= -100) return 'icon-app-wi-fi-1';
    if (rssi < -70 && rssi >= -85) return 'icon-app-wi-fi-2';
    if (rssi < -55 && rssi >= -70) return 'icon-app-wi-fi-3';
  } else {
    if (rssi < 21) return 'icon-app-wi-fi-0';
    if (rssi < 41 && rssi >= 21) return 'icon-app-wi-fi-1';
    if (rssi < 61 && rssi >= 41) return 'icon-app-wi-fi-2';
    if (rssi < 80 && rssi >= 61) return 'icon-app-wi-fi-3';
  }
  return 'icon-app-wi-fi-4';
};

stache.registerHelper('signal-strength-icon', signalStrengthIcon);

export const signalStrengthText = function signalStrengthText(rssi) {
  if (rssi < -100) return 'poor';
  if (rssi < -85 && rssi >= -100) return 'weak';
  if (rssi < -70 && rssi >= -85) return 'fair';
  if (rssi < -55 && rssi >= -70) return 'good';
  return 'excellent';
};

stache.registerHelper('signal-strength-text', signalStrengthText);

export default {
  deviceSupportLinkKey,
  signalStrengthIcon,
};
