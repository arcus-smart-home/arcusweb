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

import Analytics from 'i2web/plugins/analytics';
import AppState from 'i2web/plugins/get-app-state.js';
import Component from 'can-component';
import CanList from 'can-list';
import CanMap from 'can-map';
import 'can-map-define';
import Errors from 'i2web/plugins/errors';
import Person from 'i2web/models/person';
import SidePanel from 'i2web/plugins/side-panel';
import view from './accept.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {String} activeDisplay
     * @parent i2web/components/invite/accept
     * @description The active display of the side panel
     */
    activeDisplay: {
      type: 'string',
      get() {
        if (this.attr('newPlaceId')) {
          return 'pin';
        }
        return 'invites';
      },
    },
    /**
     * @property {Boolean} hasResponded
     * @parent i2web/components/invite/accept
     * @description Indicates if the user has responded (accepted or rejected) to at least one invitation
     */
    hasResponded: {
      type: 'boolean',
      value: false,
    },

    /**
     * @property {String} formError
     * @parent i2web/components/invite/accept
     * @description Set when there's an error returned by invitation acceptance/rejection
     */
    formError: {
      type: 'string',
    },
    /**
     * @property {CanList} invitations
     * @parent i2web/components/invite/accept
     * @description List of pending invitations for the current user
     */
    invitations: {
      Type: CanList,
      Value: CanList,
    },
    /**
     * @property {String} newPlaceId
     * @parent i2web/components/invite/accept
     * @description Base id of the user's newly accessible place; only defined after an invite is successfully accepted
     */
    newPlaceId: {
      type: 'string',
    },
    /**
     * @property {Person} person
     * @parent i2web/components/invite/accept
     * @description The person currently logged in
     */
    person: {
      Type: Person,
    },
  },
  /**
   * @function acceptInvitation
   * @parent i2web/components/invite/accept
   * @description Accept an invitation
   */
  acceptInvitation(invitation) {
    this.removeAttr('formError');
    Analytics.tag('invitation.accept');
    this.attr('person').AcceptInvitation(invitation.code, invitation.inviteeEmail).then(() => {
      this.attr('newPlaceId', invitation.placeId);
      this.onPinSet = () => AppState().attr('acceptedInvitation', invitation);
    }).catch((e) => {
      this.attr('formError', 'Hmm... something\'s wrong. Please try again.');
      Errors.log(e);
    });
  },
  /**
   * @function declineInvitation
   * @parent i2web/components/invite/accept
   * @description Decline an invitation
   */
  declineInvitation(invitation) {
    this.removeAttr('formError');
    Analytics.tag('invitation.reject');
    this.attr('person').RejectInvitation(invitation.code, invitation.inviteeEmail)
      .then(() => {
        this.attr('hasResponded', true);
        this.retrieveInvitations();
      }).catch((e) => {
        this.attr('formError', 'Hmm... something\'s wrong. Please try again.');
        Errors.log(e);
      });
  },
  /**
   * @function onPinSet
   * @parent i2web/components/invite/accept
   * @description Called after the user successfully saves their pin on an accepted invitation,
   * this is used so that we can capture the invitation to display the success modal and is
   * set when the User accepts the invitation.
   */
  onPinSet: undefined,
  /**
   * @function onSavePin
   * @parent i2web/components/invite/accept
   * @description Called after the user successfully saves their pin on an accepted invitation.
   */
  onSavePin() {
    this.attr('hasResponded', true);
    this.removeAttr('newPlaceId');
    this.onPinSet();
    this.retrieveInvitations();
  },
  /**
   * @function retrieveInvitations
   * @parent i2web/components/invite/accept
   * @description Retrieves invitations from the platform
   */
  retrieveInvitations() {
    this.attr('person').PendingInvitations().then(({ invitations }) => {
      this.attr('invitations').replace(invitations);
      AppState().attr('invitationsCount', invitations.length);
      if (!invitations.length && this.attr('hasResponded')) {
        SidePanel.closeRight();
      }
    }).catch(Errors.log);
  },
});

export default Component.extend({
  tag: 'arcus-invite-accept',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      this.viewModel.attr('person', AppState().attr('person'));
      this.viewModel.retrieveInvitations();
    },
  },
});
