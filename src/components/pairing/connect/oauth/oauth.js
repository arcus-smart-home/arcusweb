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
import CanMap from 'can-map';
import 'can-map-define';
import view from './oauth.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {boolean} isFinishedSteps
     * @parent i2web/components/pairing/connect/oauth/
     * @description if the pairing page parent component has passed the pairing steps phase
     */
    isFinishedSteps: {},
    /**
     * @property {CanList} pairingDevices
     * @parent i2web/components/pairing/connect/oauth/
     * @description list of initialized devices that are currently undergoing pairing
     */
    pairingDevices: {},
    /**
     * @property {boolean} isPopupOpen
     * @parent i2web/components/pairing/connect/oauth/
     * @description if the oauth child component has a popup open
     */
    isPopupOpen: {},
    /**
     * @property {boolean} isAuthFailed
     * @parent i2web/components/pairing/connect/oauth/
     * @description if the oauth process has ended unsuccessfully
     */
    isAuthFailed: {},
    /**
     * @property {boolean} isAuthFailed
     * @parent i2web/components/pairing/connect/oauth/
     * @description if the oauth process has ended unsuccessfully due to a timeout
     */
    isAuthTimedOut: {},
    /**
     * @property {boolean} isLoadingShown
     * @parent i2web/components/pairing/connect/oauth/
     * @description if the animated loading indicator is shown
     */
    isLoadingShown: {
      get() {
        return this.attr('isPopupOpen');
      },
    },
    /**
     * @property {String} title
     * @parent i2web/components/pairing/connect/oauth/
     * @description the title displayed by the parent component when this component is rendered
     */
    title: {
      get() {
        const found = this.attr('pairingDevices.length');

        if (found) {
          return `${found} Device${(found === 0 || found > 1) ? 's' : ''} Found!`;
        }
        if (this.attr('isAuthTimedOut')) {
          return 'Pairing Has Timed Out';
        }
        if (this.attr('isAuthFailed')) {
          const vendor = this.attr('vendor') || '';
          return `No New ${vendor} Devices Found`;
        }
        return 'Connecting...';
      },
    },
    /**
     * @property {String} vendor
     * @parent i2web/components/pairing/connect/oauth/
     * @description the oauth vendor
     */
    vendor: {
      type: 'string',
    },
  },
  /**
   * @function returnToCatalog
   * @parent i2web/components/pairing/connect/oauth/
   * @description transition view to product catalog
   */
  returnToCatalog() {
    window.history.back();
  },
  /**
   * @function returnToSteps
   * @parent i2web/components/pairing/connect/oauth/
   * @description transition view to beginning of pairing steps
   */
  returnToSteps() {
    this.attr('isFinishedSteps', false);
  },
});

export default Component.extend({
  tag: 'arcus-pairing-connect-oauth',
  viewModel: ViewModel,
  view,
});
