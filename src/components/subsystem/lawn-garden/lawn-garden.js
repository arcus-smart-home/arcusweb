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
import Device from 'i2web/models/device';
import getAppState from 'i2web/plugins/get-app-state';
import view from './lawn-garden.stache';
import route from 'can-route';
import errors from 'i2web/plugins/errors';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} defaultView
     * @parent i2web/components/subsystem/lawn-garden
     * @description The default subview of the lawn & garden subsystem view
     */
    defaultView: {
      value: 'status',
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/lawn-garden
     * @description Where the displayed lawn and garden information is configured
     */
    place: {
      get() {
        return getAppState().attr('place');
      },
    },
    /**
     * @property {string} validViews
     * @parent i2web/components/subsystem/lawn-garden
     * @description Valid subview identifiers of the lawn & garden subsystem view
     */
    validViews: {
      Type: Array,
      value: ['status', 'settings'],
    },
    /**
     * @property {string} view
     * @parent i2web/components/subsystem/lawn-garden
     * @description The active subview of the lawn & garden subsystem view
     */
    view: {
      get() {
        const action = route.attr('action');
        const validActions = this.attr('validViews');

        if (validActions.includes(action)) {
          return action;
        }

        errors.log('arcus-subsystem-lawn-garden: invalid view selected. showing default view.');
        return this.attr('defaultView');
      },
    },
    /**
     * @property {List} devices
     * @parent i2web/components/subsystem/lawn-garden
     * @description Device models associated with the lawn & garden subsystem of this place
     */
    devices: {
      get() {
        const subsystem = this.attr('subsystem');
        if (subsystem) {
          return subsystem.attr('web:sublawnngarden:controllers');
        }
        return new Device.List([]);
      },
    },
  },
  setView(viewId) {
    route.attr('action', viewId);
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-lawn-garden',
  viewModel: ViewModel,
  view,
  events: {
    // set default view if no view or invalid view is selected at rendering
    inserted() {
      const action = route.attr('action');
      const validActions = this.viewModel.attr('validViews');

      if (!validActions.includes(action)) {
        this.viewModel.setView(this.viewModel.attr('defaultView'));
      }
    },
  },
});
