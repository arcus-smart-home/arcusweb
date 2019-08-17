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

import $ from 'jquery';
import _ from 'lodash';
import Component from 'can-component';
import canMap from 'can-map';
import canRoute from 'can-route';
import canDev from 'can-util/js/dev/';
import canViewModel from 'can-view-model';
import 'can-map-define';
import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import PlaceCapability from 'i2web/models/capability/Place';
import { extractSelectedUse, generateStages, tagForAnalytics } from 'i2web/plugins/account-creation';
import Errors from 'i2web/plugins/errors';
import AppState from 'i2web/plugins/get-app-state';
import view from './create-account.stache';

const STATE_LOCATION = 'arcus/account/creation/state';
const STAGES_LOCATION = 'arcus/account/creation/stages';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Account} account
     * @parent i2web/pages/create-account
     * @description The new account
     */
    account: {
      Type: Account,
    },
    /**
     * @property {Array} completedStages
     * @parent i2web/pages/create-account
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {Array} completedState
     * @parent i2web/pages/create-account
     * @description The state of the completed steps
     */
    completedState: {
      Value: Object,
    },
    /**
     * @property {Array} completedStages
     * @parent i2web/pages/create-account
     * @description The list of Devices for the newly created Place
     */
    devices: {
      get() {
        return AppState().attr('devices');
      },
    },
    /**
     * @property {List<Person>} people
     * @parent i2web/pages/create-account
     * @description All people tied to the new Place
     */
    people: {
      get() {
        return AppState().attr('people');
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/create-account
     * @description The initial Person of the new Account
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/create-account
     * @description The initial Place of the new Account
     */
    place: {
      Type: Place,
    },
    /**
     * @property {string} pinCode
     * @parent i2web/pages/create-account
     * @description The pro-monitoring PIN Code of the future Account
     */
    pinCode: {
      type: 'string',
    },
    /*
     * @property {String} selectedUse
     * @parent i2web/pages/create-account
     * @description Is the User creating an account to pair a switch or kit
     */
    selectedUse: {
      type: 'string',
    },
    /*
     * @property {Boolean} startedOnMobile
     * @parent i2web/pages/create-account
     * @description Uses the route to determine if user arrived here via mobile account creation link
    */
    startedOnMobile: {
      get() {
        const platform = this.attr('subpage');
        return (platform === 'ios' || platform === 'android');
      },
    },
    /**
     * @property {string} session
     * @parent i2web/pages/create-account
     * @description The authenticated session
     */
    session: {
      set(session) {
        tagForAnalytics(this.attr('place'), 'web:login');
        return session;
      },
    },
    /**
     * @property {Boolean} subpage
     * @parent i2web/pages/create-account
     * @description The subpage of the address
     */
    subpage: {
      type: 'string',
    },
  },
  PlaceCapability,
  /**
   * @function nextOnEnter
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
   * @function recordProgress
   * @description Record the stage and name of a completed stage
   */
  recordProgress(stage, state) {
    if (stage && !_.includes(this.attr('completedStages'), stage)) {
      this.attr('completedStages').push(stage);
    }
    const map = new canMap(state);
    _.forIn(map.serialize(), (value, key) => {
      if (value.writeableAttributes) {
        delete value.writeableAttributes;
      }
      this.attr('completedState').attr({ [key]: value }, false);
    });
    try {
      window.localStorage.setItem(STAGES_LOCATION,
        JSON.stringify(this.attr('completedStages')));
      window.localStorage.setItem(STATE_LOCATION,
        JSON.stringify(this.attr('completedState').serialize()));
    } catch (e) {
      canDev.warn(e);
    }
    if (this.attr('session')) {
      tagForAnalytics(this.attr('place'), stage);
    }
  },
  /**
   * @function routeToDashboard
   * @description Route the User to the dashboard (or mobile app)
   */
  routeToDashboard() {
    tagForAnalytics(this.attr('place'), 'web:nav.web');
    canRoute.attr({ page: 'home', subpage: undefined, action: undefined });
  },
  /**
   * @function undoProgress
   * @description Remove the completed stage so it is not bypassed when advancing
   */
  undoProgress(stage) {
    const stages = _.pull(this.attr('completedStages'), stage);
    try {
      window.localStorage.setItem(STAGES_LOCATION, JSON.stringify(stages));
    } catch (e) {
      canDev.warn(e);
    }
  },
  /**
   * @function generateStagesListener
   * @description an event listener that gets called when steps register themselves with wizard and then generates the stages array accordingly
   */
  generateCompletedStages() {
    const steps = $('arcus-wizard .wizard').children().map((__, step) => canViewModel(step));
    const stages = generateStages(steps.toArray());
    this.attr('completedStages', stages);
    try {
      window.localStorage.setItem(STAGES_LOCATION,
        JSON.stringify(stages));
    } catch (e) {
      canDev.warn(e);
    }
  },
});

export default Component.extend({
  tag: 'arcus-page-create-account',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const vm = this.viewModel;
      try {
        vm.attr('completedState',
          JSON.parse(window.localStorage.getItem(STATE_LOCATION)) || {});
      } catch (e) {
        canDev.warn(e);
      }

      const monitoringAvailable = vm.attr('completedState').attr('monitoringAvailable');
      if (monitoringAvailable) {
        vm.attr('monitoringAvailable', monitoringAvailable);
      }

      const selectedUse = vm.attr('completedState').attr('selectedUse');
      if (selectedUse) {
        vm.attr('selectedUse', selectedUse);
      }

      if (!vm.attr('account')) {
        vm.attr('account', new Account({}));
        const partialAccount = vm.attr('completedState').attr('account');
        if (partialAccount) {
          vm.attr('account').attr(partialAccount.serialize(), false);
        }
      }

      if (!vm.attr('person')) {
        vm.attr('person', new Person({}));
        const partialPerson = vm.attr('completedState').attr('person');
        if (partialPerson) {
          vm.attr('person').attr(partialPerson.serialize(), false);
        }
      }

      if (!vm.attr('place')) {
        vm.attr('place', new Place({ 'base:tags': [] }));
        const partialPlace = vm.attr('completedState').attr('place');
        if (partialPlace) {
          vm.attr('place').attr(partialPlace.serialize(), false);
        }
      } else {
        const preferredUse = extractSelectedUse(vm.attr('place'));
        if (preferredUse) {
          vm.attr('selectedUse', preferredUse);
        }
        const notAvailable = vm.attr('place.base:tags').indexOf('PROMON_NOT_AVAILABLE');
        if (notAvailable !== -1) {
          vm.attr('monitoringAvailable', 'NONE');
          vm.attr('completedState.monitoringAvailable', 'NONE');
          vm.attr('place').attr('place:streetAddress1', '');
          vm.attr('place.base:tags').splice(notAvailable, 1);
        }
      }

      vm.generateCompletedStages();

      if (vm.attr('account.account:state') === 'COMPLETE') {
        vm.routeToDashboard();
      } else {
        vm.recordProgress(undefined, {
          account: vm.attr('account'),
          monitoringAvailable: vm.attr('completedState.monitoringAvailable'),
          person: vm.attr('person'),
          place: vm.attr('place'),
          selectedUse: vm.attr('selectedUse'),
        });
      }
    },
  },
});
