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
import canList from 'can-list';
import canMap from 'can-map';
import 'can-map-define';
import Device from 'i2web/models/device';
import Errors from 'i2web/plugins/errors';
import getAppState from 'i2web/plugins/get-app-state';
import view from './noaa-location.stache';
import NwsSameCodeService from 'i2web/models/service/NwsSameCodeService';
import 'i2web/helpers/form-fields';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device} device
     * @parent i2web/components/device/configurators/noaa-location
     * @description device being configured
     */
    device: {
      Type: Device,
    },
    /**
     * @property {htmlboolean} forPairingCustomization
     * @parent i2web/components/device/configurators/noaa-location
     * @description Attribute that indicates if the component is being used during pairing customization
     * which impacts whether or certain headers will be shown
     */
    forPairingCustomization: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {Function} onLocationChanged
     * @parent i2web/components/device/configurators/noaa-location
     * @description If defined by the parent component, this method is invoked when the location is changed
     */
    onLocationChanged: {
      Type: Function,
    },
    /**
     * @property {canList} states
     * @parent i2web/components/device/configurators/noaa-location
     * @description List of states from National Weather Service database
     */
    states: {
      Type: canList,
      value: [],
      get(lastSetVal, setAttr) {
        NwsSameCodeService.ListSameStates().then(({ sameStates }) => {
          setAttr(lastSetVal.replace(sameStates));
        }).catch((e) => {
          setAttr([]);
          Errors.log(e);
        });
      },
    },
    /**
     * @property {string} state
     * @parent i2web/components/device/configurators/noaa-location
     * @description User selected state
     */
    state: {
      type: 'string',
      value() {
        return getAppState().attr('place.place:state') || '';
      },
      set(state) {
        this.removeAttr('county');
        if (this.attr('onLocationChanged')) {
          this.attr('onLocationChanged')(false);
        }
        return state;
      },
    },
    /**
     * @property {Array} counties
     * @parent i2web/components/device/configurators/noaa-location
     * @description List of counties from National Weather Service database
     */
    counties: {
      value: [],
      get(lastSetVal, setAttr) {
        const state = this.attr('state');
        if (state) {
          setAttr([]);
          NwsSameCodeService.ListSameCounties(state).then(({ counties }) => {
            setAttr(counties);
          }).catch((e) => {
            setAttr([]);
            Errors.log(e);
          });
        } else {
          setAttr([]);
        }
      },
    },
    /**
     * @property {string} county
     * @parent i2web/components/device/configurators/noaa-location
     * @description User selected county
     */
    county: {
      type: 'string',
      value() {
        return getAppState().attr('place.place:addrCounty') || '';
      },
      set(county) {
        const state = this.attr('state');
        if (state && county) {
          if (this.attr('onLocationChanged')) {
            this.attr('onLocationChanged')(true);
          }
          NwsSameCodeService.GetSameCode(state, county).then(({ code }) => {
            this.attr('device.noaa:location', code);
            this.attr('device').save().catch(e => Errors.log(e));
          }).catch(e => Errors.log(e));
        }
        return county;
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-device-configurator-noaa-location',
  viewModel: ViewModel,
  view,
});
