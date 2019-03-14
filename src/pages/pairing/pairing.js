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
import CanMap from 'can-map';
import CanList from 'can-list';
import Cornea from 'i2web/cornea/';
import canRoute from 'can-route';
import 'can-map-define';
import isFinite from 'lodash/isFinite';
import findIndex from 'lodash/findIndex';
import HubPairingConfig from 'config/hub-pairing-config.json';
import HubCustomizationSteps from 'config/hub-pairing-customization-steps.json';
import Incident from 'i2web/models/incident';
import Place from 'i2web/models/place';
import PairingDevice from 'i2web/models/pairing-device';
import CareSubsystem from 'i2web/models/capability/CareSubsystem';
import PairingDeviceCap from 'i2web/models/capability/PairingDevice';
import PairingSubsystemCaps from 'i2web/models/capability/PairingSubsystem';
import ProductCapability from 'i2web/models/capability/Product';
import Errors from 'i2web/plugins/errors';
import AppState from 'i2web/plugins/get-app-state';
import view from './pairing.stache';
import batch from 'can-event/batch/';
import _toUpper from 'lodash/toUpper';
import { partition } from 'lodash';


export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {String} careAlarmState
     * @parent i2web/pages/pairing
     * @description If there is an 'ALERT' turn off pairing mode on the Hub
     */
    careAlarmState: {
      type: 'string',
      set(state) {
        if (state === CareSubsystem.ALARMSTATE_ALERT) {
          this.attr('subsystem').StopSearching().catch(Errors.log);
        }
        return state;
      },
    },
    /**
     * @property {Incident} currentIncident
     * @parent i2web/pages/pairing
     * @description If there is an active incident, this will be defined
     */
    currentIncident: {
      Type: Incident,
      set(incident) {
        if (incident) {
          this.attr('subsystem').StopSearching().catch(Errors.log);
        }
        return incident;
      },
    },
    /**
     * @property {Object} customizationSteps
     * @parent i2web/pages/pairing
     * @description The customization steps for the selected pairing device
     */
    customizationSteps: {
      get(__, setAttr) {
        const device = this.attr('pairingDevice');
        if (this.attr('isHub')) {
          return HubCustomizationSteps;
        } else if (device) {
          device.Customize()
            .then(({ steps }) => {
              this.attr('subsystem').StopSearching().catch(Errors.log);
              setAttr(steps);
            })
            .catch(e => Errors.log(e));
        }
        return undefined;
      },
    },
    /**
     * @property {Boolean} devicesFound
     * @parent i2web/pages/pairing
     * @description Whether or not to show the little corner modal allowing the User
     * to see the paired devices
     */
    devicesFound: {
      get() {
        const deviceCount = this.attr('pairingDevices.length');
        const stage = this.attr('pairingStage');
        return deviceCount > 0
          && (stage === 'help' || stage === 'steps')
          && !this.attr('ignoreFoundDevices');
      },
    },
    /**
     * @property {Boolean} dismissAllCalled
     * @parent i2web/pages/pairing
     * @description DismissAll has been called on the subystem. This is used as a sentinal
     * value to ensure we use the same exit function, but to keep the platform calls
     * to a minimum
     */
    dismissAllCalled: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Array<Object>} dismissCompletionSteps
     * @parent i2web/pages/pairing
     * @description The actions for the User to take after a call to DismissAll
     */
    dismissCompletionSteps: {
      Type: Array,
    },
    /**
     * @property {Object} formValues
     * @parent i2web/pages/pairing
     * @description A collection of strings retrieved from the pairing steps process
     */
    formValues: {
      type: '*',
    },
    /**
     * @property {Boolean} hasUnpairedDevices
     * @parent i2web/pages/pairing
     * @description The subsystem currently has PairingDevices not in the PAIRED state
     */
    hasUnpairedDevices: {
      get() {
        const pairingDevices = this.attr('pairingDevices');
        if (pairingDevices) {
          const unpaired = pairingDevices.filter((device) => {
            return device.attr('pairdev:pairingState') !== PairingDeviceCap.PAIRINGSTATE_PAIRED;
          });
          return unpaired.attr('length') > 0;
        }
        return false;
      },
    },
    /**
     * @property {Boolean} helpRequired
     * @parent i2web/pages/pairing
     * @description Pairing.Search has failed to find a device, show the User help
     * steps
     */
    helpRequired: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Object} helpSteps
     * @parent i2web/pages/pairing
     * @description The help steps to show the User when the pairing subsystem
     * has idled on its search for devices
     */
    helpSteps: {
      get(__, setAttr) {
        this.attr('subsystem').ListHelpSteps()
          .then(({ steps }) => setAttr(steps))
          .catch(e => Errors.log(e));
      },
    },
    /**
     * @property {Boolean} hubFirmwareInProgress
     * @parent i2web/pages/pairing
     * @description The Hub firmware is either downloading or applying
     */
    hubFirmwareInProgress: {
      type: 'boolean',
    },
    /**
     * @property {Boolean} ignoreFoundDevices
     * @parent i2web/pages/pairing
     * @description Whether to ignore the device found modal
     */
    ignoreFoundDevices: {
      type: 'boolean',
    },
    /**
     * @property {Boolean} isFinishedSteps
     * @parent i2web/pages/pairing
     * @description The User has completed the steps portion of pairing
     */
    isFinishedSteps: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} isFinishedRegistration
     * @parent i2web/pages/pairing
     * @description The User has completed the registration portion of pairing
     */
    isFinishedRegistration: {
      type: 'boolean',
      value: false,
      set(value) {
        // Due to timer for progress bar on Hub pairing, the completed
        // registration state change is not always getting propagated
        if (value && this.attr('hubFirmwareInProgress')) {
          this.attr('hubFirmwareInProgress', false);
        }
        return value;
      },
    },
    /**
     * @property {Boolean} isFinishedCustomization
     * @parent i2web/pages/pairing
     * @description The User has completed the customization portion of pairing
     */
    isFinishedCustomization: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} isHub
     * @parent i2web/pages/pairing
     * @description When the product we are pairing is a Hub
     */
    isHub: {
      get() {
        const product = this.attr('product');
        if (product) {
          return product.attr('product:screen') === 'Hub';
        }
        const device = this.attr('pairingDevice');
        if (device) {
          return device.attr('base:type') === 'hub';
        }
        return false;
      },
    },
    /**
     * @property {Boolean} isOAuthDevice
     * @parent i2web/pages/pairing
     * @description Whether the product should be paired via OAuth
     */
    isOAuthDevice: {
      get() {
        return this.attr('product.product:pairingMode') === 'OAUTH' ||
          (_toUpper(this.attr('product.product:pairingMode')) === 'BRIDGED_DEVICE' &&
            _toUpper(this.attr('product.product:protoFamily')) === 'LUTRON');
      },
    },
    /**
     * @property {Boolean} isHubIdle
     * @parent i2web/pages/pairing
     * @description Whether the hub is IDLE
     */
    isHubIdle: {
      get() {
        const pairingMode = this.attr('subsystem.subpairing:pairingMode');
        return pairingMode === PairingSubsystemCaps.PAIRINGMODE_IDLE;
      },
    },
    /**
     * @property {Boolean} isHubRequired
     * @parent i2web/pages/pairing
     * @description Whether the product requires a Hub to be paired.
     */
    isHubRequired: {
      get() {
        return !this.attr('isIpcd');
      },
    },
    /**
     * @property {Boolean} isIpcd
     * @parent i2web/pages/pairing
     * @description Whether the product being paired is an IPCD device
     */
    isIpcd: {
      get() {
        const product = this.attr('product');

        return product
          ? product.attr('product:pairingMode') === ProductCapability.PAIRINGMODE_IPCD
          : false;
      },
    },
    /**
     * @property {Boolean} isV2Hub
     * @parent i2web/pages/pairing
     * @description Is this a v2 hub?
     */
    isV2Hub: {
      get() {
        return this.attr('product.base:id') === 'dee000';
      },
    },
    /**
     * @property {Object} pairingConfig
     * @parent i2web/pages/pairing
     * @description The configuration that tells the rest of that page and child
     * components about how to pair the 'product'.
     */
    pairingConfig: {
      get(__, setAttr) {
        if (this.attr('isHub')) {
          return HubPairingConfig[this.attr('product.base:id')];
        }

        // ensure that we call StartPairing when the steps component is shown
        this.attr('isFinishedSteps');

        const productAddr = this.attr('product.base:address');
        if (productAddr) {
          this.attr('subsystem').StartPairing(productAddr)
            .then(setAttr)
            .catch(this.handleStartPairingError.bind(this));
        }

        return undefined;
      },
    },
    /**
     * @property {CanList<PairingDevice>} pairingDevices
     * @parent i2web/pages/pairing
     * @description The list of PairingDevice objects held by the pairing subsystem.
     * Loaded from the server at first read. Kept in sync by 'pairdev base:Added' events.
     */
    pairingDevices: {
      Type: CanList,
    },
    /**
     * @property {CanList<PairingDevice>} pairingKitDevices
     * @parent i2web/pages/pairing
     * @description The list of kitted PairingDevice objects held by the pairing subsystem.
     * Loaded from the server at first read. Will be reduced when devices fully pair or mispair.
     */
    pairingKitDevices: {
      Type: CanList,
    },
    /**
     * @property {String} pairingStage
     * @parent i2web/pages/pairing
     * @description The stage we currently on, used to determine what component to
     * render.
     */
    pairingStage: {
      get() {
        if (this.attr('helpRequired')) { return 'help'; }
        if (this.attr('showUnavailableHub')) { return 'hub-unavailable'; }
        if (this.attr('removeDevice')) { return 'remove'; }
        if (this.attr('showFactoryReset')) { return 'reset'; }
        const stages = [{
          condition: 'isFinishedSteps',
          else: 'steps',
        }, {
          condition: 'isFinishedRegistration',
          else: 'registration',
        }, {
          condition: 'isFinishedCustomization',
          else: 'customize',
        }];
        const nextStage = stages.find(s => !this.attr(s.condition));
        return (nextStage && nextStage.else) || 'completed';
      },
    },
    /**
     * @property {string} pairingTitle
     * @parent i2web/pages/pairing
     * @description The title displayed on the page showing the brand and type
     * of device being paired
     */
    pairingTitle: {
      get(lastSetValue) {
        const product = this.attr('product');
        if (!product) {
          const action = canRoute.attr('action');
          return (action === 'advanced') ? lastSetValue : '';
        }
        // every other component is responsible for setting the title
        return lastSetValue;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/pairing
     * @description The place we are pairing devices or a Hub
     */
    place: {
      Type: Place,
    },
    /**
     * @property {CanMap} product
     * @parent i2web/pages/pairing
     * @description Specific product from the product catalog. Used when pairing devices.
     */
    product: {
      Type: CanMap,
    },
    /**
     * @property {String} progressStage
     * @parent i2web/pages/pairing
     * @description Which stage to render in the staged progress component
     */
    progressStage: {
      get() {
        const stage = this.attr('pairingStage');
        return (stage === 'customize' || stage === 'completed')
          ? 'customize'
          : 'connect';
      },
    },
    /**
     * @property {Boolean} removeDevice
     * @parent i2web/pages/pairing
     * @description Indicates if the user is in remove device stage
     */
    removeDevice: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} showExitPrompt
     * @parent i2web/pages/pairing
     * @description The User has clicked Exit Pairing and still has unpaired PairingDevices
     */
    showExitPrompt: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} showFactoryReset
     * @parent i2web/pages/pairing
     * @description The user has requested to do a factory reset
     */
    showFactoryReset: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} showFirmwareExitModal
     * @parent i2web/pages/pairing
     * @description Should show an exit modal when the User is trying to exit
     * pairing when Hub firmware is downloading or applying
     */
    showFirmwareExitModal: {
      type: 'boolean',
    },
    /**
     * @property {Boolean} showLastPairingStep
     * @parent i2web/pages/pairing
     * @description Show the only the last step of the pairing steps component
     */
    showLastPairingStep: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Array<String>} stages
     * @parent i2web/pages/pairing
     * @description The stages to be shown in the staged progress bar
     */
    stages: {
      value: ['discover', 'connect', 'customize'],
    },
    /**
     * @property {PairingSubsystem} subsystem
     * @parent i2ewb/pages/pairing
     * @description The pairing subsystem
     */
    subsystem: {
      get() {
        return AppState().attr('subsystems').findByName('subpairing');
      },
    },
    /**
     * @property {Function} onPairingDeviceAdded
     * @parent i2web/pages/pairing
     * @description Event handler that updates the list of pairing devices when a new one arrives by websocket.
     * Generated by the getter only once per component to allow for unbinding.
     */
    onPairingDeviceAdded: {
      Type: Function,
      get() {
        if (!this._onPairingDeviceAdded) {
          this._onPairingDeviceAdded = (device) => {
            if (!device['base:tags'] || !device['base:tags'].includes('KIT')) {
              this.attr('pairingDevices').push(new PairingDevice(device));
            }
          };
        }
        return this._onPairingDeviceAdded;
      },
    },
    /**
     * @property {Function} onPairingDeviceChanged
     * @parent i2web/pages/pairing
     * @description Event handler that updates the list of pairing devices when a kit pairdev pairs or mispairs, e.g.
     * when state transitions to PAIRED or MISPAIRED, move it from the pairingKitDevices list into the pairingDevices list.
     * Generated by the getter only once per component to allow for unbinding.
     */
    onPairingDeviceChanged: {
      Type: Function,
      get() {
        if (!this._onPairingDeviceChanged) {
          this._onPairingDeviceChanged = (device) => {
            if (device['pairdev:pairingState'] !== PairingDeviceCap.PAIRINGSTATE_PAIRING) {
              const address = device['base:address'];
              const kitDevices = this.attr('pairingKitDevices');
              const deviceIndex = findIndex(kitDevices, d => address === d['base:address']);

              if (isFinite(deviceIndex) && deviceIndex >= 0) {
                this.attr('pairingDevices').push(kitDevices[deviceIndex]);
                kitDevices.splice(deviceIndex, 1);
              }
            }
          };
        }
        return this._onPairingDeviceChanged;
      },
    },
    /**
     * @property {Function} onPairingDeviceRemoved
     * @parent i2web/pages/pairing
     * @description Event handler that updates the list of pairing devices when a new one arrives by websocket.
     * Generated by the getter only once per component to allow for unbinding.
     */
    onPairingDeviceRemoved: {
      Type: Function,
      get() {
        if (!this._onPairingDeviceRemoved) {
          this._onPairingDeviceRemoved = (device) => {
            const address = device['base:address'];
            const devices = this.attr('pairingDevices');
            const deviceIndex = findIndex(devices, d => address === d['base:address']);

            if (isFinite(deviceIndex) && deviceIndex >= 0) {
              devices.splice(deviceIndex, 1);
            }
          };
        }
        return this._onPairingDeviceRemoved;
      },
    },
  },
  /**
   * @property {Object} route
   * @parent i2web/pages/pairing
   * @description the canRoute module, used for binding to events
   */
  route: canRoute,
  exitPairing() {
    // If the hub is downloading or updating its firmware and the User
    // tries to exit the Hub pairing process, we want to discourage exit
    if (this.attr('hubFirmwareInProgress')) {
      this.attr('showFirmwareExitModal', true);
    } else if (this.attr('pairingDevices.length')) {
      this.attr('showExitPrompt', true);
    } else {
      this.onConfirmExitPairing();
    }
  },
  /**
   * @function handleStartPairingError
   * @param {Object} error
   * @parent i2web/pages/pairing
   * @description Handle errors from the FactoryReset platform call
   */
  handleFactoryResetError({ code }) {
    if (this.isHubMissingOrOfflineErrorCode(code)) {
      this.attr('helpRequired', false);
      this.attr('showUnavailableHub', true);
    } else {
      const productAddr = this.attr('product.base:address');
      if (productAddr && this.isRequestInvalidErrorCode(code)) {
        this.attr('subsystem')
          .StartPairing(productAddr)
          .then(pairingConfig => this.attr('pairingConfig', pairingConfig))
          .catch((e) => {
            this.attr('helpRequired', false);
            this.handleStartPairingError(e);
          });
      } else {
        this.routeToProductCatalog();
      }
    }
  },
  /**
   * @function handleStartPairingError
   * @param {Object} error
   * @parent i2web/pages/pairing
   * @description Handle any errors from the StartPairing platform call
   */
  handleStartPairingError({ code }) {
    if (this.isHubMissingOrOfflineErrorCode(code)) {
      this.attr('showUnavailableHub', true);
    }
  },
  /**
   * @function helpButtonClick
   * @param {String} action
   * @parent i2web/pages/pairing
   * @description The button click handler for any help steps that have a
   * button action
   */
  helpButtonClick(action) {
    this.attr('showLastPairingStep', false);
    this.attr('showUnavailableHub', false);
    this.attr('removeDevice', false);
    this.attr('showFactoryReset', false);

    // Skip the reset modal if the device does not require a HUB
    // let onConfirmFactoryReset transition the UI once FactoryReset finishes
    if (action === 'FACTORY_RESET' && !this.attr('isHubRequired')) {
      this.onConfirmFactoryReset();
      return;
    }

    switch (action) {
      case 'FACTORY_RESET':
        this.attr('showFactoryResetModal', true);
        break;
      case 'PAIRING_STEPS':
        this.attr('isFinishedSteps', false);
        break;
      case 'FORM':
        this.attr('showLastPairingStep', true);
        this.attr('isFinishedSteps', false);
        break;
      default: break;
    }

    this.attr('helpRequired', false);
  },
  /**
   * @function {Boolean} isHubMissingOrOfflineErrorCode
   * @parent i2web/pages/pairing
   * @description Whether to error code is for an offline/missing hub
   */
  isHubMissingOrOfflineErrorCode(code) {
    return code === 'hub.missing' || code === 'hub.offline';
  },
  /**
   * @function {Boolean} isRequestInvalidErrorCode
   * @parent i2web/pages/pairing
   * @description Whether to error code is for an invalid request, e.g:
   * FactoryReset() when Hub is not in pairing mode
   */
  isRequestInvalidErrorCode(code) {
    return code === 'request.state.invalid';
  },
  /**
   * @function onAbandonPairingSteps
   * @parent i2web/pages/pairing
   * @description Called when the user backs out of the first pairing step
   * in component <arcus-pairing-steps>
   */
  onAbandonPairingSteps() {
    this.attr('subsystem').StopSearching();
    window.history.back();
  },
  /**
   * @function onCancelRemoveDevice
   * @parent i2web/pages/pairing
   * @description Called when the 'Cancel' button on arcus-pairing-remove-modal
   * is clicked.
   */
  onCancelRemoveDevice() {
    this.attr('pairingDevice', null);
    this.attr('removeDevice', false);
    this.attr('showRemoveDeviceModal', false);
  },
  /**
   * @function onConfirmExitPairing
   * @parent i2web/pages/pairing
   * @description The User has confirmed they wish to exit, so dismiss any
   */
  onConfirmExitPairing() {
    if (!this.attr('dismissAllCalled')) {
      this.attr('subsystem').DismissAll().then(({ actions }) => {
        this.attr('dismissAllCalled', true);
        this.attr('showExitPrompt', false);
        if (actions.length) {
          this.attr('dismissCompletionSteps', actions);
        } else {
          this.routeToDashboard();
        }
      }).catch(Errors.log);
    } else {
      this.routeToDashboard();
    }
  },
  /**
   * @function onCustomize
   * @parent i2web/pages/pairing
   * @description Called when the 'Customize' button on arcus-pairing-device-state
   * is clicked.
   */
  onCustomize({ pairingDevice }) {
    batch.start();
    this.attr({
      pairingDevice,
      helpRequired: false,
      isFinishedCustomization: false,
      isFinishedRegistration: true,
    });
    batch.stop();
  },
  /**
   * @function onRemove
   * @parent i2web/pages/pairing
   * @description Called when the 'Remove' button on arcus-pairing-device-state
   * is clicked.
   */
  onRemove({ pairingDevice }) {
    this.attr('pairingDevice', pairingDevice);
    this.attr('showRemoveDeviceModal', true);
  },
  /**
   * @function onPairRemovedDevice
   * @parent i2web/pages/pairing
   * @description Called when the 'Pair Device' button on arcus-pairing-remove-device component
   * is clicked.
   */
  onPairRemovedDevice(pairingDevice) {
    this.attr('pairingDevice', pairingDevice);
    this.attr('removeDevice', false);
    this.attr('isFinishedRegistration', false);
    this.attr('isFinishedCustomization', false);
  },
  /**
   * @function onRemoveDevice
   * @parent i2web/pages/pairing
   * @description Called when the 'Remove' button on arcus-pairing-remove-modal
   * is clicked.
   */
  onRemoveDevice() {
    this.attr('showRemoveDeviceModal', false);
    this.attr('removeDevice', true);
  },
  /**
   * @function onResumePairing
   * @parent i2web/pages/pairing
   * @description Close the exit prompt and resume the pairing process
   */
  onResumePairing() {
    this.attr('showExitPrompt', false);
  },
  /**
   * @function onTryAgain
   * @parent i2web/pages/pairing
   * @description Called when the 'Try Again' button on arcus-pairing-device-state
   * is clicked.
   */
  onTryAgain(/* { pairingDevice } */) {
    // TBD in I2-1783
  },
  /**
   * @function onConfirmFactoryReset
   * @parent i2web/pages/pairing
   * @description Called when the 'Confirm' button on arcus-pairing-reset-modal
   * is clicked.
   */
  onConfirmFactoryReset() {
    batch.start();
    this.attr('showFactoryResetModal', false);

    const subsystem = this.attr('subsystem');
    const productAddr = this.attr('product.base:address');
    const searchPromise = this.attr('isHubRequired') && this.attr('isHubIdle')
      ? subsystem.Search(productAddr)
      : Promise.resolve();

    searchPromise
      .then(() => {
        subsystem.FactoryReset()
          .then((response) => {
            this.attr('resetSteps', response.steps);
            this.attr('showFactoryReset', true);
            this.attr('helpRequired', false);
          })
          .catch(this.handleFactoryResetError.bind(this));
      })
      .catch((e) => {
        if (this.isHubMissingOrOfflineErrorCode(e.code)) {
          this.attr('helpRequired', false);
          this.attr('showUnavailableHub', true);
        } else {
          Errors.log(e);
        }
      });

    batch.stop();
  },
  /**
   * @function onCancelFactoryReset
   * @parent i2web/pages/pairing
   * @description Called when the 'Cancel' button on arcus-pairing-reset-modal
   * is clicked.
   */
  onCancelFactoryReset() {
    this.attr('showFactoryResetModal', false);
    this.attr('showFactoryReset', false);
  },
  /**
   * @function onPairDeviceAfterReset
   * @parent i2web/pages/pairing
   * @description Called when the 'Pair Device' button on arcus-pairing-reset-device
   * is clicked.
   */
  onPairDeviceAfterReset() {
    if (this.attr('isIpcd')) {
      this.attr({
        helpRequired: false,
        showUnavailableHub: false,
        removeDevice: false,
        showFactoryReset: false,
        isFinishedSteps: false,
        isFinishedRegistration: false,
        isFinishedCustomization: false,
      });
    } else {
      this.attr({
        showFactoryReset: false,
        isFinishedRegistration: false,
        isFinishedCustomization: false,
      });
    }
  },
  /**
   * @function routeToDashboard
   * @parent i2web/pages/pairing
   * @description When exiting pairing route the User to the dashboard
   */
  routeToDashboard() {
    this.attr('dismissAllCalled', true);
    this.attr('subsystem').StopSearching().catch(Errors.log);
    canRoute.attr({ page: 'home', subpage: undefined, action: undefined });
  },
  /**
   * @function routeToProductCatalog
   * @parent i2web/pages/pairing
   * @description When FactoryReset fails and no product address,
   * route user to product catalog
   */
  routeToProductCatalog() {
    canRoute.attr({
      page: 'product-catalog',
      subpage: 'brands',
      action: undefined,
    });
  },
});

export default Component.extend({
  tag: 'arcus-page-pairing',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const inAdvanceMode = canRoute.attr('action') === 'advanced';
      this.viewModel.attr('isFinishedSteps', inAdvanceMode);
      if (!this.viewModel.attr('product') && !inAdvanceMode) {
        this.viewModel.exitPairing();
      }

      const subsystem = this.viewModel.attr('subsystem');
      subsystem.ListPairingDevices()
        .then(({ devices }) => {
          // 1. Partition pairdevs to separate out kitted devices still in PAIRING state
          const partitionKitOrNot = partition(devices, ((d) => {
            return !d['base:tags'] || !d['base:tags'].includes('KIT') ||
              (d['base:tags'].includes('KIT') && d['pairdev:pairingState'] !== PairingDeviceCap.PAIRINGSTATE_PAIRING);
          }));
          // 2. Further filter the pairdevs to get those from the current pairing session, as well as current or past mispairs
          const filtered = partitionKitOrNot[0].filter((d) => {
            const address = d['base:address'];
            return subsystem.attr('subpairing:pairingDevices').attr().includes(address)
              || d['pairdev:pairingState'] !== PairingDeviceCap.PAIRINGSTATE_PAIRED;
          })
            .map(d => new PairingDevice(d));
          this.viewModel.attr('pairingDevices', new CanList((filtered.length) ? filtered : []));
          // 3.  Add the kitted devices still PAIRING to a separate list and pull over later when pairingState changes
          if (partitionKitOrNot[1].length) {
            const pairingKitDevices = partitionKitOrNot[1].map(d => new PairingDevice(d));
            this.viewModel.attr('pairingKitDevices', new CanList(pairingKitDevices));
          } else {
            this.viewModel.attr('pairingKitDevices', new CanList([]));
          }
        })
        .catch(e => Errors.log(e));

      Cornea.addListener('pairdev base:Added',
        this.viewModel.attr('onPairingDeviceAdded'));
      Cornea.addListener('pairdev base:Deleted',
        this.viewModel.attr('onPairingDeviceRemoved'));

      Cornea.addListener('pairdev base:ValueChange',
        this.viewModel.attr('onPairingDeviceChanged'));
    },
    removed() {
      this.viewModel.attr('showUnavailableHub', false);
      AppState().attr('pairingProduct', undefined);

      Cornea.removeListener('pairdev base:Added',
        this.viewModel.attr('onPairingDeviceAdded'));
      Cornea.removeListener('pairdev base:Deleted',
        this.viewModel.attr('onPairingDeviceRemoved'));

      Cornea.removeListener('pairdev base:ValueChange',
        this.viewModel.attr('onPairingDeviceChanged'));
    },
    '{route} page': function pageChanged(app) {
      const page = app.attr('page');
      const subpage = app.attr('subpage');

      // We want to exit pairing immediately if there is an alarm
      // and only Stop Searching which is done when the currentIncident
      // is set
      if (page !== 'services' && subpage !== 'alarms') {
        const confirmWhen = ['hub-setup', 'pairing', 'product-catalog', 'kit-activate'];
        // only confirm when we are leaving pairing entirely, the above pages
        // are still a part of the pairing process
        if (!confirmWhen.includes(page)) {
          this.viewModel.onConfirmExitPairing();
        }
      }
    },
  },
});
