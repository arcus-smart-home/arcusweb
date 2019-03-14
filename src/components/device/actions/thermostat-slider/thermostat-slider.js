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

import _ from 'lodash';
import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import 'can-stache-converters';
import view from './thermostat-slider.stache';
import Errors from 'i2web/plugins/errors';
import Device from 'i2web/models/device';
import ThermostatCapability from 'i2web/models/capability/Thermostat';
import temperatureConverter from 'i2web/plugins/temperature-converter';
import noUiSlider from 'nouislider';

const componentName = 'arcus-device-action-thermostat-slider';
const handleSelector = '.noUi-origin';
const handleIconSelector = '.noUi-handle';
const saveDebounceTime = 1000;
const longSaveDebounceTime = 2000; // used for thermostats with throttled or slow backends

/**
 * @module {CanComponent} i2web/components/device/actions/thermostat-slider/ Thermostat Slider Device Action
 * @parent i2web/components/device/actions
 * @description Change the set point temperatures of thermostat device via a slider
 * @signature `<arcus-device-action-thermostat-slider {device}="device" />`
 * @demo i2web/components/thermostat-slider/thermostat-slider.html
 */


// helper functions
function noOpListener() {}

// set active state of handle & value output and remove active state from other handles & value output
function activateHandle(handleIndex, componentEl, vm) {
  const values = Array.prototype.slice.call(componentEl.querySelectorAll('.btn-value'));
  const valueEl = values[handleIndex];
  const handles = Array.prototype.slice.call(componentEl.querySelectorAll(`${handleSelector} ${handleIconSelector}`));
  const handleEl = handles[handleIndex];

  handles.concat(values).forEach((el) => { el.classList.remove('active'); });

  // valueEl will be undefined in heat and cool modes
  if (valueEl !== undefined) { valueEl.classList.add('active'); }
  // handleEl will be undefined in eco mode
  if (handleEl !== undefined) { handleEl.classList.add('active'); }
  vm.attr('activeHandle', handleIndex);
}

// bind events of noUiSlider component
function connectSliderEvents(sliderEl, vm) {
  const slider = sliderEl.noUiSlider;
  const componentEl = sliderEl.parentElement;

  // change slider & value classes when moving handle
  slider.on('start', (v, handleIndex) => { activateHandle(handleIndex, componentEl, vm); });

  // update viewmodel values when moving handle
  slider.on('update', (v, handleIndex, values) => {
    const value = values[handleIndex];
    const mode = vm.attr('mode');
    let setPointName = null;

    if (mode === ThermostatCapability.HVACMODE_AUTO) {
      setPointName = handleIndex > 0 ? 'cool' : 'heat';
    } else if (mode === ThermostatCapability.HVACMODE_COOL) {
      setPointName = 'cool';
    } else if (mode === ThermostatCapability.HVACMODE_HEAT) {
      setPointName = 'heat';
    }

    const propName = `${setPointName}SetTemperature`;

    // noUiSlider will at times emit an 'update' for a handle even when it has not changed position. prevent this
    // from queuing a VM value change
    if (value !== vm.attr(propName)) {
      vm.attr(propName, value);
    }
  });
}

// set the position of the current temp indicator on the slider
function positionCurrentTempIndicator(el, vm) {
  const indicator = el.querySelector('.current-temp');
  if (indicator) {
    indicator.style.left = `${vm.attr('currentTemperaturePosition')}%`;
  } else {
    Errors.log(`IMPORTANT: thermostat-slider: this code path should never be run. 
      this is a sign that components or their events are not being cleaned up as expected. 
      reopen issue I2-940 as soon as this is observed.`);
  }
}

// set the position of the bar element connecting the current temp to the nearest handle
function positionCurrentTempConnection(el, vm) {
  const connect = el.querySelector('.current-temp-connect');
  const connectPosition = vm.attr('currentTemperatureConnectionPosition');

  if (connect) {
    connect.style.left = `${connectPosition.left || 0}%`;
    connect.style.right = `${connectPosition.right || 0}%`;
  }
}

// set the position of a lock point
function positionLockPoint(pointName, el, vm) {
  const point = el.querySelector(`.${pointName}.temp-lock`);
  point.style.left = `${vm.attr(`${pointName}LockTemperaturePosition`)}%`;
}

// give a % position of a value in a range from the left or optionally from the right
function getPosition(value, min, max, fromRight) {
  let limitedVal = value;

  // limit value to range when calculating positioning
  limitedVal = Math.min(limitedVal, max);
  limitedVal = Math.max(limitedVal, min);

  let decimal = ((limitedVal - min) / (max - min));
  if (fromRight) { decimal = 1 - decimal; }
  return decimal * 100;
}

// (re)create the slider during initial render & slider mode change
function initializeSlider(el, vm) {
  const slider = el.querySelector('.slider');

  noUiSlider.create(slider, {
    start: vm.attr('handleTemperatures'),
    padding: vm.attr('lockPointPadding'),
    step: 1,
    margin: vm.attr('setPointMargin'),
    behaviour: 'none',
    connect: true,
    range: {
      min: vm.attr('rangeStart'),
      max: vm.attr('rangeEnd'),
    },
  });

  // connect slider to VM via events
  connectSliderEvents(slider, vm);

  // initialize active handle
  activateHandle(0, el, vm);

  // position current temp indicator & connection
  positionCurrentTempIndicator(el, vm);
  positionCurrentTempConnection(el, vm);

  // position lock points
  if (vm.attr('locked')) {
    positionLockPoint('low', el, vm);
    positionLockPoint('high', el, vm);
  }
}

// update slider handles to newest positions
// need to update both handles at once as noUiSlider behaves badly when updating one at a time
// debounce to next tick so that VM is fully updated before running
const updateHandles = _.debounce((rootEl, vm) => {
  const slider = rootEl.querySelector('.slider').noUiSlider;
  const values = vm.attr('handleTemperatures');
  const sliderValues = _.castArray(slider.get()).map(str => parseInt(str, 10));

  // don't update when there are no handles. sliderValues will be an array with single NaN
  if (_.isEqual(sliderValues, [NaN])) { return; }

  // update if slider handles aren't already set to current values
  if (!_.isEqual(values, sliderValues)) {
    slider.set(values);
  }
}, 0);


export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {i2web/models/Device} device
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description the device model being manipulated by this component
     */
    device: {
      Type: Device,
    },
    /**
     * @property {Boolean} disableControls
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description if we are hiding the component temporarily
     */
    disableControls: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} shouldDisableControlsOnSave
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description if we should hide the component during a save
     */
    shouldDisableControlsOnSave: {
      type: 'boolean',
      get() {
        return this.attr('isHoneywellTCC');
      },
    },
    /**
     * @property {String} mode
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description thermostat mode identifier string extracted from device model
     */
    mode: {
      get() {
        return this.attr('device.therm:hvacmode');
      },
    },
    /**
     * @property {Boolean} locked
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description if lock points should be shown on the slider, extracted from device model
     */
    locked: {
      get() {
        return this.attr('device.nesttherm:locked');
      },
    },
    /**
     * @property {Boolean} singleHandleMode
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description if the slider is in a mode that should only show 1 handle
     */
    singleHandleMode: {
      get() {
        return this.attr('mode') === ThermostatCapability.HVACMODE_HEAT
          || this.attr('mode') === ThermostatCapability.HVACMODE_COOL;
      },
    },
    /**
     * @property {Integer} activeHandle
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description index of the slider handle currently selected by the user
     */
    activeHandle: {
      type: 'number',
    },
    /**
     * @property {Integer} setPointMargin
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description number of degrees that the heat and cool handles should be separated by
     */
    setPointMargin: {
      type: 'number',
      get() {
        return temperatureConverter(this.attr('device.therm:setpointseparation'), 'F', false);
      },
    },
    /**
     * @property {Integer} rangeStart
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description lowest temperature visible on the slider
     */
    rangeStart: {
      type: 'number',
      get() {
        return temperatureConverter(this.attr('device.therm:minsetpoint'));
      },
    },
    /**
     * @property {Integer} rangeEnd
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description highest temperature visible on the slider
     */
    rangeEnd: {
      type: 'number',
      get() {
        return temperatureConverter(this.attr('device.therm:maxsetpoint'));
      },
    },
    /**
     * @property {Integer} currentTemperature
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description current room temperature
     */
    currentTemperature: {
      type: 'number',
      get() {
        return temperatureConverter(this.attr('device.temp:temperature'));
      },
    },
    /**
     * @property {Integer} coolSetTemperature
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description temperature above which air conditioning will turn on
     */
    coolSetTemperature: {
      type: 'number',
      get() {
        return temperatureConverter(this.attr('device.therm:coolsetpoint'));
      },
      set(value) {
        this.attr('device.therm:coolsetpoint', temperatureConverter(value, 'C'));
      },
    },
    /**
     * @property {Integer} heatSetTemperature
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description temperature below which heating will turn on
     */
    heatSetTemperature: {
      type: 'number',
      get() {
        return temperatureConverter(this.attr('device.therm:heatsetpoint'));
      },
      set(value) {
        this.attr('device.therm:heatsetpoint', temperatureConverter(value, 'C'));
      },
    },
    /**
     * @property {Integer} lowLockTemperature
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description minimum temperature that a handle on the slider can be set to
     */
    lowLockTemperature: {
      type: 'number',
      get() {
        return this.attr('device.nesttherm:locked')
          ? temperatureConverter(this.attr('device.nesttherm:lockedtempmin'))
          : null;
      },
    },
    /**
     * @property {Integer} highLockTemperature
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description maximum temperature that a handle on the slider can be set to
     */
    highLockTemperature: {
      type: 'number',
      get() {
        return this.attr('device.nesttherm:locked')
          ? temperatureConverter(this.attr('device.nesttherm:lockedtempmax'))
          : null;
      },
    },
    /**
     * @property {Array<String>} handleTemperatures
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description array of current temperatures for handles
     */
    handleTemperatures: {
      get() {
        const mode = this.attr('mode');
        const points = [];

        if (mode !== ThermostatCapability.HVACMODE_ECO) {
          if (mode === ThermostatCapability.HVACMODE_HEAT
            || mode === ThermostatCapability.HVACMODE_AUTO) {
            points.push(this.attr('heatSetTemperature'));
          }
          if (mode === ThermostatCapability.HVACMODE_COOL
            || mode === ThermostatCapability.HVACMODE_AUTO) {
            points.push(this.attr('coolSetTemperature'));
          }
        }

        return points;
      },
    },
    /**
     * @property {Boolean} disableDecrementButton
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description indicates when to disable the decrement button
     */
    disableDecrementButton: {
      get() {
        const coolTemp = this.attr('coolSetTemperature');
        const heatTemp = this.attr('heatSetTemperature');
        const lowLock = this.attr('lowLockTemperature');
        const rangeStart = this.attr('rangeStart');
        const mode = this.attr('mode');
        const activeHandle = this.attr('activeHandle');
        let lowHandleTemp = null;
        let highHandleTemp = null;

        if (mode === ThermostatCapability.HVACMODE_COOL) {
          lowHandleTemp = coolTemp;
          highHandleTemp = coolTemp;
        } else {
          lowHandleTemp = heatTemp;
          highHandleTemp = coolTemp;
        }

        if (activeHandle === 0 || (highHandleTemp - lowHandleTemp) <= 3) {
          return (lowHandleTemp === lowLock) || (lowHandleTemp === rangeStart);
        }

        return false;
      },
    },
    /**
     * @property {Boolean} disableIncrementButton
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description indicates when to disable the increment button
     */
    disableIncrementButton: {
      get() {
        const coolTemp = this.attr('coolSetTemperature');
        const heatTemp = this.attr('heatSetTemperature');
        const highLock = this.attr('highLockTemperature');
        const rangeEnd = this.attr('rangeEnd');
        const mode = this.attr('mode');
        const activeHandle = this.attr('activeHandle');
        let lowHandleTemp = null;
        let highHandleTemp = null;

        if (mode === ThermostatCapability.HVACMODE_HEAT) {
          lowHandleTemp = heatTemp;
          highHandleTemp = heatTemp;
        } else if (mode === ThermostatCapability.HVACMODE_COOL) {
          lowHandleTemp = coolTemp;
          highHandleTemp = coolTemp;
        } else {
          lowHandleTemp = heatTemp;
          highHandleTemp = coolTemp;
        }

        if (activeHandle === 1 || (highHandleTemp - lowHandleTemp) <= 3) {
          return (highHandleTemp === highLock) || (highHandleTemp === rangeEnd);
        }

        return false;
      },
    },
    /**
     * @property {String} currentTemperatureTooltipText
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description text shown in the tooltip above the current temp indicator
     */
    currentTemperatureTooltipText: {
      get() {
        return `Current: ${this.attr('currentTemperature')}°`;
      },
    },
    /**
     * @property {Number} currentTemperaturePosition
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description % distance of current temp indicator from left edge of slider
     */
    currentTemperaturePosition: {
      get() {
        return getPosition(this.attr('currentTemperature'), this.attr('rangeStart'), this.attr('rangeEnd'));
      },
    },
    /**
     * @property {String} currentTemperatureConnectionClass
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description the css class that colors the bar element connecting the current temp indicator to the nearest handle
     */
    currentTemperatureConnectionClass: {
      get() {
        const currentTemp = this.attr('currentTemperature');
        const mode = this.attr('mode');
        let highHandleTemp = null;
        let lowHandleTemp = null;

        if (mode === ThermostatCapability.HVACMODE_AUTO) {
          highHandleTemp = this.attr('coolSetTemperature');
          lowHandleTemp = this.attr('heatSetTemperature');
        } else if (mode === ThermostatCapability.HVACMODE_COOL) {
          highHandleTemp = this.attr('coolSetTemperature');
          lowHandleTemp = this.attr('coolSetTemperature');
        } else if (mode === ThermostatCapability.HVACMODE_HEAT) {
          highHandleTemp = this.attr('heatSetTemperature');
          lowHandleTemp = this.attr('heatSetTemperature');
        }

        if (lowHandleTemp && (currentTemp < lowHandleTemp) && (mode !== ThermostatCapability.HVACMODE_COOL)) {
          return 'heat-gradient';
        }
        if (highHandleTemp && (currentTemp > highHandleTemp) && (mode !== ThermostatCapability.HVACMODE_HEAT)) {
          return 'cool-gradient';
        }

        return '';
      },
    },
    /**
     * @property {{left: Number, right: Number}} currentTemperatureConnectionPosition
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description left & right % endpoints of bar connecting current temperature indicator to nearest set point handle
     */
    currentTemperatureConnectionPosition: {
      get() {
        const currentTemp = this.attr('currentTemperature');
        const rangeStart = this.attr('rangeStart');
        const rangeEnd = this.attr('rangeEnd');
        const mode = this.attr('mode');
        let highHandleTemp = null;
        let lowHandleTemp = null;
        let left = null;
        let right = null;

        if (mode === ThermostatCapability.HVACMODE_AUTO) {
          highHandleTemp = this.attr('coolSetTemperature');
          lowHandleTemp = this.attr('heatSetTemperature');
        } else if (mode === ThermostatCapability.HVACMODE_COOL) {
          highHandleTemp = this.attr('coolSetTemperature');
          lowHandleTemp = highHandleTemp;
        } else if (mode === ThermostatCapability.HVACMODE_HEAT) {
          highHandleTemp = this.attr('heatSetTemperature');
          lowHandleTemp = highHandleTemp;
        }

        if (highHandleTemp && (currentTemp > highHandleTemp)) {
          left = getPosition(highHandleTemp, rangeStart, rangeEnd);
          right = getPosition(currentTemp, rangeStart, rangeEnd, true);
        } else if (lowHandleTemp && (currentTemp < lowHandleTemp)) {
          left = getPosition(currentTemp, rangeStart, rangeEnd);
          right = getPosition(lowHandleTemp, rangeStart, rangeEnd, true);
        }

        return { left, right };
      },
    },
    /**
     * @property {Number} highLockTemperaturePosition
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description % distance of high temperature lock indicator from left edge of slider
     */
    highLockTemperaturePosition: {
      get() {
        return getPosition(this.attr('highLockTemperature'), this.attr('rangeStart'), this.attr('rangeEnd'));
      },
    },
    /**
     * @property {Number} lowLockTemperaturePosition
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description % distance of low temperature lock indicator from left edge of slider
     */
    lowLockTemperaturePosition: {
      get() {
        return getPosition(this.attr('lowLockTemperature'), this.attr('rangeStart'), this.attr('rangeEnd'));
      },
    },
    /**
     * @property {Array<Integers>} lockPointPadding
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description array of 2 integers indicating the number of degrees between the bottom/top of the slider and
     * the closest selectable temperature. used to implement the lock points.
     */
    lockPointPadding: {
      get() {
        const lowLock = this.attr('lowLockTemperature');
        const highLock = this.attr('highLockTemperature');

        if (lowLock && highLock) {
          return [
            lowLock - this.attr('rangeStart'),
            this.attr('rangeEnd') - highLock,
          ];
        }

        return undefined;
      },
    },
    /**
     * @property {boolean} isNest
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description if the device is a Nest thermostat
     */
    isNest: {
      get() {
        return this.attr('device.web:dev:devtypehint') === 'nestthermostat';
      },
    },
    /**
     * @property {boolean} isHoneywellTCC
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description if the device is a isHoneywellTCC thermostat
     */
    isHoneywellTCC: {
      get() {
        return this.attr('device').hasCapability('honeywelltcc');
      },
    },
    /**
     * @property {function} saveDevice
     * @parent i2web/components/device/actions/thermostat-slider/
     * @description function that saves the device view model after an amount of time has elapsed since the last
     * call to this function. In Nest thermostats this time to wait is higher since the Nest only allows 5 updates to
     * a thermostat per-hour.
     */
    saveDevice: {
      get() {
        const useLongDebounce = this.attr('isNest') || this.attr('isHoneywellTCC');

        return _.debounce(() => {
          // we disable the control for some devices while waiting for the platform to respond
          if (this.attr('shouldDisableControlsOnSave')) {
            this.attr('disableControls', true);
          }

          this.attr('device').strictSave().catch((e) => {
            this.attr('disableControls', false);
            if (e !== 'no changes to save') { Errors.log(e, true); }
          });
        }, useLongDebounce ? longSaveDebounceTime : saveDebounceTime);
      },
    },
  },
  /**
   * @property {function(Element)} activateHandleFromTemp
   * @parent i2web/components/device/actions/thermostat-slider/
   * @description takes a temperature readout element and activates the corresponding slider handle
   */
  activateHandleFromTemp(el) {
    const handleIndex = el.classList.contains('high') ? 1 : 0;
    activateHandle(handleIndex, el.closest(componentName), this);
  },
  /**
   * @property {function(Element)} adjustTemperature
   * @parent i2web/components/device/actions/thermostat-slider/
   * @description takes a temperature increment element and accordingly increment the active handle's temperature
   */
  adjustTemperature(el) {
    const sliderEl = el.closest(componentName).querySelector('.slider');
    const handleIndex = this.attr('activeHandle');
    const otherHandleIndex = handleIndex === 0 ? 1 : 0;
    const adjustment = el.classList.contains('minus') ? -1 : 1;
    let currentValues = sliderEl.noUiSlider.get();

    // when single handle currentValues is returned as number string instead of array
    if (typeof currentValues === 'string') { currentValues = [currentValues]; }

    currentValues[handleIndex] = parseInt(currentValues[handleIndex], 10) + adjustment;

    // move both points if they're within setPointMargin distance of each other
    if ((currentValues.length > 1) && ((currentValues[1] - currentValues[0]) < this.attr('setPointMargin'))) {
      currentValues[otherHandleIndex] = parseInt(currentValues[otherHandleIndex], 10) + adjustment;
    }

    sliderEl.noUiSlider.set(currentValues);
  },
  ThermostatCapability,
});


export default Component.extend({
  tag: componentName,
  viewModel: ViewModel,
  view,
  events: {
    inserted(el) {
      if (this.viewModel.attr('mode') !== ThermostatCapability.HVACMODE_OFF) {
        initializeSlider(el, this.viewModel);
      }
    },
    reRenderSlider() {
      const sliderEl = this.element.querySelector('.slider');
      const cleanUp = sliderEl && sliderEl.noUiSlider !== undefined;
      const createNew = this.viewModel.attr('mode') !== ThermostatCapability.HVACMODE_OFF;

      // wait until after rendering is complete to clean up & reinitialize
      setTimeout(() => {
        // do clean up in timeout to prevent FOUC
        if (cleanUp) {
          sliderEl.noUiSlider.off();
          sliderEl.noUiSlider.destroy();
        }

        if (createNew) {
          initializeSlider(this.element, this.viewModel);
        }
      }, 0);
    },
    updateSliderRange() {
      const slider = this.element.querySelector('.slider').noUiSlider;
      const vm = this.viewModel;

      slider.updateOptions({
        range: {
          min: vm.attr('rangeStart'),
          max: vm.attr('rangeEnd'),
        },
      });
    },
    handleTemperatureChange() {
      updateHandles(this.element, this.viewModel);
      this.viewModel.attr('saveDevice')();
    },
    '{viewModel} rangeStart': 'updateSliderRange',
    '{viewModel} rangeEnd': 'updateSliderRange',
    '{viewModel} coolSetTemperature': 'handleTemperatureChange',
    '{viewModel} heatSetTemperature': 'handleTemperatureChange',
    '{viewModel} currentTemperaturePosition': function updateCurrTempPosition() {
      positionCurrentTempIndicator(this.element, this.viewModel);
    },
    '{viewModel} currentTemperatureConnectionPosition': function updateCurrTempConnection() {
      positionCurrentTempConnection(this.element, this.viewModel);
    },
    // if the locked state or mode changes rerender the noUiSlider
    // padding (used to implement locking) and other properties can only be defined during render of noUiSlider
    '{viewModel} highLockTemperature': 'reRenderSlider',
    '{viewModel} lowLockTemperature': 'reRenderSlider',
    '{viewModel} mode': 'reRenderSlider',
    // set up fallback timer & css class when controls are disabled, cleanup when controls are enabled
    '{viewModel} disableControls': function disableControlsChange(vm, ev, newValue) {
      if (newValue === true) {
        // only disable controls for a maximum of two minutes
        const disableControlsFallback = setTimeout(() => { this.viewModel.attr('disableControls', false); }, 120000);
        this.viewModel.attr('_disableControlsFallback', disableControlsFallback);
        // remove element margins when showing disabled state
        this.element.classList.add('controls-disabled');
      } else {
        // cleanup fallback timeout
        clearTimeout(this.viewModel.attr('_disableControlsFallback'));
        this.viewModel.removeAttr('_disableControlsFallback');
        // clean up classes
        this.element.classList.remove('controls-disabled');
      }
    },
    // unlock controls if the platform has accepted a setpoint update by responding with a 'base:ValueChange' for a setpoint
    '{viewModel.device} base:ValueChange': function updateMessageReceived(vm, ev, updateMessage) {
      if (this.viewModel.attr('disableControls') && ('therm:heatsetpoint' in updateMessage || 'therm:coolsetpoint' in updateMessage)) {
        this.viewModel.attr('disableControls', false);
      }
    },
    // this listener is needed to prevent the saveDevice function from being recalculated more often than it should.
    // computes are recalculated on every read unless they are bound to. this event creates a binding.
    // TODO: eventually remove this and base saveDevice on an event stream instead of an observable since it will only recalculate when the stream changes
    '{viewModel} saveDevice': noOpListener,
    // this is needed to prevent can-observation error due to reading handleTemperatures in updateHandle :(
    // try removing this & running tests after updating can-observation. this will cause a failure during the lock points test if it is not fixed.
    // if this failure persists at that point contact the OS team for assistance finding the root cause.
    '{viewModel} handleTemperatures': noOpListener,
  },
});
