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

import Account from 'i2web/models/account';
import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import canRoute from 'can-route';
import Notifications from 'i2web/plugins/notifications';
import Place from 'i2web/models/place';
import { plans } from 'config/plans.json';
import SidePanel from 'i2web/plugins/side-panel';
import stache from 'can-stache';
import view from './update-service-level.stache';

stache.registerHelper('downgrade-component', function getDowngradeComponent(downgradeType) {
  const componentName = `arcus-settings-update-${downgradeType}`;
  return stache(`<${componentName}/>`)();
});

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Account} account
     * @parent i2web/components/settings/places/update-service-level
     * @description The account associated with the place
     */
    account: {
      Type: Account,
    },
    /**
     * @property {String} activeDisplay
     * @parent i2web/components/settings/places/update-service-level
     * @description The active display of the side panel
     */
    activeDisplay: {
      get() {
        if (this.attr('billingInfoNeeded')) {
          return 'billing';
        }
        return 'confirm';
      },
    },
    /**
     * @property {Boolean} billingInfoNeeded
     * @parent i2web/components/settings/places/update-service-level
     * @description Used to trigger the display of the billing info form
     */
    billingInfoNeeded: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {String} currentServiceLevel
     * @parent i2web/components/settings/places/update-service-level
     * @description The current service level for the place
     */
    currentServiceLevel: {
      type: 'string',
    },
    /**
     * @property {String} downgradeType
     * @parent i2web/components/settings/places/update-service-level
     * @description Returns the from-to downgrade path, if user happens to be downgrading, otherwise undefined
     */
    downgradeType: {
      get() {
        const from = this.attr('currentServiceLevel');
        const to = this.attr('newServiceLevel');
        if (Place.isPremium(from) && Place.isBasic(to)) {
          return 'premium-to-basic';
        }
        return undefined;
      },
    },
    /**
     * @property {String} newServiceLevel
     * @parent i2web/components/settings/places/update-service-level
     * @description The new service level for the place
     */
    newServiceLevel: {
      type: 'string',
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/places/update-service-level
     * @description The current place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {String} upgradeError
     * @parent i2web/components/settings/places/update-service-level
     * @description The error that will be displayed at the top of the billing form if the upgrade failed
     */
    upgradeError: {
      type: 'string',
    },
  },
  /**
   * @property {Boolean} saving
   * @parent i2web/components/settings/places/update-service-level
   * @description Indicates whether the form is being saved
   */
  saving: false,
  /**
   * @function confirmUpdate
   * @parent i2web/components/settings/places/update-service-level
   * @description Called when the user clicks the Confirm button; will show billing info form if needed
   */
  confirmUpdate() {
    const requiresBillingInfo = !Place.isFreePlan(this.attr('newServiceLevel'));
    const hasBillingInfo = !!this.attr('account.account:billingCCLast4');
    if (requiresBillingInfo && !hasBillingInfo) {
      this.attr('billingInfoNeeded', true);
    } else {
      this.onSave();
    }
  },
  /**
   * @function onSave
   * @parent i2web/components/settings/places/update-service-level
   * @description This is called either when the update does not require billing info, or after the billing info has
   * been successfully entered and saved.
   */
  onSave() {
    const level = this.attr('newServiceLevel');
    const addons = {};
    this.attr('saving', true);
    // Redirect into Promon Signup Wizard if requested and not currently at a promon level.
    // Note that the platform updates service level to Promon after test call succeeds.
    if (Place.isPromon(level) && !Place.isPromon(this.attr('currentServiceLevel'))) {
      canRoute.attr({
        page: 'promonitoring',
        subpage: (level.indexOf('ANNUAL') > -1 ? 'annual' : undefined),
        action: undefined });
    } else {
      // Store this value away before making an update to the account
      const downgradeType = this.attr('downgradeType');
      this.attr('account').UpdateServicePlan(this.attr('place.base:id'), level, addons).then(() => {
        this.attr('saving', false);
        const displayName = plans.hasOwnProperty(level) ? ` to ${plans[level].displayName}.` : '.';
        Notifications.success(`You have successfully updated your Service Plan${displayName}`);
        SidePanel.closeRight();
      }).catch(() => {
        this.attr('saving', false);
        this.attr('upgradeError',
          'Your transaction was declined. Please contact your bank for further details or try another card.');
        this.attr('billingInfoNeeded', true);
      });
    }
  },
});

export default Component.extend({
  tag: 'arcus-settings-update-service-level',
  viewModel: ViewModel,
  view,
});
