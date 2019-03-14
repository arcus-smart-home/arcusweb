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

import _ from 'lodash';
import 'can-map-define';
import 'can-construct-super';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import Person from 'i2web/models/person';
import PlaceCapability from 'i2web/models/capability/Place';
import { clearAllProgress } from 'i2web/plugins/account-creation';
import Errors from 'i2web/plugins/errors';
import view from './welcome.stache';

/**
 * @module {canMap} i2web/pages/create-account/steps/welcome Welcome
 * @parent i2web/pages/create-account/steps/welcome
 * @description Account Creation Welcome Screen
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:welcome', //don't really need this here
    },
    /**
     * @property {Number} activationAttempts
     * @parent i2web/pages/create-account/steps/welcome
     * @description The number of attempts the client has attempted
     * to Activate or UpdateServicePlan
     */
    activationAttempts: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/pages/create-account/steps/welcome
     * @description Whether to bypass the current step all together
     */
    bypass: {
      get() {
        return false;
      },
    },
    /**
     * @property {HTMLBool} invited
     * @parent i2web/pages/create-account/steps/welcome
     * @description Whether this component is used for account creation or
     * invitee account creation
     */
    invited: {
      type: 'htmlbool',
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/create-account/steps/welcome
     * @description The initial Person of the new Account
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Boolean} showNextButton
     * @parent i2web/pages/create-account/steps/welcome
     * @description Whether or not to show the Next button
     */
    showNextButton: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} showPrevButton
     * @parent i2web/pages/create-account/steps/welcome
     * @description Whether or not to show the Previous button
     */
    showPrevButton: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {Boolean} subpage
     * @parent i2web/pages/create-account/steps/welcome
     * @description The subpage of the address
     */
    subpage: {
      type: 'string',
    },
  },
  /**
   * @function activationFailure
   * @parent i2web/pages/create-account/steps/welcome
   * @description Called when account Activation or UpdateServicePlan has failed to execute
   */
  activationFailure() {
    const attempts = this.attr('activationAttempts');
    this.attr('activationAttempts', attempts + 1);
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/welcome
   * @description called when the step is activated
   */
  onActivate() {
    clearAllProgress();

    const planTag = _.find(this.attr('place.base:tags'), (t) => {
      return t.includes('PREF_PLAN:');
    });

    const plan = planTag && planTag.split(':')[1];
    if (plan !== PlaceCapability.SERVICELEVEL_BASIC && !this.attr('invited')) {
      this.attr('account').UpdateServicePlan(this.attr('place.base:id'), plan, {})
        .catch((e) => {
          this.activationFailure();
          Errors.log(e);
        });
    }
    // We need to save the person (persisting the first and last name) before
    // we attempt to activate so that the platform doesn't reject our activation
    this.attr('person').save()
      .then(() => {
        if (!this.attr('invited')) {
          this.attr('account').Activate().catch(e => Errors.log(e));
        }
      })
      .catch((e) => {
        this.activationFailure();
        Errors.log(e);
      });
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-welcome',
  viewModel: ViewModel,
  view,
});
