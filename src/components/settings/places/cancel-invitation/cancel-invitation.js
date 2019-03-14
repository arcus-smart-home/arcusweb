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
import Cornea from 'i2web/cornea/';
import Notifications from 'i2web/plugins/notifications';
import Place from 'i2web/models/place';
import Errors from 'i2web/plugins/errors';
import SidePanel from 'i2web/plugins/side-panel';
import view from './cancel-invitation.stache!';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {canMap} invitee
     * @parent i2web/components/settings/places/cancel-invitation
     * @description The invitee whose invitation we want to cancel
     */
    invitee: {
      Type: canMap,
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/places/cancel-invitation
     * @description The place
     */
    place: {
      Type: Place,
    },
  },
  /**
   * @function removeAccess
   * @parent i2web/components/settings/places/cancel-invitation
   *
   * @description Click handler to cancel the invitation
   */
  cancelInvitation() {
    const place = this.attr('place');
    const invitee = this.attr('invitee');
    const placeName = invitee.placeName;
    const possessiveName = (() => {
      const lastName = invitee.inviteeLastName;
      const possessive = (lastName.slice(-1) === 's') ? `${lastName}'` : `${lastName}'s`;
      return `${invitee.inviteeFirstName} ${possessive}`;
    })();

    place.CancelInvitation(invitee.attr('code'))
      .then(() => {
        Notifications.success(`${possessiveName} invitation to ${placeName} has been cancelled.`, 'icon-app-user-2');
        Cornea.emit('web person:InvitationCancelled');
        SidePanel.close();
      })
      .catch(e => Errors.log(e, true));
  },
});

export default Component.extend({
  tag: 'arcus-settings-cancel-invitation',
  viewModel: ViewModel,
  view,
});
