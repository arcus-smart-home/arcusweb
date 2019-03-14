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

import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import Errors from 'i2web/plugins/errors';
import view from './remove-panel.stache';
import SidePanel from 'i2web/plugins/side-panel';
import Notifications from 'i2web/plugins/notifications';
import getAppState from 'i2web/plugins/get-app-state';

const STAGES = {
  REMOVING: 1,
  TIMED_OUT: 99,
  ERROR: 100,
};

const REMOVAL = {
  AUTOMATIC: 'HUB_AUTOMATIC',
  MANUAL: 'HUB_MANUAL',
  CLOUD: 'CLOUD',
};

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {CanMap} device
     * @parent i2web/components/device/remove-panel
     * @description the device being removed
     */
    device: { Type: CanMap },
    /**
     * @property {number} removeTimeOutLength
     * @parent i2web/components/device/remove-panel
     * @description milliseconds to wait for the RemoveResponse to arrive
     */
    removeTimeOutLength: {
      type: 'number',
      value: 4 * 60 * 1000,
    },
    /**
     * @property {boolean} removeTimedOut
     * @parent i2web/components/device/remove-panel
     * @description if the wait for RemoveResponse ended up finishing
     */
    removeTimedOut: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {CanMap} removeResponse
     * @parent i2web/components/device/remove-panel
     * @description the payload of the RemoveResponse message that arrived in response to the initial Remove call
     */
    removeResponse: { Type: CanMap },
    /**
     * @property {CanMap} removeError
     * @parent i2web/components/device/remove-panel
     * @description the error produced during the initial Remove call
     */
    removeError: { value: null },
    /**
     * @property {CanList} removeSteps
     * @parent i2web/components/device/remove-panel
     * @description the steps of the removal process described in the RemoveResponse payload
     */
    removeSteps: {
      get() {
        return this.attr('removeResponse.steps');
      },
    },
    /**
     * @property {string} removalMode
     * @parent i2web/components/device/remove-panel
     * @description The method of removal required for this device. Attempt to guess via device protocol,
     * updating when we receive the removeResponse which tells us conclusively.
     */
    removalMode: {
      get() {
        const device = this.attr('device');
        const removeResponse = this.attr('removeResponse');

        if (removeResponse) {
          return this.attr('removeResponse.mode');
        }

        // if we don't have the remove response yet, guess until we do
        if (device.attr('isZigBee')) {
          return REMOVAL.AUTOMATIC;
        }
        if (device.attr('isZWave')) {
          return REMOVAL.MANUAL;
        }

        return REMOVAL.CLOUD;
      },
    },
    /**
     * @property {Boolean} showStepCount
     * @parent i2web/components/device/remove-panel
     * @description Only should the remove step number if the number of steps
     * is greater than 1.
     */
    showStepCount: {
      get() {
        return this.attr('removeSteps.length') > 1;
      },
    },
    /**
     * @property {boolean} isCancelling
     * @parent i2web/components/device/remove-panel
     * @description if a request to cancel the removal of this device is ongoing.
     */
    isCancelling: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {array} tip
     * @parent i2web/components/device/remove-panel
     * @description A tip string for the current removal step.
     */
    tip: {
      get() {
        const tip = this.attr('removeSteps.0.title');

        if (tip) {
          tip.replace(/^TIP:/, ''); // replace prefix if found
        }

        return tip;
      },
    },
    /**
     * @property {string} stage
     * @parent i2web/components/device/remove-panel
     * @description a keyword indicating a subview presented by this component
     */
    stage: {
      get() {
        if (this.attr('removeTimedOut')) {
          return STAGES.TIMED_OUT;
        }
        if (this.attr('removeError')) {
          return STAGES.ERROR;
        }

        return STAGES.REMOVING;
      },
    },
  },
  // create notification and close self
  success() {
    Notifications.success('Device has been removed.');
    SidePanel.close();
    this.cancelTimeout();
  },
  // cancels the ongoing removal process. if removal mode is hub manual we'll
  // make a request to cancel the ongoing unpairing.
  async cancel() {
    if (this.attr('removalMode') === REMOVAL.MANUAL) {
      const hub = getAppState().attr('hub');

      this.attr('isCancelling', true);

      try {
        await hub.UnpairingRequest('STOP_UNPAIRING');
        SidePanel.close();
      } catch (e) {
        Errors.log(e);
      } finally {
        this.attr('isCancelling', false);
      }
    } else {
      SidePanel.close();
    }
  },
  // call force remove, this will result in a base:Deleted that calls success()
  forceRemove() {
    Analytics.tag('device.more.forceremove');
    this.attr('device').ForceRemove();
  },
  // start timer that will transition the stage if the removal process takes too long
  startTimeout() {
    // halt any old timeout
    const timeout = this.attr('timeout');
    if (timeout) { clearTimeout(timeout); }

    // start timeout for removal to complete
    this.attr('timeout', setTimeout(() => {
      this.attr('removeTimedOut', true);
    }, this.removeTimeOutLength));
  },
  // cancel timeout that would've transitioned the stage if we were waiting too long
  cancelTimeout() {
    clearTimeout(this.attr('timeout'));
    this.removeAttr('timeout');
  },
  STAGES,
  REMOVAL,
});

export default Component.extend({
  tag: 'arcus-device-remove-panel',
  viewModel: ViewModel,
  view,
  events: {
    // call remove and add response/error to view model. also begin timeout waiting for removal to complete
    async inserted() {
      const vm = this.viewModel;

      vm.startTimeout();

      try {
        Analytics.tag('device.more.remove');
        const response = await vm.attr('device').Remove();
        vm.attr('removeResponse', response);
      } catch (e) {
        vm.attr('removeError', e);
        Errors.log(e);
      }
    },
    '{viewModel.device} base:Deleted': function deletionHandler() {
      // delay so we don't flash through views too quickly when unpairing a fast
      // device. Could eliminate this delay if we don't mind that, or we could implement
      // it in a smarter way (i.e only delay up to a maximum of say 3 seconds after component insertion)
      setTimeout(() => this.viewModel.success(), 2000);
    },
    '{viewModel} stage': function stageChangeHandler(vm, ev, newVal, oldVal) {
      // if we ever leave the removing stage, an exception of some sort has occurred, cancel the timeout
      if (oldVal === STAGES.REMOVING) {
        this.viewModel.cancelTimeout();
      }
    },
  },
});
