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

import CanList from 'can-list';
import CanMap from 'can-map';
import 'can-map-define';
import Component from 'can-component';
import Device from 'i2web/models/device';
import Error from 'i2web/plugins/errors';
import getAppState from 'i2web/plugins/get-app-state';
import view from './irrigation-mode.stache';
import { capitalize, toLower, toUpper } from 'lodash';

const Mode = CanMap.extend({
  define: {
    name: {
      type: 'string',
    },
    hasEvents: {
      get() {
        const m = toLower(this.attr('name'));
        const a = this.attr('device.base:address');
        return (
          this.attr(
            `subsystem.sublawnngarden:${m}Schedules.${a}.events.length`
          ) > 0
        );
      },
    },
  },
});

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {CanMap} appState
     * @parent i2web/components/device/configurators/irrigation-mode
     * @description The application view model
     */
    appState: {
      get(lastSetValue) {
        return lastSetValue || getAppState();
      },
    },
    /**
     * @property {Device} device
     * @parent i2web/components/device/configurators/irrigation-mode
     * @description device being configured
     */
    device: {
      Type: Device,
    },
    /**
     * @property {CanList<Mode>} irrigationModes
     * @parent i2web/components/device/configurators/irrigation-mode
     * @description List of available irrigation modes
     */
    irrigationModes: {
      get() {
        const device = this.attr('device');
        const subsystem = this.attr('subsystem');

        return new CanList([
          new Mode({ name: 'WEEKLY', device, subsystem }),
          new Mode({ name: 'INTERVAL', device, subsystem }),
          new Mode({ name: 'EVEN', device, subsystem }),
          new Mode({ name: 'ODD', device, subsystem }),
          new Mode({ name: 'MANUAL', device, subsystem }),
        ]);
      },
    },
    /**
     * @property {CanList<Mode>} selectableModes
     * @parent i2web/components/device/configurators/irrigation-mode
     * @description List of modes with scheduled events and 'manual' mode.
     */
    selectableModes: {
      get() {
        const modes = this.attr('irrigationModes');
        return modes.filter(
          m => m.attr('hasEvents') || this.isManualMode(m.attr('name')),
        );
      },
    },
    /**
     * @property {String} selectedScheduleMode
     * @parent i2web/components/device/configurators/irrigation-mode
     * @description The currently selected irrigation mode
     */
    selectedScheduleMode: {
      get(lastSetValue) {
        return lastSetValue || this.getCurrentlySetScheduleMode();
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/device/configurators/irrigation-mode
     * @description Lawn-garden subsystem model
     */
    subsystem: {
      get() {
        const subsystems = this.attr('appState.subsystems');
        return subsystems.findByName('sublawnngarden');
      },
    },
    /**
     * @property {CanList<Mode>} unselectableModes
     * @parent i2web/components/device/configurators/irrigation-mode
     * @description List of modes other than 'manual' with no scheduled events
     */
    unselectableModes: {
      get() {
        const modes = this.attr('irrigationModes');
        return modes.filter(
          m => !m.attr('hasEvents') && !this.isManualMode(m.attr('name')),
        );
      },
    },
  },
  /**
   * @function abortSelection
   * @param {Object} event
   * @description Event handler attached to unselectable modes
   */
  abortSelection(event) {
    event.preventDefault();
  },
  /**
   * @function isManualMode
   * @param {String} mode
   * @description Whether the string passed corresponds manual mode
   */
  isManualMode(mode) {
    return toLower(mode) === 'manual';
  },
  /**
   * @function getCurrentlySetScheduleMode
   * @description Gets the currently set schedule mode on attribute
   * initialization
   */
  getCurrentlySetScheduleMode() {
    const address = this.attr('device.base:address');

    // subsystem is the lawn and garden subsystem
    const status = `subsystem.sublawnngarden:scheduleStatus.${address}`;
    const enabled = this.attr(`${status}.enabled`);
    const mode = enabled ? this.attr(`${status}.mode`) : null;

    return mode ? toUpper(mode) : 'MANUAL';
  },
  /**
   * @function selectScheduleMode
   * @param {String} mode
   * @description Callback for the radio buttons change event
   */
  selectScheduleMode(mode) {
    const subsystem = this.attr('subsystem');
    const device = this.attr('device');
    const address = device.attr('base:address');

    // bail out if user is clicking the currently selected mode
    if (mode === this.attr('selectedScheduleMode')) {
      return;
    }

    if (this.isManualMode(mode)) {
      subsystem.DisableScheduling(address).catch(Error.log);
      return;
    }

    this.attr('selectedScheduleMode', mode);
    subsystem
      .SwitchScheduleMode(address, mode)
      .then(() => subsystem.EnableScheduling(address))
      .catch(Error.log);
  },
  /**
   * @function toTitleCase
   * @param {String} text
   * @description Converts the first character of string to upper case and the
   * remaining to lower case.
   */
  toTitleCase(text) {
    return capitalize(text);
  },
});

export default Component.extend({
  tag: 'arcus-device-configurator-irrigation-mode',
  viewModel: ViewModel,
  view,
});
