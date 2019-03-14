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
import 'can-map-define';
import view from './icon.stache';
import Device from 'i2web/models/device';
import IrrigationControllerCapability from 'i2web/models/capability/IrrigationController';
import LightCapability from 'i2web/models/capability/Light';
import WaterHeaterCapability from 'i2web/models/capability/WaterHeater';

/**
 * @function isHaloOnBattery
 * @param {Device} device
 * @return {Boolean}
 *
 * Determines whether the device has the Halo capability and is on
 * battery power.
 */
function isHaloOnBattery(device) {
  if (device.attr('dev:devtypehint') === 'Halo') {
    return device.attr('onBattery');
  }
  return false;
}

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/components/device/icon
     *
     * The device related to this icon.
     */
    device: {
      Type: Device,
    },
    /**
     * @property {String} iconClass
     * @parent i2web/components/device/icon
     *
     * Sets the icon used based on the device. Different icons for on and off states
     */
    iconClass: {
      get() {
        const isOn = this.attr('device.isOn');
        const isOpen = this.attr('device.isOpen');
        const isOnAndOpenClass = this.attr('device.web:icon:onAndOpen');
        const isOnAndClosedClass = this.attr('device.web:icon:onAndClosed');
        const isOffAndOpenClass = this.attr('device.web:icon:offAndOpen');
        const ifOffAndClosedClass = this.attr('device.web:icon:offAndClosed');

        if (isOn) {
          if (isOnAndOpenClass) {
            return isOpen ? isOnAndOpenClass : isOnAndClosedClass;
          }
          return this.attr('device.web:icon:on');
        }

        if (isOffAndOpenClass) {
          return isOpen ? isOffAndOpenClass : ifOffAndClosedClass;
        }
        return this.attr('device.web:icon:off');
      },
    },
    /**
     * @property {String} stateClass
     * @parent i2web/components/device/icon
     *
     * Sets and active class if current state of device is on
     */
    stateClass: {
      get() {
        const device = this.attr('device');
        const classes = [];

        // if the device is offline, no need to apply other classes
        if (device.attr('isOffline')) {
          classes.push('offline');
        } else {
          // error states - don't hide text when thermostats or waterheaters have errors
          if (device.attr('erroredState') && !(device.hasCapability('therm') || device.hasCapability('aosmithwaterheatercontroller'))) {
            classes.push('error');
          }

          // currently these warning modes do NOT trigger a error state on the icon itself, just on the card
          // if (device.attr('devpow:batteryLow')) classes.push('error');
          // if (device.attr('alert:state') === 'ALERTING') classes.push('error');

          if (device.attr('isOn') && device.hasCapability('swit')) classes.push('active');
          if (device.hasCapability('light')) classes.push('is-light');
          if (device.attr('dim:brightness') !== undefined) classes.push('has-brightness');
          if (this.attr('hasRadial')) classes.push('has-radial');
          if (device.attr('isAway')) classes.push('away');
          if (device.hasCapability('waterheater')) {
            const level = device.attr('waterheater:hotwaterlevel');
            if (level === WaterHeaterCapability.HOTWATERLEVEL_HIGH) {
              classes.push('waterheater-high');
            } else if (level === WaterHeaterCapability.HOTWATERLEVEL_MEDIUM) {
              classes.push('waterheater-med');
            } else if (level === WaterHeaterCapability.HOTWATERLEVEL_LOW) {
              classes.push('waterheater-low');
            }
          }
          if (device.hasCapability('irrcont')) {
            const watering = device.attr('irrcont:controllerState');
            if (watering === IrrigationControllerCapability.CONTROLLERSTATE_WATERING) {
              classes.push('active');
            }
          }
          if (isHaloOnBattery(this.attr('device'))) {
            classes.push('on-battery');
          }
        }
        return classes.join(' ');
      },
    },
    /**
     * @property {Boolean} hasRadial
     * @parent i2web/components/device/icon
     *
     * Whether the icon, for this particular device, has a radial indicator
     */
    hasRadial: {
      get() {
        const device = this.attr('device');
        if (device) {
          return this.attr('device').hasCapability('fan')
            || this.attr('device').hasCapability('vent')
            || this.attr('device').hasCapability('dim');
        }
        return false;
      },
    },
    /**
     * @property {String} rightStyles
     * @parent i2web/components/device/icon
     *
     * Sets the transition delay, transform and background color of the right side
     * radial
     */
    rightStyles: {
      get() {
        if (!this.attr('device.isOn') || isHaloOnBattery(this.attr('device'))) {
          return `background: none;
            transition: transform .5s linear ${this.attr('rightTransition')}, background-color 1s linear 0s;`;
        }
        if (this.attr('hasRadial')) {
          let styles = `transition: transform .5s linear ${this.attr('rightTransition')}, background-color .5s linear 0s;
            transform: rotateZ(${this.attr('rightDegrees')}deg);`;

          if (this.attr('device').hasCapability('color') && this.attr('device').hasCapability('light') && this.attr('device.light:colormode') === LightCapability.COLORMODE_COLOR) {
            styles += `background-color: #${this.attr('device.color:iconhex')};`;
          }
          return styles;
        }
        return 'background: none;';
      },
    },
    /**
     * @property {String} leftStyles
     * @parent i2web/components/device/icon
     *
     * Sets the transition delay, transform and background color of the left side
     * radial
     */
    leftStyles: {
      get() {
        if (!this.attr('device.isOn') || isHaloOnBattery(this.attr('device'))) {
          return `background: none;
            transition: transform .5s linear ${this.attr('leftTransition')}, background-color 1s linear 0s;`;
        }
        if (this.attr('hasRadial')) {
          let styles = `transition: transform .5s linear ${this.attr('leftTransition')}, background-color .5s linear 0s;
            transform: rotateZ(${this.attr('leftDegrees')}deg);`;

          if (this.attr('device').hasCapability('color') && this.attr('device').hasCapability('light') && this.attr('device.light:colormode') === LightCapability.COLORMODE_COLOR) {
            styles += `background-color: #${this.attr('device.color:iconhex')};`;
          }
          return styles;
        }
        return 'background: none;';
      },
    },
    /**
     * @property {String} iconStyles
     * @parent i2web/components/device/icon
     *
     * Sets the opacity and color of the icon
     */
    iconStyles: {
      get() {
        let brightness = 0;
        if (this.attr('device.isOn') && this.attr('device').hasCapability('dim')) {
          brightness = this.attr('device.dim:brightness');
        }
        let styles = `opacity: ${brightness / 100};`;

        if (this.attr('device').hasCapability('color') && this.attr('device').hasCapability('light') && this.attr('device.light:colormode') === LightCapability.COLORMODE_COLOR) {
          styles += `color: #${this.attr('device.color:iconhex')}; transition-delay: 0s;`;
        }

        return styles;
      },
    },
  },
  /**
  * @property {Number} leftDegrees
  * @parent i2web/components/device/icon
  *
  * How much to transform the left side radial range from -158 deg to 0 deg
  */
  leftDegrees: 0,
  /**
  * @property {String} leftTransition
  * @parent i2web/components/device/icon
  *
  * Transition time of left side of the radial, depending on if we are moving from left to right
  * or right to left will either be one transition unit or double.
  */
  leftTransition: '',
  /**
  * @property {Number} rightDegrees
  * @parent i2web/components/device/icon
  *
  * How much to transform the right side radial range from -180 deg to 0 deg
  */
  rightDegrees: 0,
  /**
  * @property {String} rightTransition
  * @parent i2web/components/device/icon
  *
  * Transition time of right side of the radial, depending on if we are moving from right to left
  * or left to right will either be one transition unit or double.
  */
  rightTransition: '',
  /**
   * @function changeRadialValue
   * @parent i2web/components/device/icon
   *
   * @param {String} newVal
   * @param {String} oldVal
   *
   * Takes the new brightness value and old brightness value
   * Calculates the left and right transition times and also the degrees to rotate
   * the left and right sides of the radial
   */
  changeRadialValue(newVal, oldVal) {
    const newRadial = newVal;
    if (newRadial !== undefined) {
      // Dimmer circle is 158 degrees 1/2 way, not 180 degrees.
      const leftDegrees = newRadial < 50 ? -158 + (newRadial * 3.16) : 0;
      const rightDegrees = newRadial <= 50 ? -180 : (-180 + ((newRadial - 50) * 3.16));
      const transitionTime = '0.5';
      let leftTransition = '';
      let rightTransition = '';
      if (newRadial > 50 && oldVal < 50) {
        rightTransition = `${transitionTime}s`;
      } else if (newRadial < 50 && oldVal > 50) {
        leftTransition = `${transitionTime}s`;
      }
      this.attr({ leftTransition, rightTransition, leftDegrees, rightDegrees });
    }
  },
});

export default Component.extend({
  tag: 'arcus-device-icon',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      if (this.viewModel.attr('device')) {
        const device = this.viewModel.attr('device');
        if (device.hasCapability('dim')) {
          this.viewModel.changeRadialValue(device.attr('isOn') ? +device.attr('dim:brightness') : 0, 0);
        }
        if (device.hasCapability('vent')) {
          this.viewModel.changeRadialValue(device.attr('vent:level'), 0);
        }
        if (device.hasCapability('fan')) {
          this.viewModel.changeRadialValue(Math.ceil((device.attr('fan:speed') / device.attr('fan:maxSpeed')) * 100), 0);
        }
      }
    },
    '{viewModel} device': function handleDevice(ctx, ev, newVal) {
      if (newVal.hasCapability('dim')) {
        this.viewModel.changeRadialValue(newVal.attr('isOn') ? +newVal.attr('dim:brightness') : 0, 0);
      }
      if (newVal.hasCapability('vent')) {
        this.viewModel.changeRadialValue(newVal.attr('vent:level'), 0);
      }
      if (newVal.hasCapability('fan')) {
        const device = this.viewModel.attr('device');
        this.viewModel.changeRadialValue(Math.ceil((device.attr('fan:speed') / device.attr('fan:maxSpeed')) * 100), 0);
      }
    },
    '{viewModel.device} isOn': function handleIsOn(ctx, ev, deviceIsOn) {
      const device = this.viewModel.attr('device');
      if (device && this.viewModel.attr('hasRadial')) {
        let value = null;
        if (device.hasCapability('dim')) {
          value = device.attr('dim:brightness');
        } else if (device.hasCapability('vent')) {
          value = device.attr('vent:level');
        } else if (device.hasCapability('fan')) {
          const fanSpeed = device.attr('fan:speed');
          value = Math.ceil((+fanSpeed / device.attr('fan:maxSpeed')) * 100);
        }
        if (value) {
          const newRadialValue = deviceIsOn ? value : 0;
          const oldRadialValue = deviceIsOn ? 0 : value;
          this.viewModel.changeRadialValue(+newRadialValue, +oldRadialValue);
        }
      }
    },
    '{viewModel.device} dim:brightness': function handleBrightness(ctx, ev, newVal, oldVal) {
      this.viewModel.changeRadialValue(+newVal, +oldVal);
    },
    '{viewModel.device} vent:level': function handleLevel(ctx, ev, newVal, oldVal) {
      this.viewModel.changeRadialValue(+newVal, +oldVal);
    },
    '{viewModel.device} fan:speed': function handleSpeed(ctx, ev, newVal, oldVal) {
      const device = this.viewModel.attr('device');
      const newSpeed = Math.ceil((+newVal / device.attr('fan:maxSpeed')) * 100);
      const oldSpeed = Math.ceil((+oldVal / device.attr('fan:maxSpeed')) * 100);
      this.viewModel.changeRadialValue(newSpeed, oldSpeed);
    },
    '{viewModel.device} color:hue': function handleColorHue() {
      this.viewModel.attr('rightTransition', '0s');
      this.viewModel.attr('leftTransition', '0s');
    },
    '{viewModel.device} color:saturation': function handleSaturation() {
      this.viewModel.attr('rightTransition', '0s');
      this.viewModel.attr('leftTransition', '0s');
    },
  },
});
