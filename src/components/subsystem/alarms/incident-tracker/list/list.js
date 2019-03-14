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
import view from './list.stache';
import Incident from 'i2web/models/incident';
import IncidentCapability from 'i2web/models/capability/AlarmIncident';
import moment from 'moment';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Incident} incident
     * @parent i2web/components/subsystem/alarms/incident-tracker/list
     * @description The incident we are display events for
     */
    incident: {
      Type: Incident,
    },
    /**
     * @property {boolean} showIncidentTypeHeader
     * @parent i2web/components/subsystem/alarms/incident-tracker/list
     * @description Whether to show the incident type header above the event list
     */
    showIncidentTypeHeader: {
      type: 'htmlbool',
      value: false,
    },
  },
  IncidentCapability,
});

export default Component.extend({
  tag: 'arcus-subsubsystem-alarms-incident-tracker-list',
  viewModel: ViewModel,
  view,
  helpers: {
    /**
     * @function shouldRenderDate
     * @parent i2web/components/subsystem/alarms/incident-tracker/list
     * @param {Event} event
     *
     * @description
     * Determines whether or not to render the block if the date is different than
     * the previously rendered one
     *
     * @return {HTML} The scope block
     */
    shouldRenderDate(event, options) {
      event = event.isComputed && event(); // eslint-disable-line no-param-reassign

      if (!this._lastRenderedEvent) {
        this._lastRenderedEvent = event;
        return options.fn({ event });
      }

      const formerTimestamp = moment(this._lastRenderedEvent.attr('timestamp')).format('YYYY MM DD');
      const currentTimestamp = moment(event.attr('timestamp')).format('YYYY MM DD');

      if (formerTimestamp !== currentTimestamp) {
        this._lastRenderedEvent = event;
        return options.fn({ event });
      }

      return options.inverse();
    },
  },
});
