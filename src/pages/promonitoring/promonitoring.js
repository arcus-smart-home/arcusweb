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
import canRoute from 'can-route';
import canMap from 'can-map';
import 'can-map-define';
import Account from 'i2web/models/account';
import Device from 'i2web/models/device';
import Errors from 'i2web/plugins/errors';
import Place from 'i2web/models/place';
import Person from 'i2web/models/person';
import ProMonitoringService from 'i2web/models/service/ProMonitoringService';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import view from './promonitoring.stache';

import 'i2web/components/form/change-pin/';
import 'i2web/pages/promonitoring/alarm-requirements.component';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Boolean} annualRequested
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Indicates if the user has requested an annual subscription plan
     */
    annualRequested: {
      get() {
        return canRoute.attr('subpage') === 'annual';
      },
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/promonitoring
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/promonitoring
     * @description Current place
     */
    place: {
      Type: Place,
      set(place) {
        if (place) {
          ProMonitoringService.GetSettings(place.GetDestination()).then(({ settings }) => {
            this.attr('promonitoringSettings', settings);
            if (settings) {
              const isPromon = this.attr('place.isPromon');
              const isTrial = this.attr('promonitoringSettings').attr('promon:trial');
              if (!isPromon && !isTrial) {
                this.attr('promonitoringSettings').CheckAvailability().then(({ available }) => {
                  if (available !== 'FULL') {
                    this.routeToServicePlanPage();
                  }
                }).catch((e) => {
                  Errors.log(e);
                  this.routeToServicePlanPage();
                });
              }
            }
          }).catch((e) => {
            Errors.log(`Error getting Pro Monitoring Settings: ${e.message}`);
            this.routeToServicePlanPage();
          });
        }
        return place;
      },
    },
    /**
     * @property {Account} account
     * @parent i2web/pages/promonitoring
     * @description Account used to validate current person is owner
     */
    account: {
      Type: Account,
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/promonitoring
     * @description Current person
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Device.List} devices
     * @parent i2web/pages/promonitoring
     * @description All devices associated with the current place
     */
    devices: {
      Type: Device.List,
    },
    /**
     * @property {Person.List} people
     * @parent i2web/pages/promonitoring
     * @description All people tied to the current place
     */
    people: {
      Type: Person.List,
    },
    /**
     * @property {boolean} isOwner
     * @parent i2web/pages/promonitoring
     * @description Whether the currently logged in person is this place's account owner
     */
    isOwner: {
      get() {
        const person = this.attr('person');
        const account = this.attr('account');
        if (person && account) {
          if (person.attr('base:id') === account.attr('account:owner')) {
            return true;
          }
          this.routeToServicePlanPage();
        }
        return false;
      },
    },
  },
  /**
   * @function routeToServicePlanPage
   * @description redirects the user to the service plan page
   */
  routeToServicePlanPage() {
    canRoute.attr({
      page: 'settings',
      subpage: 'service-plan',
    });
  },
});

export default Component.extend({
  tag: 'arcus-page-promonitoring',
  viewModel: ViewModel,
  view,
});
