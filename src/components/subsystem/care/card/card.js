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
import CanList from 'can-list';
import CanMap from 'can-map';
import 'can-map-define';
import view from './card.stache';
import CareSubsystem from 'i2web/models/capability/CareSubsystem';
import Subsystem from 'i2web/models/subsystem';
import Errors from 'i2web/plugins/errors';
import getAppState from 'i2web/plugins/get-app-state.js';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Array<Object>} behaviors
     * @parent i2web/components/subsystem/care/card
     * @description The configured behaviors on the care subsystem
     */
    behaviors: {
      get(__, setAttr) {
        this.attr('subsystem').ListBehaviors().then(({ behaviors }) => {
          setAttr(new CanList(behaviors));
        }).catch(Errors.log);
      },
    },
    /**
     * @property {Boolean} careAlert
     * @parent i2web/components/subsystem/care/card
     * @description The care subsystem is alerting
     */
    careAlert: {
      type: 'boolean',
      get() {
        return getAppState().attr('careAlarmState')
          === CareSubsystem.ALARMSTATE_ALERT;
      },
    },
    /**
     * @property {String} careAlertName
     * @parent i2web/components/subsystem/care/card
     * @description The name of the alerting behavior
     */
    careAlertName: {
      get() {
        const behavior = _.find(this.attr('behaviors'), (b) => {
          return b.attr('id') === this.attr('subsystem.subcare:lastAlertCause');
        });
        return (behavior) ? behavior.attr('name') : null;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/care/card
     * @description The currently active place
     */
    place: {
      get() {
        return getAppState().attr('place');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/card
     * @description The associated subsystem, this should be a subsystem with the subcare capability
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function clearCareAlert
   * @parent i2web/components/subsystem/care/card
   * @description Clear the currently active care alarm
   */
  clearCareAlert() {
    this.attr('subsystem').Clear().catch(Errors.log);
  },
  /**
   * @function retrieveCareActivity
   * @parent i2web/components/subsystem/care/card
   * @description retrieves the history events for the place
   */
  retrieveCareActivity() {
    return this.attr('subsystem').ListHistoryEntries(3);
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-card-care',
  viewModel: ViewModel,
  view,
});
