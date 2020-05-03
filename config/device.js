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

import Somfyv1Caps from 'i2web/models/capability/Somfyv1';
import DevicePowerCaps from 'i2web/models/capability/DevicePower';

export const capabilityPlugins = {
  'valv:valvestate': {
    badges: ['opened'],
  },
  'halo:roomNames': {
    configurators: ['assign-halo-room'],
  },
  'cont:contact': {
    badges: ['opened'],
    configurators: ['contact-setting'],
  },
  'tilt:tiltstate': {
    badges: ['opened'],
    configurators: ['orientation'],
  },
  'temp:temperature': {
    badges() {
      if (['KeyPad', 'Button', 'vent', 'Contact', 'Motion', 'Halo'].includes(this.attr('dev:devtypehint'))) {
        return ['temperature'];
      }
      return [];
    },
  },
  'pow:instantaneous': {
    badges() {
      if (this.attr('pow:instantaneous')) {
        return ['power'];
      }
    },
  },
  'dim:brightness': {
    badges() {
      if (['Halo'].indexOf(this.attr('dev:devtypehint')) === -1) {
        return ['brightness'];
      }
      return [];
    },
    configurators: ['brightness'],
  },
  'ill:illuminance': {
    badges: ['illuminance'],
  },
  'uvi:index': {
    badges: ['ultraviolet-index'],
  },
  'light:colormode': {
    configurators() {
      const color = this.hasCapability('color');
      const colorTemp = this.hasCapability('colortemp');

      if (color || colorTemp) {
        if (['Halo'].indexOf(this.attr('dev:devtypehint')) !== -1) {
          return ['color'];
        }
        return ['color-or-colortemp'];
      }

      return [];
    },
  },
  'colortemp:colortemp': {
    badges: ['colortemp'],
    // NOTE: colortemp configurator is defined based on light:colormode
  },
  'pres:presence': {
    badges: ['presence'],
  },
  'pres:person': {
    configurators() {
      const configurators = ['assign-device'];
      if (this.attr('dev:devtypehint') === 'Pendant') {
        configurators.push('test-coverage');
      }
      return configurators;
    },
  },
  'fan:speed': {
    badges: ['fan-speed'],
    configurators: ['fan-speed'],
  },
  'petdoor:lockstate': {
    badges: ['lockState'],
    configurators: ['petdoor-smartkeys'],
  },
  'irrcont:controllerState': {
    badges: ['scheduleType'],
    configurators() {
      if (this.attr('dev:productId') !== 'deda9d') {
        return ['water-saver', 'irrigation-mode'];
      }
      return ['irrigation-mode'];
    },
  },
  'camera:resolution': {
    badges: ['camera-preview'],
    configurators: ['camera-resolution'],
  },
  'devpow:source': {
    badges() {
      if (this.attr('dev:devtypehint') === 'Camera'
        && this.attr('devpow:source') !== DevicePowerCaps.SOURCE_BATTERY) {
        return [];
      }
      return ['powerSource'];
    },
  },
  'waterheater:heatingstate': {
    badges: ['heatingState'],
  },
  'waterheater:hotwaterlevel': {
    badges: ['hotWaterLevel'],
    configurators: ['water-heater-mode'],
  },
  'aosmithwaterheatercontroller:controlmode': {
    badges: ['waterHeaterEnergySmart'],
  },
  'waterheater:setpoint': {
    badges: ['lowHeatTarget'],
  },
  'nesttherm:hasleaf': {
    badges: ['leaf'],
  },
  'therm:hvacmode': {
    badges: ['thermostat'],
    configurators() {
      return ['thermostat-mode'];
    },
  },
  'but:state': {
    configurators() {
      if (this.attr('dev:devtypehint') === 'Pendant') {
        return [];
      }
      return ['assign-buttons'];
    },
  },
  'humid:humidity': {
    badges() {
      if (this.attr('humid:humidity')) {
        return ['humidity'];
      }
    },
  },
  'atmos:pressure': {
    badges: ['pressure'],
  },
  'mot:sensitivity': {
    configurators() {
      return this.attr('mot:sensitivitiesSupported.length')
        ? ['motion-sensitivity']
        : [];
    },
  },
  'motdoor:doorstate': {
    badges: ['opened'],
  },
  'halo:haloalertstate': {
    configurators: ['test-halo'],
  },
  'wifi:ssid': {
    configurators() {
      const isSwann = this.attr('swannbatterycamera:sn');
      if (isSwann || this.attr('dev:devtypehint') !== 'Camera') {
        return ['wifi-read-only'];
      } else if (this.hasCapability('wifiscan')) {
        return ['wifiscan'];
      }
      return [];
    },
  },
  'watersoftener:rechargeStartTime': {
    configurators: ['water-softener-recharge-time'],
  },
  'camera:framerate': {
    configurators() {
      const isSwann = this.attr('swannbatterycamera:sn');
      if (isSwann) return [];
      return ['camera-framerate'];
    },
  },
  'camera:irLedMode': {
    configurators() {
      const isSwann = this.attr('swannbatterycamera:sn');
      if (isSwann) return [];
      return ['camera-ir-led-mode']
    },
  },
  'camera:flip': {
    configurators: ['camera-rotation'],
  },
  'ipinfo:ip': {
    configurators() {
      const isSwann = this.attr('swannbatterycamera:sn');
      if (this.attr('dev:devtypehint') === 'Camera' && !isSwann) {
        return ['camera-local-streaming'];
      }
      return [];
    },
  },
  'bridge:pairedDevices': {
    configurators() {
      if (this.attr('dev:devtypehint') === 'Genie Aladdin Controller') {
        return ['garage-door-controller'];
      }
      return [];
    },
  },
  'spaceheater:heatstate': {
    badges: ['spaceheater'],
    configurators: ['space-heater-mode'],
  },
  'noaa:alertstate': {
    configurators: ['noaa-location', 'noaa-radio', 'noaa-weather-alerts'],
  },
  'nesttherm:locked': {
    badges: ['temperatureLocked'],
  },
  'ecowater:continuousRate': {
    configurators: ['water-flow'],
  },
  'waterhardness:hardness': {
    configurators: ['water-hardness'],
  },
  'watersoftener:currentSaltLevel': {
    badges: ['salt-level'],
    configurators: ['water-salt-type'],
  },
  'flow:flow': {
    badges: ['gpm'],
  },
  'somfyv1:type': {
    badges: ['somfy-type'],
    configurators: ['somfy-type'],
  },
  'somfyv1:reversed': {
    badges() {
      if (this.attr('somfyv1:reversed') === Somfyv1Caps.REVERSED_REVERSED) {
        return ['somfy-reversed'];
      }
    },
    configurators: ['somfy-reversed'],
  },
  'somfyv1:currentstate': {
    configurators: ['somfy-customization'],
  },
  'somfyv1:channel': {
    badges: ['somfy-channel'],
  },
};

export const productConfig = {
  '0c9a66': {
    'web:icon:on': 'icon-platform-light-switch-1',
    'web:icon:off': 'icon-platform-light-switch-2',
    'web:icon:catalog': 'icon-platform-light-switch-2',
  },
  '0f1b61': {
    'web:dev:customErrorComponent': 'lutron',
  },
  162918: {
    'web:icon:on': 'icon-platform-swann-wifi-smart-switch-1',
    'web:icon:off': 'icon-platform-swann-wifi-smart-switch-2',
  },
  '220a4a': {
    'web:icon:on': 'icon-platform-gs-wifi-smart-plug-indoor-1',
    'web:icon:off': 'icon-platform-gs-wifi-smart-plug-indoor-2',
  },
  '2a97b9': {
    'web:icon:on': 'icon-platform-gs-wifi-smart-plug-outdoor-1',
    'web:icon:off': 'icon-platform-gs-wifi-smart-plug-outdoor-2',
  },
  '2c982d': {
    'web:icon:on': 'icon-platform-carep-1',
    'web:icon:off': 'icon-platform-carep-1',
    'web:icon:catalog': 'icon-platform-carep-1',
  },
  '33974d': {
    'web:icon:on': 'icon-platform-light-switch-1',
    'web:icon:off': 'icon-platform-light-switch-2',
    'web:icon:catalog': 'icon-platform-light-switch-2',
  },
  '3420b0': {
    'web:dev:customErrorComponent': 'lutron',
  },
  '359d72': {
    'web:icon:on': 'icon-platform-light-switch-1',
    'web:icon:off': 'icon-platform-light-switch-2',
    'web:icon:catalog': 'icon-platform-light-switch-2',
  },
  432011: {
    'web:icon:on': 'icon-platform-gs-openmotion-sensor-2',
    'web:icon:off': 'icon-platform-gs-motion-sensor-2',
  },
  432021: {
    'web:icon:on': 'icon-platform-gs-opencontact-sensor-2',
    'web:icon:off': 'icon-platform-gs-contact-sensor-2',
  },
  432031: {
    'web:icon:on': 'icon-platform-gs-keypad-2',
    'web:icon:off': 'icon-platform-gs-keypad-2',
  },
  432041: {
    'web:icon:on': 'icon-platform-gs-zigbee-smart-plug-1',
    'web:icon:off': 'icon-platform-gs-zigbee-smart-plug-2',
  },
  486390: {
    'web:icon:on': 'icon-platform-carep-1',
    'web:icon:off': 'icon-platform-carep-1',
    'web:icon:catalog': 'icon-platform-carep-1',
  },
  '671eee': {
    'web:icon:on': 'icon-platform-light-switch-1',
    'web:icon:off': 'icon-platform-light-switch-2',
    'web:icon:catalog': 'icon-platform-light-switch-2',
  },
  '700faf': {
    'web:icon:on': 'icon-platform-light-switch-1',
    'web:icon:off': 'icon-platform-light-switch-2',
    'web:icon:catalog': 'icon-platform-light-switch-2',
  },
  '76e484': {
    'web:icon:on': 'icon-platform-hinge-2',
    'web:icon:off': 'icon-platform-hinge-2',
    'web:icon:catalog': 'icon-platform-hinge-2',
  },
  '7b2892': {
    'web:dev:customErrorComponent': 'lutron',
  },
  'caefb1': {
    'web:dev:customErrorComponent': 'lutron',
  },
  'caefb2': {
    'web:dev:customErrorComponent': 'lutron',
  },
  'caefb3': {
    'web:dev:customErrorComponent': 'lutron',
  },
  cfc0b7: {
    'web:icon:on': 'icon-platform-light-switch-1',
    'web:icon:off': 'icon-platform-light-switch-2',
    'web:icon:catalog': 'icon-platform-light-switch-2',
  },
  deda9d: {
    'web:icon:catalog': 'icon-platform-hoseend-2',
  },
  e44e37: {
    'web:dev:customErrorComponent': 'lutron',
    'web:icon:on': 'icon-platform-light-switch-1',
    'web:icon:off': 'icon-platform-light-switch-2',
    'web:icon:catalog': 'icon-platform-light-switch-2',
  },
  'fec5d9': {
    'web:icon:on': 'icon-platform-swann-camera-2',
    'web:icon:off': 'icon-platform-swann-camera-2',
  },
};

export const deviceTypeConfig = {
  accessory: {
    'web:icon:on': 'icon-app-more-2',
    'web:icon:off': 'icon-app-more-2',
    'web:icon:catalog': 'icon-app-more-2',
  },
  alexa: {
    'web:icon:on': 'icon-platform-voice-assistant',
    'web:icon:off': 'icon-platform-voice-assistant',
    'web:icon:catalog': 'icon-platform-voice-assistant',
  },
  blind: {
    'web:icon:on': 'icon-platform-blinds-1',
    'web:icon:off': 'icon-platform-blinds-1',
    'web:icon:catalog': 'icon-platform-blinds-1',
  },
  bridge: {
    'web:icon:on': 'icon-platform-garage-bridge-2',
    'web:icon:off': 'icon-platform-garage-bridge-2',
    'web:icon:catalog': 'icon-platform-garage-bridge-2',
  },
  button: {
    'web:icon:on': 'icon-platform-button-2',
    'web:icon:off': 'icon-platform-button-2',
    'web:icon:catalog': 'icon-platform-button-2',
    'web:card:status': 'Ok',
    'web:card:hoverstatus': `{{#if ['temp:temperature']}}{{format-temp(['temp:temperature'], 'F')}}&deg;{{else}}Ok{{/if}}`,
  },
  camera: {
    'web:icon:on': 'icon-platform-camera-2',
    'web:icon:off': 'icon-platform-camera-2',
    'web:icon:catalog': 'icon-platform-camera-2',
    'web:panel:action': 'stream-record',
    'web:card:status': 'Ok',
    'web:card:hoveraction': 'stream-record',
  },
  contact: {
    'web:icon:on': 'icon-platform-opencontact-2',
    'web:icon:off': 'icon-platform-contact-2',
    'web:icon:catalog': 'icon-platform-contact-2',
    'web:card:status': `{{#if isOpen}}Open{{else}}Closed{{/if}}`,
    'web:panel:status': `{{#if isOpen}}Opened{{else}}Closed{{/if}}: {{format-date(['cont:contactchanged'])}} {{format-time(['cont:contactchanged'])}}`,
  },
  dimmer: {
    'web:icon:on': 'icon-platform-dimmer-1',
    'web:icon:off': 'icon-platform-dimmer-2',
    'web:icon:catalog': 'icon-platform-dimmer-2',
    'web:panel:action': 'toggle-on-off',
    'web:card:action': 'toggle-on-off',
    'web:card:status': `{{#unless isOn}}Off{{else}}{{['dim:brightness']}}% Brightness{{/unless}}`,
    'web:scene:groupString': 'Turn {{action}}',
    'web:dev:hasCustomErrorLink': true,
    'web:dev:scheduleConfig': 'lightsnswitches',
  },
  fancontrol: {
    'web:icon:on': 'icon-platform-fan-1',
    'web:icon:off': 'icon-platform-fan-2',
    'web:icon:catalog': 'icon-platform-fan-2',
    'web:panel:action': 'toggle-on-off',
    'web:card:action': 'toggle-on-off',
    'web:card:status': `{{#unless isOn}}Off{{else}}{{#eq ['fan:speed'] 0}}Off{{else}}On {{['fan:speedDescription']}}{{/eq}}{{/unless}}`,
    'web:scene:groupString': 'Turn {{action}}',
    'web:dev:scheduleConfig': 'fan',
  },
  garagedoor: {
    'web:icon:on': 'icon-platform-garage-2',
    'web:icon:off': 'icon-platform-garage-3',
    'web:icon:catalog': 'icon-platform-garage-2',
    'web:icon:onAndOpen': 'icon-platform-garage-3',
    'web:icon:onAndClosed': 'icon-platform-garage-2',
    'web:icon:offAndOpen': 'icon-platform-garage-3',
    'web:icon:offAndClosed': 'icon-platform-garage-2',
    'web:panel:action': 'open-close-door',
    'web:card:action': 'open-close-door',
    'web:card:status': `{{['motdoor:doorDescription']}}`,
    'web:dev:hasCustomErrorLink': true,
    'web:dev:scheduleConfig': 'garagedoor',
  },
  geniealaddincontroller: {
    'web:icon:on': 'icon-platform-garage-bridge-2',
    'web:icon:off': 'icon-platform-garage-bridge-2',
    'web:icon:catalog': 'icon-platform-garage-bridge-2',
    'web:card:hoverstatus': `{{['web:wifi:state']}}`,
  },
  glassbreak: {
    'web:icon:on': 'icon-platform-glass-break-2',
    'web:icon:off': 'icon-platform-glass-break-2',
    'web:icon:catalog': 'icon-platform-glass-break-2',
    'web:card:status': 'Ok',
    'web:card:hoverstatus': 'Battery Ok',
  },
  googleassistant: {
    'web:icon:on': 'icon-platform-voice-assistant',
    'web:icon:off': 'icon-platform-voice-assistant',
    'web:icon:catalog': 'icon-platform-voice-assistant',
  },
  halo: {
    'web:icon:on': 'icon-platform-co-1',
    'web:icon:off': 'icon-platform-co-2',
    'web:icon:catalog': 'icon-platform-co-2',
    'web:card:status': 'Ok',
    'web:panel:action': 'halo-toggle-light-play-stop',
    'web:card:action': 'halo-hover-action-status',
    'web:switch:auxLabel': 'Light',
    'web:devpow:batterycapable': true,
    'web:dev:customErrorComponent': 'halo',
    'web:dev:hasCustomErrorLink': true,
    'web:dev:supportLinkKey': 's_halo',
    'web:dev:scheduleConfig': 'lightsnswitches',
  },
  huebridge: {
    'web:icon:on': 'icon-platform-garage-bridge-2',
    'web:icon:off': 'icon-platform-garage-bridge-2',
    'web:icon:catalog': 'icon-platform-garage-bridge-2',
    'web:card:hoverstatus': 'Connected',
    'web:dev:hasDetails': true,
  },
  huefallback: {
    'web:icon:on': 'icon-platform-warning-2',
    'web:icon:off': 'icon-platform-warning-2',
    'web:icon:catalog': 'icon-platform-warning-2',
    'web:dev:supportLinkKey': 's_improperlypairedhue',
  },
  irrigation: {
    'web:icon:on': 'icon-platform-sprinkler-2',
    'web:icon:off': 'icon-platform-sprinkler-2',
    'web:icon:catalog': 'icon-platform-sprinkler-2',
    'web:icon:onAndOpen': 'icon-platform-sprinkler-1',
    'web:icon:onAndClosed': 'icon-platform-sprinkler-2',
    'web:card:hoveraction': 'irrigation-nowStopSkip',
    'web:card:statusComponent': 'irrigation',
    'web:dev:hasCustomErrorLink': true,
    'web:dev:scheduleConfig': 'irrigation',
    'web:panel:action': 'irrigation-nowStopSkip',
  },
  keyfob: {
    'web:icon:on': 'icon-platform-symbolpad-2',
    'web:icon:off': 'icon-platform-symbolpad-2',
    'web:icon:catalog': 'icon-platform-symbolpad-2',
    'web:card:status': `{{#if isAway}}Away{{else}}Home{{/if}}`,
    'web:card:hoverstatus': 'Battery Ok',
  },
  keypad: {
    'web:icon:on': 'icon-platform-keypad-2',
    'web:icon:off': 'icon-platform-keypad-2',
    'web:icon:catalog': 'icon-platform-keypad-2',
    'web:card:status': 'Ok',
    'web:card:hoverstatus': `{{#if ['temp:temperature']}}{{format-temp(['temp:temperature'], 'F')}}&deg;{{else}}Ok{{/if}}`,
  },
  light: {
    'web:icon:on': 'icon-platform-light-1',
    'web:icon:off': 'icon-platform-light-2',
    'web:icon:catalog': 'icon-platform-light-2',
    'web:panel:action': 'toggle-on-off',
    'web:card:action': 'toggle-on-off',
    'web:card:status': `{{#unless isOn}}Off{{else}}{{#if ['dim:brightness']}}{{['dim:brightness']}}% Brightness{{else}}On{{/if}}{{/unless}}`,
    'web:scene:groupString': 'Turn {{action}}',
    'web:dev:scheduleConfig': 'lightsnswitches',
  },
  lock: {
    'web:icon:on': 'icon-platform-lock-1',
    'web:icon:off': 'icon-platform-lock-2',
    'web:icon:catalog': 'icon-platform-lock-2',
    'web:icon:onAndOpen': 'icon-platform-unlock-2',
    'web:icon:onAndClosed': 'icon-platform-lock-2',
    'web:icon:offAndOpen': 'icon-platform-unlock-1',
    'web:icon:offAndClosed': 'icon-platform-lock-1',
    'web:panel:action': 'lock-unlock',
    'web:card:hoveraction': 'lock-unlock',
    'web:card:status': `{{['doorlock:lockDescription']}}`,
    'web:scene:groupString': 'Door {{action}}',
    'web:dev:customErrorComponent': 'lock',
    'web:dev:hasCustomErrorLink': true,
  },
  lutronbridge: {
    'web:icon:on': 'icon-platform-garage-bridge-2',
    'web:icon:off': 'icon-platform-garage-bridge-2',
    'web:icon:catalog': 'icon-platform-garage-bridge-2',
    'web:card:hoverstatus': 'Connected',
    'web:dev:customErrorComponent': 'lutron',
    'web:dev:hasCustomErrorLink': true,
    'web:dev:hasDetails': true,
  },
  motion: {
    'web:icon:on': 'icon-platform-pair-1',
    'web:icon:off': 'icon-platform-pair-2',
    'web:icon:catalog': 'icon-platform-pair-1',
    'web:card:status': `Motion {{format-time(['mot:motionchanged'])}}`,
    'web:card:hoverstatus': `{{#if ['temp:temperature']}}{{format-temp(['temp:temperature'], 'F')}}&deg;{{else}}Ok{{/if}}`,
    'web:panel:status': `Motion: {{format-date(['mot:motionchanged'])}} {{format-time(['mot:motionchanged'])}}`,
  },
  nestthermostat: {
    'web:icon:on': '',
    'web:icon:off': 'icon-app-cloud-2',
    'web:icon:catalog': 'icon-app-cloud-2',
    'web:icon:onText': `{{format-temp(['temp:temperature'], 'F')}}&deg;`,
    'web:isOnUnlessOffline': true,
    'web:card:hoveraction': 'changeTemperature',
    'web:card:status': `{{{['therm:setpointDescription']}}}`,
    'web:therm:autoDescription': 'Heat &#149; Cool',
    'web:dev:customErrorComponent': 'nestthermostat',
    'web:dev:hasDetails': true,
    'web:dev:supportLinkKey': 's_nest',
    'web:panel:action': 'thermostat-slider',
  },
  pendant: {
    'web:icon:on': 'icon-platform-care-2',
    'web:icon:off': 'icon-platform-care-2',
    'web:icon:catalog': 'icon-platform-care-2',
    'web:card:status': `{{#if isAway}}Away{{else}}Home{{/if}}`,
    'web:card:hoverstatus': 'Battery Ok',
  },
  petdoor: {
    'web:icon:on': 'icon-platform-petdoor-1',
    'web:icon:off': 'icon-platform-petdoor-1',
    'web:icon:catalog': 'icon-platform-petdoor-1',
    'web:dev:scheduleConfig': 'petdoor',
    'web:card:status': `{{{['petdoor:lockDescription']}}}`,
    'web:panel:action': 'lock-unlock-auto-petdoor',
    'web:card:hoveraction': 'lock-unlock-auto-petdoor',
  },
  rangeextender: {
    'web:icon:on': 'icon-platform-range-extender-2',
    'web:icon:off': 'icon-platform-range-extender-2',
    'web:icon:catalog': 'icon-platform-range-extender-2',
  },
  shade: {
    'web:icon:on': 'icon-platform-blinds-1',
    'web:icon:off': 'icon-platform-blinds-1',
    'web:icon:catalog': 'icon-platform-blinds-1',
    'web:scene:groupString': 'Shade {{action}}',
    'web:panel:action': 'changeShadeLevel',
    'web:card:hoveraction': 'changeShadeLevel',
    'web:card:status': 'Ok',
  },
  siren: {
    'web:icon:on': 'icon-platform-siren-2',
    'web:icon:off': 'icon-platform-siren-2',
    'web:icon:catalog': 'icon-platform-siren-2',
    'web:card:status': 'Ok',
    'web:card:hoverstatus': 'Battery Ok',
  },
  smokeco: {
    'web:icon:on': 'icon-platform-co-2',
    'web:icon:off': 'icon-platform-co-2',
    'web:icon:catalog': 'icon-platform-co-2',
    'web:card:status': 'Ok',
    'web:card:hoverstatus': `{{#if ['test:lastTestTime']}}Tested {{format-date(['test:lastTestTime'],'MMM YYYY')}}{{else}}Ok{{/if}}`,
  },
  somfyv1blind: {
    'web:card:hoveraction': 'changeBlindState',
    'web:icon:on': 'icon-platform-blinds-1',
    'web:icon:off': 'icon-platform-blinds-1',
    'web:icon:catalog': 'icon-platform-blinds-1',
    'web:scene:groupString': 'Blinds {{action}}',
    'web:panel:action': 'changeBlindState',
  },
  somfyv1bridge: {
    'web:card:hoverstatus': 'Connected',
    'web:icon:on': 'icon-platform-garage-bridge-2',
    'web:icon:off': 'icon-platform-garage-bridge-2',
    'web:icon:catalog': 'icon-platform-garage-bridge-2',
  },
  spaceheater: {
    'web:icon:on': '',
    'web:icon:off': 'icon-platform-flame-2',
    'web:icon:catalog': 'icon-platform-flame-2',
    'web:icon:onText': `{{format-temp(['temp:temperature'], 'F')}}&deg;`,
    'web:card:status': `{{{['spaceheater:setpointDescription']}}}`,
    'web:panel:action': 'changeSpaceHeaterTemperature',
    'web:card:hoveraction': 'changeSpaceHeaterTemperature',
    'web:scene:groupString': 'Turn {{action}}',
    'web:dev:scheduleConfig': 'spaceheater',
  },
  switch: {
    'web:icon:on': 'icon-platform-outlet-1',
    'web:icon:off': 'icon-platform-outlet-2',
    'web:icon:catalog': 'icon-platform-outlet-2',
    'web:panel:action': 'toggle-on-off',
    'web:card:action': 'toggle-on-off',
    'web:card:status': `{{#if isOn}}On{{else}}Off{{/if}}`,
    'web:scene:groupString': 'Turn {{action}}',
    'web:dev:hasCustomErrorLink': true,
    'web:dev:scheduleConfig': 'lightsnswitches',
  },
  tccthermostat: {
    'web:icon:on': '',
    'web:icon:off': 'icon-app-cloud-2',
    'web:icon:catalog': 'icon-app-cloud-2',
    'web:icon:onText': `{{format-temp(['temp:temperature'], 'F')}}&deg;`,
    'web:isOnUnlessOffline': true,
    'web:card:status': `{{{['therm:setpointDescription']}}}`,
    'web:panel:action': 'thermostat-slider',
    'web:card:hoveraction': 'changeTemperature',
    'web:dev:customErrorComponent': 'tccthermostat',
    'web:dev:hasDetails': true,
  },
  thermostat: {
    'web:icon:on': '',
    'web:icon:off': 'icon-app-thermometer',
    'web:icon:catalog': 'icon-app-thermometer',
    'web:icon:onText': `{{format-temp(['temp:temperature'], 'F')}}&deg;`,
    'web:isOnUnlessOffline': true,
    'web:card:status': `{{{['therm:setpointDescription']}}}`,
    'web:panel:action': 'thermostat-slider',
    'web:card:hoveraction': 'changeTemperature',
    'web:dev:scheduleConfig': 'thermostat',
  },
  tilt: {
    'web:icon:on': 'icon-platform-tilt-2',
    'web:icon:off': 'icon-platform-tilt-2',
    'web:icon:catalog': 'icon-platform-tilt-2',
    'web:isOnUnlessOffline': true,
    'web:card:status': `{{#if isOpen}}Open{{else}}Closed{{/if}}`,
  },
  vent: {
    'web:icon:off': 'icon-platform-vent-2',
    'web:icon:on': 'icon-platform-vent-2',
    'web:icon:catalog': 'icon-platform-vent-2',
    'web:panel:action': 'changeVentLevel',
    'web:card:status': `{{#if ['temp:temperature']}}{{format-temp(['temp:temperature'], 'F')}}&deg;{{else}}Ok{{/if}}`,
    'web:card:hoveraction': 'changeVentLevel',
    'web:dev:scheduleConfig': 'vent',
  },
  waterheater: {
    'web:icon:off': 'icon-platform-waterheater-2',
    'web:icon:on': 'icon-platform-water-1',
    'web:icon:catalog': 'icon-platform-waterheater-2',
    'web:icon:onText': `{{format-temp(['waterheater:setpoint'], 'F')}}&deg;`,
    'web:panel:action': 'changeWaterHeaterTemperature',
    'web:card:hoveraction': 'changeWaterHeaterTemperature',
    'web:card:status': `{{#if ['waterheater:heatingstate']}}<i class="icon-app-flame"/> {{/if}}{{['web:waterheater:hotwaterlevelDescription']}}`,
    'web:isOnUnlessOffline': true,
    'web:dev:hasCustomErrorLink': true,
    'web:dev:scheduleConfig': 'waterheater',
  },
  waterleak: {
    'web:icon:off': 'icon-platform-leak-2',
    'web:icon:on': 'icon-platform-leak-2',
    'web:icon:catalog': 'icon-platform-leak-2',
    'web:card:status': 'Ok',
    'web:card:hoverstatus': 'Battery Ok',
    'web:panel:status': `{{#eq ['leakh2o:state'] 'LEAK'}}Leak Detected{{else}}Safe Since{{/if}}: {{format-date(['leakh2o:statechanged'])}} {{format-time(['leakh2o:statechanged'])}}`,
    'web:dev:supportLinkKey': 's_leaksmartshutoffvalve',
  },
  watersoftener: {
    'web:icon:off': 'icon-platform-softener-2',
    'web:icon:on': 'icon-platform-softener-2',
    'web:icon:catalog': 'icon-platform-softener-2',
    'web:dev:customErrorComponent': 'watersoftener',
    'web:panel:statusComponent': 'watersoftener',
    'web:panel:action': 'recharge-now',
    'web:card:hoveraction': 'recharge-now',
  },
  watervalve: {
    'web:icon:on': 'icon-platform-water-valve-2',
    'web:icon:off': 'icon-platform-water-valve-2',
    'web:icon:catalog': 'icon-platform-water-valve-2',
    'web:icon:onAndOpen': 'icon-platform-water-valve-2',
    'web:icon:onAndClosed': 'icon-platform-water-valve-2',
    'web:icon:offAndOpen': 'icon-platform-water-valve-2',
    'web:icon:offAndClosed': 'icon-platform-water-valve-2',
    'web:panel:action': 'open-close-valve',
    'web:card:action': 'open-close-valve',
    'web:scene:groupString': '{{action}} water valve',
    'web:card:status': `{{#if isOpen}}Open{{else}}Closed{{/if}}`,
    'web:devpow:batterycapable': true,
    'web:dev:scheduleConfig': 'watervalve',
  },
};

export const defaultConfig = {
  // Icon that will display when the device is "on" (when isOn OR isOpen)
  'web:icon:on': 'icon-app-devices',

  // Icon that will display when the device is "off" (!isOn AND !isOpen) or offline (isOffline)
  'web:icon:off': 'icon-app-devices',

  // Icon that will display in the product catalog
  'web:icon:catalog': 'icon-app-devices',

  // Icon that will display when the device is "on" and "open" and we need to specifically specify
  // that scenario (as opposed to either open or on)
  'web:icon:onAndOpen': null,

  // Icon that will display when the device is "on" and "closed" and we need to specifically specify
  // that scenario (as opposed to either open or closed)
  'web:icon:onAndClosed': null,

  // Icon that will display when the device is "off" and "closed" and we need to specifically specify
  // that scenario (as opposed to either off or open)
  'web:icon:offAndOpen': null,

  // Icon that will display when the device is "off" and "closed" and we need to specifically specify
  // that scenario (as opposed to either off or closed)
  'web:icon:offAndClosed': null,

  // Template that will be rendered in the icon area when the device is "on" (when isOn or isOpen)
  'web:icon:onText': null,

  // Template that will be rendered below the device name.
  'web:panel:status': '',

  // Component to render in place of a panel status template string
  'web:panel:statusComponent': '',

  // Action (see components/device/actions) that will be displayed in the panel's action section (center section)
  'web:panel:action': null,

  // Action that will be displayed in the card's action section on hover (replacing device name and status)
  'web:card:action': null,

  // Action that will be display in the full card on hover (replacing device icon, name and status)
  'web:card:hoveraction': null,

  // Template that will be rendered below the device name
  'web:card:status': '',

  // Component that will be rendered below the device name on the dashboard
  // IMPORTANT: web:panel:status takes precendence, so only define one or the other
  'web:card:statusComponent': '',

  // Template that will be rendered and displayed on hover (replacing status)
  'web:card:hoverstatus': null,

  // Flag that sets whether this device is always "on" unless it is offline (isOffline)
  'web:isOnUnlessOffline': false,

  // For devices that have a binary group (ON/OFF), format to display that descriptor
  'web:scene:groupString': null,

  // For devices that have a switch, have an auxiliary label to display next to it.
  'web:switch:auxLabel': null,

  // For devices that have an Auto Mode, default the label value.
  'web:therm:autoDescription': 'Auto',

  // For devices that have battery or line capabilities
  'web:devpow:batterycapable': false,

  // Does this device have additional details displayed in the More Info detail panel?
  'web:dev:hasDetails': false,

  // Does this device have a custom errors component?
  'web:dev:customErrorComponent': null,

  // Does this device have a custom support link for errors?
  'web:dev:hasCustomErrorLink': false,

  // Is this device supported (i.e. fully configured)?
  'web:dev:supported': true,

  // Key used for Arcus support redirect URL
  'web:dev:supportLinkKey': 'support',

  // If the device is schedulable, what configuration to use
  'web:dev:scheduleConfig': null,
};
