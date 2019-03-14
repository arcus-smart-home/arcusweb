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
import CareSubsystem from 'i2web/models/capability/CareSubsystem';
import Subsystem from 'i2web/models/subsystem';
import Errors from 'i2web/plugins/errors';
import view from './active.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Array<Object>} behaviors
     * @parent i2web/components/subsystem/care/status/active
     * @description The configured behaviors on the care subsystem
     */
    behaviors: {
      get() {
        const subsystem = this.attr('subsystem');
        if (subsystem) {
          const total = subsystem.attr('subcare:behaviors.length');
          const active = subsystem.attr('subcare:activeBehaviors.length');
          const behaviors = _.fill(Array(total), 'ready', 0, active);
          _.fill(behaviors, 'inactive', active);
          return behaviors;
        }
        return [];
      },
    },
    /**
     * @property {Boolean} isOff
     * @parent i2web/components/subsystem/care/status/active
     * @description Whether or not the alarmMode is off (VISIT) or on (ON)
     */
    isOff: {
      get() {
        const subsystem = this.attr('subsystem');
        if (subsystem) {
          return subsystem.attr('subcare:alarmMode')
            === CareSubsystem.ALARMMODE_VISIT;
        }
        return false;
      },
    },
    /**
     * @property {Boolean} isOffText
     * @parent i2web/components/subsystem/care/status/active
     * @description If the subsystem is off, display 'Off' in the center.
     * Otherwise display the active/total behavior count.
     */
    isOffText: {
      get() {
        return (this.attr('isOff')) ? 'Off' : undefined;
      },
    },
    /**
     * @property {Boolean} offDisabled
     * @parent i2web/components/subsystem/care/status/active
     * @description The User should not turn off the care subsystem if it is already
     * off or has 0 behaviors
     */
    offDisabled: {
      get() {
        const noBehaviors =
          this.attr('subsystem.subcare:behaviors.length') === 0;
        return noBehaviors || this.attr('isOff');
      },
    },
    /**
     * @property {Boolean} onDisabled
     * @parent i2web/components/subsystem/care/status/active
     * @description The User should not turn on the care subsystem if it is already
     * on or has 0 behaviors
     */
    onDisabled: {
      get() {
        const noBehaviors =
          this.attr('subsystem.subcare:behaviors.length') === 0;
        return noBehaviors || !this.attr('isOff');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/status/active
     * @description The associated subsystem, this should be a subsystem with the subcare capability
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  CareSubsystem,
  /**
   * @function turnAlarmMode
   * @parent i2web/components/subsystem/care/status/active
   * @param {String} state
   * @description Set the alarm mode to ON or VISIT
   */
  turnAlarmMode(state) {
    this.attr('subsystem.subcare:alarmMode', state);
    this.attr('subsystem').save().catch(Errors.log);
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-care-status-active',
  viewModel: ViewModel,
  view,
});
