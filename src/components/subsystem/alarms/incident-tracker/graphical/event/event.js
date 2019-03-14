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
import view from './event.stache';
import Incident from 'i2web/models/incident';
import IncidentCapability from 'i2web/models/capability/AlarmIncident';
import 'i2web/components/countdown/';

let timeout;
export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {CanMap} event
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical/event
     * @description The event we are rendering
     */
    event: {
      Type: canMap,
    },
    /**
     * @property {CanMap} incident
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical/event
     * @description The source incident
     */
    incident: {
      Type: Incident,
    },
    /**
     * @property {boolean} isActive
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical/event
     * @description Whether this slide is active or not
     */
    isActive: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isCurrent
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical/event
     * @description Whether this slide is active or not
     */
    isCurrent: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {string} icon
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical/event
     * @description Icon representing this event
     */
    icon: {
      get() {
        switch (this.attr('event.state')) {
          case 'PREALERT':
            return 'icon-alarm-state-prealert';
          case 'ALERT':
            return 'icon-alarm-state-alert';
          case 'CANCELLED':
            return 'icon-alarm-state-cancelled';
          case 'DISPATCHING':
            return 'icon-alarm-state-dispatching';
          case 'DISPATCHED':
            return 'icon-alarm-state-dispatched';
          case 'DISPATCH_REFUSED':
            return 'icon-alarm-state-dispatch-refused';
          case 'DISPATCH_FAILED':
            return 'icon-alarm-state-dispatch-failed';
          case 'DISPATCH_CANCELLED':
            return 'icon-alarm-state-dispatch-cancelled';
          default:
            return '';
        }
      },
    },
    /**
     * @property {boolean} showPrealertingCountdown
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical/event
     * @description Whether to show the prealerting countdown
     */
    showPrealertingCountdown: {
      get(currentVal, setVal) {
        // if we're in the right prealert mode...
        if (this.attr('isCurrent') &&
            this.attr('incident.incident:alertState') === IncidentCapability.ALERTSTATE_PREALERT &&
            this.attr('incident.incident:prealertEndtime')) {
          // calculate the diff
          const diff = (this.attr('incident.incident:prealertEndtime') - Date.now());
          // and the endTime is at least one second in the future
          if (diff >= 1000) {
            // remove the countdown after we under a second difference
            timeout = setTimeout(() => {
              setVal(false);
              timeout = undefined;
            }, diff - 999);
            return true;
          }
        }
        return false;
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-subsubsystem-alarms-incident-tracker-graphical-event',
  viewModel: ViewModel,
  view,
  events: {
    '{element} beforeremove': function beforeRemove() {
      if (timeout) clearTimeout(timeout);
    },
  },
});
