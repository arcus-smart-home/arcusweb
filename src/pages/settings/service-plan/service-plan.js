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

import canMap from 'can-map';
import canRoute from 'can-route';
import Component from 'can-component';
import config from 'i2web/config';
import 'can-map-define';
import view from './service-plan.stache';
import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import ProMonitoringService from 'i2web/models/service/ProMonitoringService';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import SidePanel from 'i2web/plugins/side-panel';
import 'i2web/components/settings/places/update-service-level/';
import 'i2web/components/settings/places/update-cellular-backup/';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Account} account
     * @parent i2web/pages/settings/service-plan
     * @description Account for which service plan is being viewed
     */
    account: {
      Type: Account,
    },
    /**
     * @property {Boolean} isOwner
     * @parent i2web/pages/settings/service-plan
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
          canRoute.removeAttr('subpage');
        }
        return false;
      },
    },
    /**
     * @property {string} monitoringAvailable
     * @parent i2web/pages/settings/service-plan
     * @description Indicates if Promonitoring is available in the place's area
     */
    monitoringAvailable: {
      get(__, setAttr) {
        const place = this.attr('place');
        if (place) {
          ProMonitoringService.GetSettings(place.GetDestination()).then(({ settings }) => {
            new ProMonitoringSettings(settings).CheckAvailability().then(({ available }) => {
              setAttr(available);
            }).catch(() => {
              setAttr('NONE');
            });
          }).catch(() => {
            setAttr('NONE');
          });
        }
        return 'NONE';
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/settings
     * @description sets properties related to the current person
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/settings/service-plan
     * @description Current place for which service plan is being viewed
     */
    place: {
      Type: Place,
    },
  },
  /**
   * @function confirmCellularUpdate
   * @parent i2web/pages/settings/service-plan
   * @description Presents side panel for cellular backup updates.
   */
  confirmCellularUpdate() {
    const attrs = '{(account)}="account" {(place)}="place"';
    SidePanel.right(`<arcus-settings-update-cellular-backup ${attrs} />`, {
      account: this.compute('account'),
      place: this.compute('place'),
    });
  },
  /**
   * @function confirmServiceUpdate
   * @parent i2web/pages/settings/service-plan
   * @description Presents side panel for service plan updates.
   */
  confirmServiceUpdate(serviceLevel) {
    const currentServiceLevel = this.attr('place.place:serviceLevel');
    let newServiceLevel = serviceLevel;
    if (Place.isPremium(currentServiceLevel)
      && Place.isFreePlan(currentServiceLevel)
      && Place.isPremium(newServiceLevel)
      && !Place.isAnnualPlan(newServiceLevel)) {
      // Transition users between FREE monthly plans
      newServiceLevel = Place.isPromon(newServiceLevel)
        ? PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_FREE
        : PlaceCapability.SERVICELEVEL_PREMIUM_FREE;
    }
    if (newServiceLevel === PlaceCapability.SERVICELEVEL_PREMIUM_PROMON) {
      newServiceLevel = PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_MYPARTNER_DISCOUNT;
    }
    const attrs = '{(account)}="account" {(place)}="place" {current-service-level}="currentServiceLevel" {new-service-level}="newServiceLevel"';
    SidePanel.right(`<arcus-settings-update-service-level ${attrs} />`, {
      account: this.compute('account'),
      place: this.compute('place'),
      currentServiceLevel,
      newServiceLevel,
    });
  },
});

export default Component.extend({
  tag: 'arcus-page-settings-service-plan',
  viewModel: ViewModel,
  view,
});
