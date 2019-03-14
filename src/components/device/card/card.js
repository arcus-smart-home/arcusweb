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

import Component from 'can-component';
import canMap from 'can-map';
import canRoute from 'can-route';
import 'can-map-define';
import { deviceSupportLinkKey } from 'i2web/helpers/device';
import view from './card.stache';
import Device from 'i2web/models/device';
import Subsystem from 'i2web/models/subsystem';
import isTouchScreen from 'i2web/plugins/is-touchscreen';
import ThermostatCapability from 'i2web/models/capability/Thermostat';
import SpaceHeaterCapability from 'i2web/models/capability/SpaceHeater';
import TwinStarCapability from 'i2web/models/capability/TwinStar';

import './status/';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/components/device/card
     *
     * The device being displayed on the card
     */
    device: {
      Type: Device,
    },
    /**
     * @property {Subsysem} sourceSubsystem
     * @parent i2web/components/device/card
     *
     * The subsystem that we are displaying this card within
     */
    sourceSubsystem: {
      Type: Subsystem,
    },
    /**
     * @property {String} badgeClass
     * @parent i2web/components/device/card
     *
     * What is the status of the device? Online or offline?
     */
    badgeClass: {
      get() {
        const device = this.attr('device');
        const classes = [];

        if (this.attr('hasAction')) classes.push('hasAction');
        if (this.attr('hasHoverAction')) classes.push('hasHoverAction');
        if (this.attr('hasHoverStatus')) classes.push('hasHoverStatus');
        if (device.attr('erroredState') || device.attr('alertedState')) {
          classes.push('error');
        } else if (device.attr('warnings')) {
          classes.push('warning');
        } else if (device.attr('devpow:batteryLow')) {
          classes.push('error');
        }
        return classes.join(' ');
      },
    },
    /**
     * @property {Boolean} hasAction
     * @parent i2web/components/device/card
     *
     * Indicates whether an action should be added to the card. Basic requirement is
     * that it cannot be a touch screen or updating its firmware, and it must
     * have a defined card action.
     */
    hasAction: {
      get() {
        return !isTouchScreen()
          && !this.attr('device').attr('isFirmwareUpdateInProgress')
          && this.attr('device').attr('web:card:action');
      },
    },
    /**
     * @property {Boolean} hasHoverAction
     * @parent i2web/components/device/card
     *
     * Indicates whether a hover action should be added to the card. Basic requirement is
     * that it cannot be a touch screen or updating its firmware, and it must
     * either have true errors or a hover action that is valid for the device's
     * current state, e.g. temperature controls cannot be adjusted when a device
     * is turned off.
     */
    hasHoverAction: {
      get() {
        return !isTouchScreen()
          && !this.attr('device').attr('isFirmwareUpdateInProgress')
          && (this.attr('device').attr('erroredState')
          || (this.attr('device').attr('web:card:hoveraction')
          && !(this.attr('device.therm:hvacmode') === ThermostatCapability.HVACMODE_OFF
          || this.attr('device.therm:hvacmode') === ThermostatCapability.HVACMODE_ECO
          || this.attr('device.twinstar:ecomode') === TwinStarCapability.ECOMODE_ENABLED
          || this.attr('device.spaceheater:heatstate') === SpaceHeaterCapability.HEATSTATE_OFF)));
      },
    },
    /**
     * @property {Boolean} hasHoverErrors
     * @parent i2web/components/device/card
     *
     * Indicates whether a hover action should be added to the card for an error state.
     * Basic requirement is that it cannot be a touch screen or be updating its firmware,
     * and it must have true errors.
     */
    hasHoverErrors: {
      get() {
        return !isTouchScreen()
          && !this.attr('device').attr('isFirmwareUpdateInProgress')
          && this.attr('device').attr('erroredState');
      },
    },
    /**
     * @property {Boolean} hasHoverStatus
     * @parent i2web/components/device/card
     *
     * Indicates whether a hover status should be added to the card. Basic requirement is
     * that it cannot be a touch screen or be updating its firmware, and it must
     * have a defined hoverstatus.
     */
    hasHoverStatus: {
      get() {
        return !isTouchScreen()
          && !this.attr('device').attr('isFirmwareUpdateInProgress')
          && this.attr('device').attr('web:card:hoverstatus');
      },
    },
    /**
     * @property {string} supportLinkKey
     * @parent i2web/components/device/card
     *
     * Returns an appropriate support link key based on the device's current status.
     */
    supportLinkKey: {
      get() {
        const device = this.attr('device');
        return deviceSupportLinkKey(device);
      },
    },
  },
  /**
   * @function redirectToDevicePage
   * @parent i2web/components/device/card
   *
   * Redirect to device page
   */
  redirectToDevicePage() {
    const deviceId = this.attr('device.base:id');

    // if we came from within a subsystem, redirect to this device's entry in the subsystem
    if (this.attr('sourceSubsystem')) {
      canRoute.attr({
        page: 'services',
        subpage: this.attr('sourceSubsystem').attr('slug'),
        anchor: deviceId,
      });
    } else {
      canRoute.attr({
        page: 'devices',
        anchor: deviceId,
      });
    }
  },
});

export default Component.extend({
  tag: 'arcus-device-card',
  viewModel: ViewModel,
  view,
});
