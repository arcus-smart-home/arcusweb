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
import canRoute from 'can-route';
import canMap from 'can-map';
import canList from 'can-list';
import 'can-map-define';
import canDev from 'can-util/js/dev/';
import config from 'i2web/config';
import Account from 'i2web/models/account';
import MobileDevice, { MobileDeviceConnection } from 'i2web/models/mobile-device';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import SidePanel from 'i2web/plugins/side-panel';
import Errors from 'i2web/plugins/errors';
import view from './profile.stache';
import I18NService from 'i2web/models/service/I18NService';
import { plans } from 'config/plans.json';
import _ from 'lodash';

import 'i2web/components/form/contact-info/';
import 'i2web/components/form/reset-password/';
import 'i2web/components/form/billing/';
import 'i2web/components/form/change-pin/';
import 'i2web/components/form/security-question/';
import 'i2web/components/form/delete-account/';
import 'i2web/components/form/push-notifications/';

const SecurityQAModel = canMap.extend({
  define: {
    // only allow valid integers, NaN coerced to null. makes 'presence' validation work as desired
    id: { type: (value) => {
      const maybeInt = parseInt(value, 10);
      return isNaN(maybeInt) ? null : maybeInt;
    } },
    question: { type: 'string' },
    answer: { type: 'string' },
    saved: { type: 'boolean' },
  },
});
const SecurityQAList = canList.extend({ Map: SecurityQAModel }, {});

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Person} person
     * @parent i2web/components/settings/profile
     * @description sets properties related to the current person
     */
    person: {
      Type: Person,
      set(newPerson) {
        if (newPerson) {
          this.attr('optIn', newPerson.attr('person:consentOffersPromotions'));

          newPerson.ListMobileDevices().then(({ mobileDevices }) => {
            this.attr('mobileDevices', mobileDevices);
          }).catch((e) => {
            this.attr('mobileDevices', []);
            Errors.log(e, true);
          });
        }
        return newPerson;
      },
      remove() {
        this.removeAttr('optIn');
        this.removeAttr('securityQuestions');
      },
    },
    /**
     * @property {MobileDevice.List} mobileDevices
     * @parent i2web/components/settings/profile
     * @description A list of the Person's mobile devices used for push notifications
     */
    mobileDevices: {
      Type: MobileDevice.List,
      set(mobileDevices) {
        MobileDeviceConnection.addListReference(mobileDevices, {});
        return mobileDevices;
      },
      remove(mobileDevices) {
        if (mobileDevices) {
          MobileDeviceConnection.deleteListReference(mobileDevices, {});
        }
        return mobileDevices;
      },
    },
    /**
     * @property {Place.List} places
     * @parent i2web/components/settings/profile
     * @description A list of the person's available places
     */
    places: {
      Type: Place.List,
    },
    /**
     * @property {Number} optIn
     * @parent i2web/components/settings/profile
     * @description If the user has opted in for updates, set to timestamp they agreed
     */
    optIn: {
      type: 'number',
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/profile
     * @description The current place
     */
    place: {
      Type: Place,
      set(place) {
        return place;
      },
      remove() {
        this.removeAttr('account');
      },
    },
    /**
     * @property {Account} account
     * @parent i2web/components/settings/profile
     * @description The account associated with the place
     */
    account: {
      Type: Account,
      set(account) {
        return account;
      },
    },
    /**
     * @property {number} discountValue
     * @parent i2web/components/settings/profile
     * @description The discount value
     */
    discountValue: {
      type: 'number',
      value: 10,
    },
    /**
     * @property {canList} securityQAs
     * @parent i2web/components/settings/profile
     * @description a list of the person's security question/answer combos
     */
    securityQAs: {
      Type: canList,
      get(lastValue) {
        const answers = this.attr('securityAnswers');
        const questions = this.attr('securityQuestions');
        let ret = lastValue;
        if (answers && questions) {
          ret = new SecurityQAList(answers.map((answer) => {
            const question = _.find(questions, (q) => { return q.id === answer.id; });
            return _.assign({ saved: true }, answer, question);
          }));

          // add space for a new question if there is still less than 3
          if (ret.length < 3) { ret.push({ saved: false }); }
        }
        return ret;
      },
    },
    /**
     * @property {canList} securityQuestions
     * @parent i2web/components/settings/profile
     * @description a list of the possible security questions
     */
    securityQuestions: {
      Type: canList,
      value: [],
      get(lastValue, async) {
        I18NService.LoadLocalizedStrings(['security_question']).then(({ localizedStrings }) => {
          async(_.toPairs(localizedStrings).map(([key, value]) => {
            return {
              id: parseInt(key.slice('security_question:question'.length), 10),
              question: value,
            };
          }));
          return lastValue;
        })
        .catch((e) => { Errors.log(e); });
      },
    },
    /**
     * @property {canList} securityAnswers
     * @parent i2web/components/settings/profile
     * @description a list of the person's answers to security questions
     */
    securityAnswers: {
      Type: canList,
      value: [],
      get(lastValue, async) {
        const person = this.attr('person');

        if (person) {
          person.GetSecurityAnswers().then(({ securityAnswers }) => {
            async(_.toPairs(securityAnswers).map(([key, value]) => {
              return {
                id: parseInt(key.slice('question'.length), 10),
                answer: value,
              };
            }));
          })
          .catch((e) => { Errors.log(e); });
        }

        return lastValue;
      },
    },
    /**
     * @property {string} serviceLevel
     * @parent i2web/components/settings/profile
     * @description Service level name
     */
    serviceLevel: {
      get() {
        const place = this.attr('place');
        if (place) {
          const level = place.attr('place:serviceLevel');
          if (plans.hasOwnProperty(level)) {
            return plans[level].displayName;
          }
          canDev.warn('Service level', level, 'not found');
        }
        return '';
      },
    },
    /**
     * @property {boolean} isAssociated
     * @parent i2web/components/settings/profile
     * @description  Whether the user is associated to an original creator account.
     */
    isAssociated: {
      get() {
        return false;
      },
    },
    /**
     * @property {boolean} isDiscountable
     * @parent i2web/components/settings/profile
     * @description  Whether the user pays any subscription fee that can be discounted.
     */
    isDiscountable: {
      get() {
        const places = this.attr('places');
        if (places) {
          const ownersPromonPlaces = places.filter((place) => {
            return place.attr('web:userOwnsPlace')
              && Place.isPromon(place.attr('place:serviceLevel'))
              && !(place.attr('place:serviceLevel') === PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_FREE);
          });
          return ownersPromonPlaces.attr('length') > 0;
        }
        return false;
      },
    },
  },
  plans,
  PlaceCapability,
  /**
   * @function changePassword
   * @parent i2web/components/settings/profile
   * @description Displays the change password form in the side panel
   */
  changePassword() {
    SidePanel.right('<arcus-form-reset-password {email-address}="emailAddress" />', {
      emailAddress: this.compute('person.person:email'),
    });
  },
  /**
   * @function editContactInfo
   * @parent i2web/components/settings/profile
   * @description Displays the contact info form in the side panel
   */
  editContactInfo() {
    SidePanel.right('<arcus-form-contact-info {(person)}="person" />', {
      person: this.compute('person'),
    });
  },
  /**
   * @function editBilling
   * @parent i2web/components/settings/profile
   * @description Displays the billing form in the side panel
   */
  editBilling() {
    SidePanel.right('<arcus-form-billing {(account)}="account" {place}="place" />', {
      account: this.compute('account'),
      place: this.compute('place'),
    });
  },
  /**
   * @function toggleOptIn
   * @parent i2web/components/settings/profile
   * @description Toggles the consent offer promotion on a person
   */
  toggleOptIn() {
    const optedIn = (this.attr('person.person:consentOffersPromotions') > 0) ? 0 : Date.now();
    this.attr('person').attr('person:consentOffersPromotions', optedIn);
    this.attr('optIn', this.attr('person.person:consentOffersPromotions'));

    this.attr('person').save();
  },
  /**
   * @function changePin
   * @parent i2web/components/settings/profile
   * @description Displays the change pin form in the side panel
   */
  changePinCode(place) {
    const placeId = place.attr('base:id');
    SidePanel.right('<arcus-form-change-pin {(person)}="person" {place-id}="placeId" />', {
      person: this.compute('person'),
      placeId,
    });
  },
  /**
   * @function editSecurityQuestion
   * @parent i2web/components/settings/profile
   * @param index
   * @param currentQuestion
   * @description toggles the security question editing panel
   */
  editSecurityQuestion(zeroIndex, currentQuestion) {
    const index = zeroIndex + 1;
    const saveAllQuestions = this.saveSecurityQuestions.bind(this);
    const usedQuestions = this.attr('securityQAs').map(qa => qa.id);
    const selectableQuestions = this.attr('securityQuestions')
                                    .filter(q => q.id === currentQuestion.id || usedQuestions.indexOf(q.id) === -1);

    SidePanel.right(
      `<arcus-form-security-question
        {index}="index"
        {selectable-questions}="selectableQuestions"
        {current-question}="currentQuestion"
        {save-all-questions}="@saveAllQuestions" />`,
      { index, currentQuestion, selectableQuestions, saveAllQuestions },
    );
  },
  /**
   * @function saveSecurityQuestions
   * @parent i2web/components/settings/profile
   * @param index
   * @param currentQuestion
   * @description saves the set of security questions
   */
  saveSecurityQuestions() {
    const securityQAs = this.attr('securityQAs');
    const completedQAs = _.filter(securityQAs, qa => qa.id && qa.answer);
    const incompleteQAs = _.filter(this.attr('securityQAs'), qa => !(qa.id || qa.answer));
    const params = _.reduce(completedQAs, (ret, { id, answer }) => ret.concat([`question${id}`, answer]), []);
    return this.attr('person').SetSecurityAnswers(...params).then(() => {
      // if we still have less than 3 security questions after saving, add space for another (if not already there)
      if (securityQAs.length < 3 && incompleteQAs.length === 0) { securityQAs.push({ saved: false }); }
    });
  },
  /**
   * @function deleteAccount
   * @parent i2web/pages/settings/profile
   * @description opens the side panel with delete account form inside. Passes account to delete account.
   */
  deleteAccount() {
    SidePanel.right('{{close-button type="cancel"}}<arcus-form-delete-account {(account)}="account" {person}="person" />', {
      account: this.compute('account'),
      person: this.compute('person'),
    });
  },
  /**
   * @function pickPushNotifications
   * @parent i2web/pages/settings/profile
   * @description opens the side panel with the edit push notification form inside.
   */
  pickPushNotifications() {
    SidePanel.right('<arcus-form-push-notifications {mobile-devices}="mobileDevices" {(person)}="person" />', {
      mobileDevices: this.compute('mobileDevices'),
      person: this.compute('person'),
    });
  },
  /**
   * @function updateRoute
   * @parent i2web/pages/settings/profile
   * @param panel The active panel
   * @description Update the route based on the currently active panel
   */
  updateRoute(panel) {
    canRoute.attr('action', panel.attr('action'));
  },
  /**
   * @function isPanelActive
   * @parent i2web/pages/settings/profile
   * @param panel The panel in question, in this instance an accordian item
   * @description Check to see if the accordian item matches up to the what
   * panel should be active based on the route
   */
  isPanelActive(panel) {
    const routeAction = canRoute.attr('action') || 'contact-info';
    return routeAction === panel;
  },
});

export default Component.extend({
  tag: 'arcus-settings-profile',
  viewModel: ViewModel,
  view,
  events: {
    removed() {
      this.viewModel.removeAttr('mobileDevices');
    },
  },
});
