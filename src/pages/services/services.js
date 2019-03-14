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
import canRoute from 'can-route';
import 'can-map-define';
import view from './services.stache';
import Place from 'i2web/models/place';
import Subsystem from 'i2web/models/subsystem';
import AppState from 'i2web/plugins/get-app-state';

export const ViewModel = canMap.extend({
  define: {
    /**
    * @property {Subsystem} subsystem
    * @parent i2web/pages/services
    *
    * Subsystem
    */
    subsystem: {
      get() {
        const subsystems = AppState().attr('subsystems');
        return subsystems && subsystems.findBySlug(this.attr('serviceSlug'));
      },
    },
    /**
     * @property {Subsystem.List} subsystems
     * @parent i2web/pages/services
     *
     * all available subsystems
     */
    subsystems: {
      Type: Subsystem.List,
    },
    /**
    * @property {String} placeId
    * @parent i2web/pages/services
    *
    * current place ID
    */
    placeId: {
      type: 'string',
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/services
     *
     * Current Place
     */
    place: {
      Type: Place,
    },
    /**
    * @property {String} serviceSlug
    * @parent i2web/pages/services
    *
    * devices
    */
    serviceSlug: {
      type: 'string',
      get() {
        return canRoute.attr('subpage');
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-page-services',
  viewModel: ViewModel,
  view,
});
