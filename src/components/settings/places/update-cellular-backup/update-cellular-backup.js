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
import Notifications from 'i2web/plugins/notifications';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import SidePanel from 'i2web/plugins/side-panel';
import view from './update-cellular-backup.stache';
import _includes from 'lodash/includes';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Account} account
     * @parent i2web/components/settings/places/update-cellular-backup
     * @description The account associated with the place
     */
    account: {
      Type: Account,
    },
    /**
     * @property {String} activeDisplay
     * @parent i2web/components/settings/places/update-cellular-backup
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
     * @parent i2web/components/settings/places/update-cellular-backup
     * @description Used to trigger the display of the billing info form
     */
    billingInfoNeeded: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} isAdding
     * @parent i2web/components/settings/places/update-cellular-backup
     * @description Indicates if Cellular Backup is being added because it is currently not an add-on
     */
    isAdding: {
      get() {
        const currentAddons = this.attr('place.place:serviceAddons').attr();
        return !(currentAddons && _includes(currentAddons, PlaceCapability.SERVICEADDON_CELLBACKUP));
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/places/update-cellular-backup
     * @description The current place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {String} upgradeError
     * @parent i2web/components/settings/places/update-cellular-backup
     * @description The error that will be displayed at the top of the billing form if the upgrade failed
     */
    upgradeError: {
      type: 'string',
    },
  },
  PlaceCapability,
  /**
   * @property {Boolean} saving
   * @parent i2web/components/settings/places/update-cellular-backup
   * @description Indicates whether the form is being saved
   */
  saving: false,
  /**
   * @function confirmUpdate
   * @parent i2web/components/settings/places/update-cellular-backup
   * @description Called when the user clicks the Confirm button; will show billing info form if needed
   */
  confirmUpdate() {
    const hasBillingInfo = !!this.attr('account.account:billingCCLast4');
    const needBillingInfo = this.attr('isAdding');
    if (needBillingInfo && !hasBillingInfo) {
      this.attr('billingInfoNeeded', true);
    } else {
      this.onSave();
    }
  },
  /**
   * @function onSave
   * @parent i2web/components/settings/places/update-cellular-backup
   * @description This is called immediately when the account already has billing info, or after the billing info has
   * been successfully entered and saved.
   */
  onSave() {
    const level = this.attr('place.place:serviceLevel');
    const isAdding = this.attr('isAdding');
    const addons = isAdding ? { CELLBACKUP: true } : { CELLBACKUP: false };
    this.attr('saving', true);
    this.attr('account').UpdateServicePlan(this.attr('place.base:id'), level, addons).then(() => {
      this.attr('saving', false);
      Notifications.success(`Cellular Backup has been ${isAdding ? 'added to' : 'removed from'} your Service Plan.`);
      SidePanel.closeRight();
    }).catch(() => {
      this.attr('saving', false);
      this.attr('upgradeError',
        'Your transaction was declined. Please contact your bank for further details or try another card.');
      this.attr('billingInfoNeeded', true);
    });
  },
});

export default Component.extend({
  tag: 'arcus-settings-update-cellular-backup',
  viewModel: ViewModel,
  view,
});
