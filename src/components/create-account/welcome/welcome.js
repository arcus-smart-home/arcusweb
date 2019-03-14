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
import canRoute from 'can-route';
import config from 'i2web/config';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import { tagForAnalytics } from 'i2web/plugins/account-creation';
import view from './welcome.stache';
import _trimEnd from 'lodash/trimEnd';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} appLaunchURL
     * @parent i2web/components/create-account/welcome
     * @description The base URL for launching/installing the app.
     */
    appLaunchURL: {
      get() {
        const apiUrl = _trimEnd(config.apiUrl, '/');
        return `${apiUrl}/app/launch/new-account-created`;
      },
    },
    /**
     * @property {string} androidLaunchURL
     * @parent i2web/components/create-account/welcome
     * @description The base URL for launching/installing the android app.
     */
    androidLaunchURL: {
      get() {
        const appLaunchURL = this.attr('appLaunchURL');
        return `${appLaunchURL}?os=android`;
      },
    },
    /**
     * @property {string} iosLaunchURL
     * @parent i2web/components/create-account/welcome
     * @description The base URL for launching/installing the iOS app.
     */
    iosLaunchURL: {
      get() {
        const appLaunchURL = this.attr('appLaunchURL');
        return `${appLaunchURL}?os=ios`;
      },
    },
    /**
    /**
     * @property {string} appURL
     * @parent i2web/components/create-account/welcome
     * @description The URL for launching/installing the app, including OS parameter based
     * on a subpage.
     */
    appURL: {
      get() {
        const platform = this.attr('subpage');
        const appLaunchURL = this.attr('appLaunchURL');
        if (platform === 'ios') {
          return this.attr('iosLaunchURL');
        } else if (platform === 'android') {
          return this.attr('androidLaunchURL');
        }
        return appLaunchURL;
      },
    },
    /**
     * @property {string} buttonText
     * @parent i2web/components/create-account/welcome
     * @description The text rendered for the button depending on the subpage
     */
    buttonText: {
      get() {
        return (this.attr('subpage')) ? 'Return to Mobile App' : 'Take me to the Dashboard';
      },
    },
    /**
     * @property {boolean} fromInvite
     * @parent i2web/components/create-account/welcome
     * @description This component is being used in invite flow
     */
    fromInvite: {
      get() {
        return this.attr('subpage') && this.attr('subpage') === 'accepted';
      },
    },
    /**
     * @property {boolean} invited
     * @parent i2web/components/create-account/welcome
     * @description This component is being used in the account creation from
     * a mobile device
     */
    fromMobile: {
      get() {
        return this.attr('subpage') && this.attr('subpage') !== 'accepted';
      },
    },
    /**
     * @property {boolean} invited
     * @parent i2web/components/create-account/welcome
     * @description Whether this component is used for account creation or
     * invitee account creation
     */
    invited: {
      type: 'boolean',
    },
    /**
     * @property {Place} place
     * @parent i2web/components/create-account/welcome
     * @description The place to Invitee was invited to
     */
    place: {
      Type: Place,
    },
    /**
     * @property {boolean} monitored
     * @parent i2web/components/create-account/welcome
     * @description Whether the User has selected Promonitoring
     */
    monitored: {
      get() {
        const place = this.attr('place');
        if (place) {
          const promonTag = `PREF_PLAN:${PlaceCapability.SERVICELEVEL_PREMIUM_PROMON}`;
          return place.attr('base:tags').attr().includes(promonTag);
        }
        return false;
      },
    },
    /**
     * @property {boolean} showSupportNumber
     * @parent i2web/components/create-account/welcome
     * @description Show support number because more than 1 attempts has been made to activate
     * the account
     */
    showSupportNumber: {
      get() {
        return this.attr('activationAttempts') > 1;
      },
    },
    /**
     * @property {Boolean} subpage
     * @parent i2web/components/create-account/welcome
     * @description The subpage of the address
     */
    subpage: {
      type: 'string',
    },
  },
  /**
   * @function launchAppAndReRoute
   * @description Launch the mobile app from an iframe,
   * and route the user to the dashboard
   */
  launchAppAndReRoute() {
    const stage = `web:nav.${this.attr('subpage')}`;
    tagForAnalytics(this.attr('place'), stage);
    window.open(this.attr('appURL'), 'launchApp');
    canRoute.attr({ page: 'home', subpage: '', action: '' });
  },
  /**
   * @function routeToHubPairing
   * @description Redirect to the hub setup view.
   */
  routeToHubPairing() {
    canRoute.attr({ page: 'hub-setup', subpage: 'yes-no' });
  },
});

export default Component.extend({
  tag: 'arcus-create-account-welcome',
  viewModel: ViewModel,
  view,
});
