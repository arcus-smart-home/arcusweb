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
import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import Place from 'i2web/models/place';
import Hub from 'i2web/models/hub';
import view from './hub.stache';

const POLLING_INTERVAL = 5 * 1000;
const MAX_PERCENT = 95;

const OFFLINE_TIMEOUT = 10 * 60 * 1000;
const DOWNLOADING_TIMEOUT = 11 * 60 * 1000;
const APPLYING_TIMEOUT = 5 * 60 * 1000;

const PROGRESS_BY = {
  OFFLINE: (POLLING_INTERVAL / OFFLINE_TIMEOUT) * 100,
  DOWNLOADING: (POLLING_INTERVAL / DOWNLOADING_TIMEOUT) * 100,
  APPLYING: (POLLING_INTERVAL / APPLYING_TIMEOUT) * 100,
};

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Boolean} firmwareInProgress
     * @parent i2web/components/pairing/connect/hub
     * @description Is the firmware of the Hub either downloading or applying?
     * Used to determine if we should show a modal to the User if they try and
     * exit Hub pairing.
     */
    firmwareInProgress: {
      get() {
        const state = this.attr('registrationState');
        return state === 'DOWNLOADING' || state === 'APPLYING';
      },
    },
    /**
     * @property {Object} formValues
     * @parent i2web/components/pairing/connect/hub
     * @description A collection of strings retrieved from the pairing steps process.
     * These are values collected from the `form` property of the pairing steps.
     * `formValues` will always be an array of Strings, and due to this component being
     * specific to Hub pairing; it is understood that the 0th element of `formValues`
     * is the Hub ID (because the form property is hard-coded by us -
     * config/hub-pairing-config.json)
     *
     * __NOTE__: keep in mind that this property is not an observable (it is a
     * regular object) which means that any change made to this object will NOT
     * trigger a template re-render. This behavior is intentional since the
     * initial Hub ID has to be displayed even when the user types a new one,
     * make sure any input bound to formValues stays in sync.
     */
    formValues: {
      type: '*',
    },
    /**
     * @property {Hub} hub
     * @parent i2web/components/pairing/connect/hub
     * @description The recently paired Hub
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {String} hubIDText
     * @parent i2web/components/pairing/connect/hub
     * @description How to display the Hub ID to the User
     */
    hubIDText: {
      get() {
        const state = this.attr('registrationState');
        const formValues = this.attr('formValues');
        const id = formValues && formValues['hub-id'];
        if (id && state === 'timed.out') {
          return id.toUpperCase();
        }
        return (id) ? `, ${id.toUpperCase()}, ` : ' ';
      },
    },
    /**
     * @property {Boolean} isFinishedRegistration
     * @parent i2web/components/pairing/connect/hub
     * @description Is the User finished with registration process
     */
    isFinishedRegistration: {
      type: 'boolean',
      get() {
        return this.attr('registrationState') === 'REGISTERED';
      },
    },
    /**
     * @property {Boolean} isV2Hub
     * @parent i2web/components/pairing/connect/hub
     * @description Is this a v2 hub?
     */
    isV2Hub: {
      type: 'boolean',
    },
    /**
     * @property {Boolean} isV3HubReEntry
     * @parent i2web/components/pairing/connect/hub
     * @description Is this a V3 hub and has the user clicked a button to re-enter the hub ID?
     */
    isV3HubReEntry: {
      type: 'boolean',
    },
    /**
     * @property {Place} place
     * @parent i2web/components/pairing/connect/hub
     * @description The place the User is pairing the Hub
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Object} pollingInterval
     * @parent i2web/components/pairing/connect/hub
     * @description Holds on to intervals for all state transitions. Has the
     * structure: { id: <number>, state: 'DOWNLOADING' | 'APPLYING' | 'OFFLINE' }
     */
    pollingInterval: {
      type: '*',
    },
    /**
     * @property {Number} progress
     * @parent i2web/components/pairing/connect/hub
     * @description The actual percentage complete in current timeout cycle
     */
    progress: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {Number} progressDisplayed
     * @parent i2web/components/pairing/connect/hub
     * @description The percentage complete to show in the progress bar
     */
    progressDisplayed: {
      type: 'number',
      get() {
        const progress = this.attr('progress');
        return Math.ceil(progress / 5) * 5;
      },
    },
    /**
     * @property {String} registrationState
     * @parent i2web/components/pairing/connect/hub
     * @description The state returned by the platfrom from the most recent register
     * Hub call
     */
    registrationState: {
      set(state) {
        const errors = [
          'request.param.invalid',
          'request.param.missing',
          'error.register.alreadyregistered',
          'error.register.activehub',
        ];
        return (errors.includes(state)) ? 'requires.new.id' : state;
      },
    },
    /**
     * @property {String} resetInstructions
     * @parent i2web/components/pairing/connect/hub
     * @description The instructions for resetting
     */
    resetInstructions: {
      get() {
        const start = 'Please make sure the Hub ID was entered correctly. If it is accurate,';
        const end = this.attr('isV2Hub')
          ? 'factory reset the Hub by holding down the red reset button on the back of the Hub for 20 seconds, then try pairing it again.'
          : 'a factory reset of the hub is required to resolve the issue.';
        return `${start} ${end}`;
      },
    },
    /**
     * @property {Boolean} showIDForm
     * @parent i2web/components/pairing/connect/hub
     * @description Whether to show the Hub ID entry form to the User
     */
    showIDForm: {
      type: 'boolean',
      value: false,
      get() {
        const state = this.attr('registrationState');
        const isV3HubReEntry = this.attr('isV3HubReEntry');
        return isV3HubReEntry || state === 'requires.new.id' || state === 'timed.out';
      },
    },
    /**
     * @property {Boolean} showProgressBar
     * @parent i2web/components/pairing/connect/hub
     * @description Whether to show the progress bar to the User
     */
    showProgressBar: {
      type: 'boolean',
      value: true,
      get() {
        const state = this.attr('registrationState');
        return state === 'OFFLINE'
          || state === 'DOWNLOADING'
          || state === 'APPLYING'
          || state === 'timed.out';
      },
    },
    /**
     * @property {String} title
     * @parent i2web/components/pairing/connect/hub
     * @description The title to display on the pairing page
     */
    title: {
      get() {
        switch (this.attr('registrationState')) {
          case 'error.fwupgrade.failed': return 'Update Failed.';
          case 'error.register.orphanedhub': return 'Smart Hub Error';
          case 'requires.new.id': return 'Smart Hub is Pairing...';
          case 'timed.out': return 'Searching for Smart Hub...';
          case 'DOWNLOADING': return 'Update Available';
          case 'APPLYING': return 'Applying Update...';
          default: return 'Smart Hub is Pairing...';
        }
      },
    },
  },
  /**
   * @function onHubIdChange
   * @parent i2web/components/pairing/connect/hub
   * @param {*} evt - The change event object
   * @description Change event handler for the '<input>' used to collect the
   * updated Hub Id, since 'formValues' is not an observable it's required to
   * observed when the input changes its value to keep 'formValues` up to date.
   */
  onHubIdChange(evt) {
    const newHubId = evt && evt.target.value;
    const formValues = this.attr('formValues');

    if (formValues['hub-id'] !== newHubId) {
      formValues['hub-id'] = newHubId;
    }
  },
  /**
   * @function pollForHubState
   * @parent i2web/components/pairing/connect/hub
   * @description The polling function used to query the platform for Hub pairing
   * state
   */
  pollForHubState() {
    const formValues = this.attr('formValues');
    const id = formValues && formValues['hub-id'].toUpperCase();
    this.attr('place').RegisterHubV2(id).then(({ state, hub }) => {
      if (state === 'REGISTERED' && hub) {
        this.attr('hub', hub);
        this.stopPollingInterval(state);
        Analytics.tag('hub.pairing.complete');
      } else {
        // Maintain the most recent state so we can continue polling until
        // we either time out, or see a response with state=REGISTERED AND a valid hub model
        const pollState = (state === 'REGISTERED' ? this.attr('registrationState') : state);
        this.startOrContinuePolling(pollState);
        this.updateRegistrationState(pollState);
      }
    }).catch(({ code }) => {
      this.stopPollingInterval(code);
      switch (code) {
        case 'error.register.orphanedhub':
          Analytics.tag('hub.pairing.failed.orphanedhub');
          break;
        case 'error.register.alreadyregistered':
          Analytics.tag('hub.pairing.failed.alreadyregistered');
          break;
        case 'error.register.activehub':
          Analytics.tag('hub.pairing.failed.activehub');
          break;
        case 'error.fwupgrade.failed':
          Analytics.tag('hub.pairing.failed.fwupgrade');
          break;
        default:
          Analytics.tag('hub.pairing.failed.usererror');
      }
    });
  },
  /**
   * @function registerHub
   * @parent i2web/components/pairing/connect/hub
   * @description Start the Hub registration process
   */
  registerHub() {
    this.startOrContinuePolling('OFFLINE');
    this.attr('isV3HubReEntry', false);
  },
  /**
   * @function resetToIdEntry
   * @parent i2web/components/pairing/connect/hub
   * @description Set an attribute to show the ID entry box
   */
  resetToIdEntry() {
    this.attr('isV3HubReEntry', true);
  },
  /**
   * @function resetToPairingSteps
   * @parent i2web/components/pairing/connect/hub
   * @description Start the pairing process over with the pairing steps
   */
  resetToPairingSteps() {
    this.attr('isFinishedSteps', false);
  },
  /**
   * @function startOrContinuePolling
   * @parent i2web/components/pairing/connect/hub
   * @param {String} state The state of hub during pairing
   * @description Start a polling interval based on the state of Hub pairing
   */
  startOrContinuePolling(state) {
    const interval = this.attr('pollingInterval');
    if (interval && interval.state === state) return;
    if (interval && interval.state !== state) this.stopPollingInterval(state);

    this.attr('progress', 100);
    this.attr('registrationState', state);
    this.attr('progress', 0);

    this.attr('pollingInterval', {
      id: setInterval(this.pollForHubState.bind(this), POLLING_INTERVAL),
      state,
    });
  },
  /**
   * @function stopPollingInterval
   * @parent i2web/components/pairing/connect/hub
   * @param {String} state The state of hub during pairing
   * @description Stop the current states polling interval
   */
  stopPollingInterval(state) {
    const interval = this.attr('pollingInterval');
    if (interval && interval.id) {
      clearInterval(interval.id);
      this.attr('pollingInterval', null);
    }
    if (state) {
      this.attr('progress', 100);
      // wait for the progress bar animation to finish before
      // updating registrationState which might cause the progress
      // bar to be removed from the page.
      setTimeout(() => {
        this.updateRegistrationState(state);
      }, 2500);
    }
  },
  /**
   * @function updateRegistrationState
   * @parent i2web/components/pairing/connect/hub
   * @description Update the registrationState and the registration process
   */
  updateRegistrationState(state) {
    this.attr('registrationState', state);
    if (state === 'REGISTERED') return;

    const currentProgress = this.attr('progress');
    const progressBy = PROGRESS_BY[state.toUpperCase()];
    if (progressBy) {
      const updatedProgress = currentProgress + progressBy;

      // if we advanced past the max percent we timed out or failed to upgrade
      if (updatedProgress >= MAX_PERCENT) {
        const code = (state === 'OFFLINE')
          ? 'timed.out'
          : 'error.fwupgrade.failed';
        this.stopPollingInterval(code);
      } else {
        this.attr('progress', updatedProgress);
      }
    }
  },
});

export default Component.extend({
  tag: 'arcus-pairing-connect-hub',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const vm = this.viewModel;
      const formValues = vm.attr('formValues');
      if (formValues && formValues['hub-id']) {
        vm.registerHub();
      } else {
        vm.attr('registrationState', 'requires.new.id');
      }
    },
    removed() {
      this.viewModel.stopPollingInterval();
    },
    '{viewModel} showIDForm': function showIDForm() {
      setTimeout(() => {
        const element = document.getElementById('hub-id-entry');
        if (element) element.focus();
        if (element && element.value) element.select();
      }, 0);
    },
  },
});
