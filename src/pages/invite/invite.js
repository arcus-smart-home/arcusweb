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
import Component from 'can-component';
import canViewModel from 'can-view-model';
import route from 'can-route';
import { FormViewModel } from 'i2web/components/form/';
import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import InvitationService from 'i2web/models/service/InvitationService';
import view from './invite.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {Boolean} accepted
     * @parent i2web/pages/invite
     * @description Render the form if the invitation has not been accepted yet
     */
    accepted: {
      get() {
        return this.attr('session')
          || (this.attr('subpage') === 'accepted'
          && this.attr('inviteCode')
          && this.attr('inviteeEmail'));
      },
    },
    /**
     * @property {Array} completedStages
     * @parent i2web/pages/invite
     * @description A collection of the completed stages
     */
    completedStages: {
      value: [],
    },
    /*
     * @property {canMap} constraints
     * @parent i2web/pages/invite
     * @description Form validation constraints
     */
    constraints: {
      value: {
        inviteCode: {
          presence: true,
        },
        inviteeEmail: {
          presence: true,
          email: {
            message: 'is invalid',
          },
        },
      },
    },
    /**
     * @property {Object} invitation
     * @parent i2web/pages/invite
     * @description The response from a GetInvitation call
     */
    invitation: {
      type: '*',
    },
    /**
     * @property {String} invitersFullName
     * @parent i2web/pages/invite
     * @description The inviters full possesive name
     */
    invitersFullName: {
      get() {
        const invitation = this.attr('invitation');
        const fullName =
          `${invitation.invitorFirstName} ${invitation.invitorLastName}`.trim();
        return `${fullName}${(fullName.slice(-1).toLowerCase() === 's') ? '\'' : '\'s'}`;
      },
    },
    session: {
      Type: CanMap,
    },
    startAt: {
      get() {
        return (this.attr('session')) ? 1 : 0;
      },
    },
    /**
     * @property {String} subpage
     * @parent i2web/pages/invite
     * @description The URLs subpage
     */
    subpage: {
      type: 'string',
    },
  },
  route,
  /**
   * @function nextOnEnter
   * @parent i2web/pages/invite
   * @description Allow the User to type 'Enter' and attempt to proceed to the next step
   */
  nextOnEnter() {
    const wizardVM = canViewModel('arcus-wizard');
    const activeStep = wizardVM.attr('activeStep');
    if (activeStep.attr('isSatisfied')) {
      this.next();
    }
  },
  /**
   * @function onSubmitInviteCode
   * @parent i2web/pages/invite
   * @description Submit the invite code and email address to the Invitation Service
   */
  onSubmitInviteCode() {
    if (this.formValidates()) {
      InvitationService.GetInvitation(this.attr('inviteCode'), this.attr('inviteeEmail'))
        .then(({ invitation }) => this.attr('invitation', invitation))
        .catch(() => this.attr('formError', true));
    }
  },
  /**
   * @function routeToDashboard
   * @parent i2web/pages/invite
   * @description Route the User to the dashboard (or mobile app)
   */
  routeToDashboard() {
    route.attr({ page: 'home', subpage: undefined, action: undefined });
  },
  /**
   * @function toAccountCreation
   * @parent i2web/pages/invite
   * @description Change to the route so the invitee can create an account
   */
  toAccountCreation() {
    route.attr('subpage', 'accepted');
  },
});

export default Component.extend({
  tag: 'arcus-page-invite',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const vm = this.viewModel;
      if (route.attr('subpage') === 'accepted' && !vm.attr('accepted')) {
        route.attr('subpage', undefined);
      }
      if (!vm.attr('account')) {
        vm.attr('account', new Account({}));
      }
      if (!vm.attr('person')) {
        vm.attr('person', new Person({}));
      }
      if (!vm.attr('place')) {
        vm.attr('place', new Place({ 'base:tags': [] }));
      }
    },
  },
});
