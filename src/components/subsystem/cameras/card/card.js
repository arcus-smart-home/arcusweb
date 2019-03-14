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
import canDev from 'can-util/js/dev/';
import 'can-map-define';
import view from './card.stache';
import AppState from 'i2web/plugins/get-app-state.js';
import Errors from 'i2web/plugins/errors.js';
import Subsystem from 'i2web/models/subsystem';
import VideoService from 'i2web/models/service/VideoService';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/cameras/card
     * @description The currently active place
     */
    place: {
      get() {
        const place = AppState().attr('place');
        if (place && !place.attr('isBasic')) {
          VideoService.GetQuota(place.attr('base:id')).then(({ total, used }) => {
            this.attr('usedStorage', used);
            this.attr('totalStorage', total);
          }).catch(e => Errors.log(e));
        }
        return place;
      },
    },
    /**
     * @property {String} serviceLevel
     * @parent i2web/components/subsystem/cameras/card
     * @description The display string of the places service level
     */
    serviceLevelText: {
      get() {
        if (this.attr('place.isPromon')) {
          return 'Pro Monitoring';
        }
        if (this.attr('place.isPremium')) {
          return 'Premium';
        }
        return 'Basic';
      },
    },
    /*
     * @property {boolean} recordingEnabled
     * @parent i2web/components/subsystem/cameras/card
     * @description Exported from the camera component to ensure it is bound and its getter
     * will get called
     */
    recordingEnabled: {
      type: 'boolean',
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/cameras/card
     * @description The associated subsystem, this should be a subsystem with the subcameras capability
     */
    subsystem: {
      Type: Subsystem,
      set(subsystem) {
        if (!subsystem.hasCapability('subcameras')) {
          canDev.warn(`Subsystem does not have subcameras capability - perhaps subsystem instantiated incorrectly?`);
        }
        return subsystem;
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-card-cameras',
  viewModel: ViewModel,
  view,
});
