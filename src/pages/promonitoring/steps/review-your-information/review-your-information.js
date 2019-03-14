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

import 'can-map-define';
import $ from 'jquery';
import 'can-construct-super';
import config from 'i2web/config';
import Errors from 'i2web/plugins/errors';
import 'i2web/components/form/change-pin/';
import StepComponent, { StepViewModel, StepEvents } from 'i2web/components/wizard/step/';
import view from './review-your-information.stache';
import SidePanel from 'i2web/plugins/side-panel';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import Person from 'i2web/models/person';
import PersonCapability from 'i2web/models/capability/Person';
import ProMonitoringSettings from 'i2web/models/pro-monitoring-settings';
import ProMonitoringSettingsCapability from 'i2web/models/capability/ProMonitoringSettings';

/**
 * @module {canMap} i2web/pages/promonitoring/steps/review-your-information Review Your Information
 * @parent i2web/pages/promonitoring
 * @description ProMonitoring Signup Review Your Information Step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    /**
     * @property {Boolean} annualRequested
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Indicates if the user has requested an annual subscription plan
     */
    annualRequested: {
      type: 'boolean',
    },
    /**
     * @property {ProMonitoringSettings} promonitoringSettings
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Promonitoring settings config for the current place
     */
    promonitoringSettings: {
      Type: ProMonitoringSettings,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Current place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Current person
     */
    person: {
      Type: Person,
    },
    /**
     * @property {string} pinCode
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Pin code entered
     */
    pinCode: {
      type: 'string',
      value: '',
      set(code) {
        this.attr('pinCodeConfirmed', false);
        if (code.length === 4) {
          if (this.attr('person')) {
            this.attr('verifying', true);
            this.attr('person').VerifyPin(this.attr('place.base:id'), code).then(() => {
              this.attr('pinCodeConfirmed', true);
              this.attr('verifying', false);
            }).catch((e) => {
              Errors.log(e);
              this.attr('verifying', false);
            });
          }
        } else {
          this.attr('pinCodeConfirmed', false);
        }
        return code;
      },
    },
    /**
     * @property {Boolean} verifying
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Whether we are verifying the pin or not
     */
    verifying: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} pinCodeConfirmed
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Indicates that user has successfully confirmed pin code
     */
    pinCodeConfirmed: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} hideAlerts
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Whether we should hide the list of alerts
     */
    hideAlerts: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} hideEditAddress
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Whether we should hide the Edit Address button
     */
    hideEditAddress: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} validPhoneNumber
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Indicates that user has a valid phone number
     */
    validPhoneNumber: {
      get() {
        const enteredNumber = this.attr('person.person:mobileNumber');
        return enteredNumber && enteredNumber.replace(/[^0-9]+/g, '').length === 10;
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Indicates that signup info and pin have been confirmed by user
     */
    isSatisfied: {
      get() {
        return this.attr('pinCodeConfirmed') && this.attr('validPhoneNumber');
      },
    },
    /**
     * @property {string} nextButtonLabel
     * @parent i2web/pages/promonitoring/steps/review-your-information
     * @description Next Button Label
     */
    nextButtonLabel: {
      type: 'string',
      value: 'Begin Test',
    },
  },
  init() {
    this._super(arguments);
    PersonCapability.events.onPinChangedEvent(() => {
      this.attr('pinCode', '');
    });
  },
  PlaceCapability,
  /**
   * @function changePinCode
   * @parent i2web/pages/promonitoring/steps/review-your-information
   * @description Displays the change pin form in the side panel
   */
  changePinCode(ev) {
    ev.preventDefault();
    const placeId = this.attr('place.base:id');
    SidePanel.right('<arcus-form-change-pin subheader="Create a New PIN Code" {(person)}="person" {place-id}="placeId" />', {
      person: this.compute('person'),
      placeId,
    });
  },
  /**
   * @function editAddress
   * @parent i2web/pages/promonitoring/steps/review-your-information
   * @description Displays the edit address form in the side panel
   */
  editAddress() {
    SidePanel.right('<arcus-form-edit-address {(promonitoring-settings)}="promonitoringSettings" {(place)}="place" />', {
      promonitoringSettings: this.compute('promonitoringSettings'),
      place: this.compute('place'),
    });
  },
  /**
   * @function onNext
   * @parent i2web/pages/promonitoring/steps/review-your-information
   * @description Method invoked when user presses button to move to next signup wizard step; asks the platform to activate ProMonitoring.
   */
  onNext() {
    if (this.attr('promonitoringSettings.promon:testCallStatus') !== ProMonitoringSettingsCapability.TESTCALLSTATUS_SUCCEEDED) {
      const yearly = this.attr('annualRequested') && !!parseInt(config.enableYearlySubscription, 10);
      const serviceLevel = yearly
        ? PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_ANNUAL
        : PlaceCapability.SERVICELEVEL_PREMIUM_PROMON;
      return this.attr('promonitoringSettings').Activate(true, serviceLevel);
    }
    return Promise.resolve();
  },
  /**
   * @property {error} onNextError
   * @parent i2web/pages/promonitoring/steps/review-your-information
   * @description Method that should execute if onNext Promise is rejected; displays error to user.
   */
  onNextError(error) {
    Errors.log(`${error.code} : ${error.message}`);
    this.attr('formError', error.message);
  },
  /**
   * @function preventSubmit
   * @parent i2web/pages/promonitoring/steps/review-your-information
   * @description Prevent the submission of the form when the user presses ENTER in PIN code field.
   */
  preventSubmit(ev) {
    ev.preventDefault();
  },
});

const events = Object.assign({}, StepEvents, {
  '{input.pinCode} input': function pinCodeInputKeypress(el, ev) {
    if (ev.data) {
      const input = $(el).find('input.pinCode');
      if (input.val().length === 4) {
        input.blur();
      }
    }
  },
});

export default StepComponent.extend({
  tag: 'arcus-pro-monitoring-step-review-your-information',
  viewModel: ViewModel,
  view,
  events,
});
