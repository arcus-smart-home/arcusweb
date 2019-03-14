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
import view from './how-to-use.stache';

export const ViewModel = canMap.extend({
  define: {
    /*
     * @property {Function} selectAndAdvance
     * @parent i2web/components/create-account/how-to-use
     * @description Parent component's callback method that is invoked when desired use is selected.
     */
    selectAndAdvance: {
      type: '*',
    },
    /**
     * @property {*} session
     * @parent i2web/components/create-account/how-to-use
     * @description The authenticated session, if user logged in
     */
    session: {
      type: '*',
    },
    /*
     * @property {Boolean} showMobileModal
     * @parent i2web/components/create-account/how-to-use
     * @description Indicates if the modal should be shown to direct user to download Mobile app.
     */
    showMobileModal: {
      type: 'boolean',
    },
   /*
    * @property {Boolean} startedOnMobile
    * @parent i2web/components/create-account/how-to-use
    * @description Indicates if user arrived here via mobile account creation link
    */
    startedOnMobile: {
      type: 'boolean',
    },
  },
  /*
 * @function selectUse
 * @param String-selectedUse will be either 'switch' or 'security'
 * @parent i2web/components/create-account/how-to-use
 * @description Invoked when User makes a choice between security pack and BLE switches.
 */
  selectUse(selectedUse) {
    if (selectedUse === 'switch') {
      if (this.attr('startedOnMobile') && this.attr('session')) {
        // If user came from mobile and logged in, skip zip code and plan selection
        // This will effectively keep the user on Basic, which is the default during account creation
        this.attr('place.base:tags', ['PREF_PLAN:BASIC']);
        this.recordProgress('web:zipcode', {});
        this.recordProgress('web:plan', {
          place: this.attr('place'),
        });
        this.attr('selectAndAdvance')(selectedUse);
      } else {
        this.attr('showMobileModal', true);
      }
    } else {
      this.attr('selectAndAdvance')(selectedUse);
    }
  },
});

export default Component.extend({
  tag: 'arcus-create-account-how-to-use',
  viewModel: ViewModel,
  view,
});
