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
import Subsystem from 'i2web/models/subsystem';
import view from './mode.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {boolean} disableButtons
     * @parent i2web/components/schedule/mode
     * @description Whether or not to disable the buttons
     */
    disableButtons: {
      type: 'htmlbool',
    },
    /**
     * @property {Object} configuration
     * @parent i2web/components/schedule/mode
     * @description The scheduler configuration object specific to the type of 'thing'
     */
    configuration: {
      type: '*',
    },
    /**
     * @property {String} header
     * @parent i2web/components/schedule/mode
     * @description The text displayed above the segment mode selection
     */
    header: {
      get() {
        const modes = this.attr('configuration').modes;
        return (modes && modes.header)
          ? modes.header
          : 'Select a Mode for the Schedule';
      },
    },
    /**
     * @property {String} modeHelp
     * @parent i2web/components/schedule/mode
     * @description The help text for the specifically selected mode
     */
    modeHelp: {
      get() {
        const configuration = this.attr('configuration');
        const mode = this.attr('selectedMode');
        if (configuration.modes.help && mode) {
          return configuration.modes.help[mode];
        }
        return '';
      },
    },
    /**
     * @property {Model} thing
     * @parent i2web/components/schedule/mode
     * @description The "thing" (scene, rule, device) being scheduled
     */
    thing: {
      type: '*',
    },
    /**
     * @property {string} selectedMode
     * @parent i2web/components/schedule/mode
     * @description A mode we handle schedules for. This might be a device mode
     * such as on thermostats.
     */
    selectedMode: {
      type: 'string',
    },
    /**
     * @property {String} subheader
     * @parent i2web/components/schedule/mode
     * @description The text displayed below the segment mode selection
     */
    subheader: {
      get() {
        const modes = this.attr('configuration').modes;
        return (modes && modes.subheader) ? modes.subheader : '';
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/schedule/subsystem
     * @description The subsystem for the device as specified by the schedule
     * configuration
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function changeMode
   * @parent i2web/components/schedule/mode
   * Changes the selected mode
   */
  changeMode(mode, el, ev) {
    ev.preventDefault();
    this.attr('selectedMode', mode);
  },
  init() {
    if (!this.attr('selectedMode')) {
      const configuration = this.attr('configuration');
      if (configuration && configuration.modes) {
        const attribute = configuration.modes.attribute;
        const selected = (attribute && typeof attribute === 'function')
          ? attribute.bind(this)()
          : this.attr(attribute);
        this.attr('selectedMode', selected);
      }
    }
  },
});

export default Component.extend({
  tag: 'arcus-schedule-mode',
  viewModel: ViewModel,
  view,
});
