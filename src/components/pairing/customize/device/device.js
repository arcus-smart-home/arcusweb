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

import $ from 'jquery';
import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import canMap from 'can-map';
import canList from 'can-list';
import 'can-map-define';
import _find from 'lodash/find';
import PairingCustomizationStepLayout from 'config/device-pairing-customization-layouts.json';
import Device from 'i2web/models/device';
import PairingDevice from 'i2web/models/pairing-device';
import AppState from 'i2web/plugins/get-app-state';
import Errors from 'i2web/plugins/errors';
import view from './device.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} title
     * @parent i2web/components/pairing/customize/device
     * @description The title for the customization step, set by individual customization components
     */
    title: {
      type: 'string',
    },
    /**
     * @property {Number} currentStepIndex
     * @parent i2web/components/pairing/customize/device
     * @description current index of the step of the config
     */
    currentStepIndex: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {Object} currentStep
     * @parent i2web/components/pairing/customize/device
     * @description current step of the config
     */
    currentStep: {
      get() {
        const steps = this.attr('customizationSteps');
        if (steps) {
          return steps[this.attr('currentStepIndex')];
        }
        return false;
      },
    },
    /**
     * @property {Object} device
     * @parent i2web/components/pairing/customize/device
     * @description The Hub or Device that is going to be customized
     */
    device: {
      get(__, setAttr) {
        if (this.attr('isHub')) {
          setAttr(AppState().attr('hub'));
        } else {
          const address = this.attr('pairingDevice.pairdev:deviceAddress');
          Device.get({ 'base:address': address }).then(setAttr).catch(Errors.log);
        }
      },
    },
    /**
     * @property {PairingDevice} pairingDevice
     * @parent i2web/components/pairing/customize/device
     * @description The PairingDevice instance
     */
    pairingDevice: {
      Type: PairingDevice,
    },
    /**
     * @property {Boolean} isFinishedCustomization
     * @parent i2web/components/pairing/customize/device
     * @description A boolean that tracks if the customization steps have been completed
     */
    isFinishedCustomization: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} isNextDisabled
     * @parent i2web/components/pairing/customize/device
     * @description A boolean that can be used to disable the Next button until some criteria is met
     */
    isNextDisabled: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Object} customizationSteps
     * @parent i2web/components/pairing/customize/device
     * @description customization steps configuration
     */
    customizationSteps: {
      Type: canList,
      set(val) {
        const supportedSteps = [
          'NAME', 'FAVORITE', 'RULES', 'SCHEDULE', 'CONTACT_TEST', 'CONTACT_TYPE',
          'PRESENCE_ASSIGNMENT', 'MULTI_BUTTON_ASSIGNMENT', 'SECURITY_MODE', 'PROMON_ALARM',
          'STATE_COUNTY_SELECT', 'WEATHER_RADIO_STATION', 'INFO', 'OTA_UPGRADE', 'ROOM', 'WATER_HEATER',
          'IRRIGATION_ZONE', 'MULTI_IRRIGATION_ZONE',
        ];
        return val.filter((step) => {
          if (step.action === 'RULES') { return step.choices && step.choices.length > 0; }
          return supportedSteps.includes(step.action);
        });
      },
    },
    /**
     * @property {Object} stepLayout
     * @parent i2web/components/pairing/customize/device
     * @description an object that represents the layout based on current step
     */
    stepLayout: {
      get() {
        const currentStep = this.attr('currentStep');
        if (currentStep && this.attr('customizationSteps.length') > 0) {
          return _find(PairingCustomizationStepLayout, (layout) => {
            return layout.steps.indexOf(currentStep.action) !== -1;
          });
        }
        return undefined;
      },
    },
  },
  /**
   * @function getStepByAction
   * @parent i2web/components/pairing/customize/device
   * @description get the current step based on the step action
   */
  getStepByAction(action, layoutSteps) {
    const customizationSteps = this.attr('customizationSteps');
    if (layoutSteps.length > 1) {
      const actionStep = _find(customizationSteps, (step) => {
        return step.action === action;
      });
      return actionStep ? [actionStep] : [];
    }
    return [customizationSteps.attr(this.attr('currentStepIndex'))];
  },
  /**
   * @function next
   * @parent i2web/components/pairing/customize/device
   * @description increment step or set finished flag
   */
  next() {
    const currentStepIndex = this.attr('currentStepIndex');
    const currentStepLayout = this.attr('stepLayout');

    let incrementBy = 1;
    if (!this.attr('isHub')) {
      incrementBy = this.attr('customizationSteps').filter((step) => {
        return currentStepLayout.steps.indexOf(step.action) !== -1;
      }).length;
    }
    incrementBy = Math.min(incrementBy, currentStepLayout.steps.length);

    const nextStep = currentStepIndex + incrementBy;

    if (nextStep < this.attr('customizationSteps').length) {
      this.attr('currentStepIndex', nextStep);
    } else {
      this.attr('isFinishedCustomization', true);
    }
  },
  /**
   * @function customizationCompleted
   * @parent i2web/components/pairing/customize/device
   * @description Call AddCustomization once step customization is completed
   */
  customizationCompleted(stepName) {
    if (!this.attr('isHub')) {
      const normalizedStep = stepName.replace(/(_|-)+/g, '').toLowerCase();
      Analytics.tag(`device.pairing.customize.${normalizedStep}`);
      this.attr('pairingDevice').AddCustomization(stepName);
    }
  },
  /**
   * @function disableNextButton
   * @parent i2web/components/pairing/customize/device
   * @description Allows customization steps to control the state of the next button until some criteria is met
   */
  disableNextButton(value) {
    this.attr('isNextDisabled', value);
  },
  /**
   * @function skipStep
   * @parent i2web/components/pairing/customize/device
   * @param {String} stepAction to be skipped
   * @description Allows one customization step to control the skipping of another step, e.g. Weather Radio setup
   */
  skipStep(stepAction) {
    const filteredSteps = this.attr('customizationSteps').filter((step) => {
      return step.action !== stepAction;
    });
    this.attr('customizationSteps', filteredSteps);
    this.next();
  },
});

export default Component.extend({
  tag: 'arcus-pairing-customize-device',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      setTimeout(() => $('html, body').scrollTop(0), 0);
    },
    '{viewModel} currentStepIndex': function onStepChange() {
      $('html, body').scrollTop(0);
    },
    '{document.body} keyup': function enterKeyHandler(el, ev) {
      if (ev.keyCode === 13 || ev.key === 'Enter') { // if enter key
        this.viewModel.next();
      }
    },
  },
});
