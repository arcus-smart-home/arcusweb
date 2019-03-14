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

import CanMap from 'can-map';
import 'can-map-define';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import AppState from 'i2web/plugins/get-app-state';
import Errors from 'i2web/plugins/errors';
import InvitationService from 'i2web/models/service/InvitationService';
import Person from 'i2web/models/person';
import SidePanel from 'i2web/plugins/side-panel';
import view from './accept-code.stache';

const invitationNotFoundError = [
  'Email and or invitation code not recognized.',
  'Please check the email and invitation code and try again.',
  'Invitation codes expire after 7 days.',
].join(' ');

const invalidInvitationError = [
  'Invitation not valid.',
  'Contact the account owner for details.',
  'You may need to be re-invited.',
].join(' ');

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {String} acceptInvitationError
     * @parent i2web/components/settings/invites/accept-code
     * @description Contains the error message if the promise returned by
     * @acceptInvitation is rejected.
     */
    acceptInvitationError: {
      value: '',
    },
    /**
     * @property {String} activeDisplay
     * @parent i2web/components/settings/invites/accept-code
     * @description Determines whether to render the form to capture the invitation
     * code or the form to capture the pin code.
     */
    activeDisplay: {
      value: 'enterInviteCode',
    },
    /**
     * @property {Object} constraints
     * @parent i2web/components/settings/invites/accept-code
     * @description Constraints for the form capturing the invitation code and email
     */
    constraints: {
      value() {
        return {
          'model.code': {
            presence: true,
          },
          'model.email': {
            presence: true,
            email: {
              message: 'is invalid',
            },
          },
        };
      },
    },
    /**
     * @property {CanMap} invitation
     * @parent i2web/components/settings/invites/accept-code
     * @description the invitation corresponding to the submitted email and code
     */
    invitation: {
      Type: CanMap,
    },
    /**
     * @property {CanMap} model
     * @parent i2web/components/settings/invites/accept-code
     * @description Map wrapper for the invitation code and email fields
     */
    model: {
      Value: CanMap,
    },
    /**
     * @property {Person} person
     * @parent i2web/components/settings/invites/accept-code
     * @description the current person
     */
    person: {
      Type: Person,
    },
    /**
     * @property {String} placeId
     * @parent i2web/components/settings/invites/accept-code
     * @description the id of the place corresponding to the invitation
     */
    placeId: {
      get() {
        const invitation = this.attr('invitation');
        return invitation ? invitation.attr('placeId') : '';
      },
    },
  },
  /**
   * @function handleInviteCodeSubmit
   * @parent i2web/components/settings/invites/accept-code
   * @description Click event handler for the invitation code form submit button
   */
  handleInviteCodeSubmit() {
    // remove the error when the user submits the form
    this.attr('acceptInvitationError', '');

    // run validations and do not call acceptInvitation if any error is found
    if (!this.formValidates()) {
      return;
    }

    const code = this.attr('model.code');
    const email = this.attr('model.email');
    InvitationService.GetInvitation(code, email).then(({ invitation }) => {
      this.attr('invitation', invitation);
      this.attr('person').AcceptInvitation(code, email)
        .then(() => {
          this.attr('activeDisplay', 'enterPinCode');
        }).catch(e => this.onInviteError(e));
    }).catch(e => this.onInviteError(e));
  },
  /**
   * @function onInviteError
   * @parent i2web/components/settings/invites/accept-code
   * @description Error handler for invalid invitation code or email
   */
  onInviteError(e) {
    const errorMessage = e && e.code === 'request.destination.notfound'
      ? invitationNotFoundError
      : invalidInvitationError;
    this.attr('acceptInvitationError', errorMessage);
  },
  /**
   * @function onPendingCountUpdated
   * @parent i2web/components/settings/invites/accept-code
   * @description Executed after the overall pending invitation count has been updated
   */
  onPendingCountUpdated() {
    AppState().attr('acceptedInvitation', this.attr('invitation'));
    SidePanel.closeRight();
  },
  /**
   * @function onPinCodeCreated
   * @parent i2web/components/settings/invites/accept-code
   * @description Callback to be executed after the pin code has been created.
   */
  onPinCodeCreated() {
    this.attr('person').PendingInvitations().then(({ invitations }) => {
      AppState().attr('invitationsCount', invitations.length);
      this.onPendingCountUpdated();
    }).catch((e) => {
      Errors.log(e);
      this.onPendingCountUpdated();
    });
  },
});

/**
 * @parent i2web/components/settings
 * @module {FormComponent} i2web/components/settings/invites/accept-code
 * @signature `<arcus-settings-invites-accept-code {person}="person" />`
 * This component will be used for accepting an invitation in the settings page
 */
export default FormComponent.extend({
  tag: 'arcus-settings-invites-accept-code',
  ViewModel,
  view,
});

