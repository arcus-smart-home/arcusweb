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
import 'can-map-define';
import canRoute from 'can-route';
import Errors from 'i2web/plugins/errors';
import _find from 'lodash/find';
import getAppState from 'i2web/plugins/get-app-state';
import Hub from 'i2web/models/hub';
import PairingDevice from 'i2web/models/pairing-device';
import PairingDeviceCapability from 'i2web/models/capability/PairingDevice';
import view from './kit-activate.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Object} customizationSteps
     * @parent i2web/pages/kit-activate
     * @description The customization steps for a selected kit device
     */
    customizationSteps: {
      get(__, setAttr) {
        const device = this.attr('pairingDevice');
        if (device) {
          device.Customize()
            .then(({ steps }) => {
              setAttr(steps);
            })
            .catch(e => Errors.log(e));
        }
        return undefined;
      },
    },
    /**
     * @property {Device.List} devices
     * @parent i2web/pages/kit-activate
     * @description The devices of this particular place
     */
    devices: {
      get() {
        return getAppState().attr('devices');
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/pages/kit-activate
     * @description The Hub for the current place
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {Boolean} isFinishedCustomization
     * @parent i2web/pages/kit-activate
     * @description User has finished customizing a particular kit device
     */
    isFinishedCustomization: {
      type: 'boolean',
      set(finished) {
        if (finished) {
          this.attr('pairingDevice')
            .AddCustomization('CUSTOMIZATION_COMPLETE').catch(Errors.log);
          this.attr('pairingDevice', null);
        }
        return finished;
      },
    },
    /**
     * @property {Boolean} isKitComplete
     * @parent i2web/pages/kit-activate
     * @description All kit devices are fully activated and customized; and there are no errors or mispairs
     */
    isKitComplete: {
      type: 'boolean',
      get() {
        if (this.attr('uncustomizedDeviceCount') || this.attr('mispairedDeviceCount')) {
          return false;
        }

        // To observe changes for devices and pairing devices added and removed
        this.attr('devices.length');
        this.attr('subsystem.subpairing:pairingDevices.length');

        const devices = this.attr('devices');
        const kitDevices = this.attr('kitDevices');
        if (kitDevices) {
          let completeCount = 0;
          kitDevices.forEach((kd) => {
            if (_find(devices, (d => kd.protocolAddress.includes(d['devadv:protocolid'])))) {
              completeCount++;
            }
          });
          return completeCount === this.attr('kitDevices.length');
        }
        return false;
      },
    },
    /**
     * @property {Boolean} isHub
     * @parent i2web/pages/kit-activate
     * @description Attribute needed for the customization component; always
     * false in this context
     */
    isHub: {
      type: 'boolean',
      value: 'false',
    },
    /**
     * @property {CanList} kitDevices
     * @parent i2web/pages/kit-activate
     * @description Kitting information from the Subsystem
     */
    kitDevices: {
      get(lastSetValue, setAttr) {
        if (lastSetValue) return lastSetValue;

        this.attr('subsystem').GetKitInformation()
          .then(({ kitInfo }) => setAttr(new CanList(kitInfo)))
          .catch(Errors.log);

        return undefined;
      },
    },
    /**
     * @property {Number} mispairedDeviceCount
     * @parent i2web/pages/kit-activate
     * @description The number of mispaired devices
     */
    mispairedDeviceCount: {
      get() {
        const pairingDevices = this.attr('pairingDevices');
        if (pairingDevices) {
          const mispaired = pairingDevices.filter((d) => {
            const state = d.attr('pairdev:pairingState');
            return state === PairingDeviceCapability.PAIRINGSTATE_MISPAIRED
              || state === PairingDeviceCapability.PAIRINGSTATE_MISCONFIGURED;
          });
          return mispaired.length;
        }
        return 0;
      },
    },
    /**
     * @property {PairingDevice} pairingDevice
     * @parent i2web/pages/kit-activate
     * @description PairingDevice model; set when user clicks Customize on a
     * kit device
     */
    pairingDevice: {
      Type: PairingDevice,
      set(device) {
        this.attr('isFinishedCustomization', false);
        return device;
      },
    },
    /**
     * @property {PairingDevice.List} pairingDevices
     * @parent i2web/pages/kit-activate
     * @description The list of kitted pairing devices from the subsystem
     */
    pairingDevices: {
      get(lastSetValue, setAttr) {
        if (lastSetValue) return lastSetValue;

        // To observe changes for pairing devices added and removed
        this.attr('subsystem.subpairing:pairingDevices.length');

        // We depend on kitDevices to filter, but it is also asynchronous, so
        // we need to call again when we have kitDevices
        if (!this.attr('kitDevices')) return undefined;
        this.attr('subsystem').ListPairingDevices()
          .then(({ devices }) => {
            const kitDevices = this.attr('kitDevices');
            const kitted = devices.filter((d) => {
              const address = d['pairdev:protocolAddress'];
              return _find(kitDevices, { protocolAddress: address });
            });
            setAttr(new PairingDevice.List(kitted));
          })
          .catch(Errors.log);

        return undefined;
      },
    },
    /**
     * @property {string} pairingTitle
     * @parent i2web/pages/kit-activate
     * @description The title displayed on the page; updated as user steps
     * through kit device customization.
     */
    pairingTitle: {
      get(lastSetValue) {
        if (this.attr('isKitComplete')) {
          return 'Congrats';
        }

        const pairingDevice = this.attr('pairingDevice');
        if (!pairingDevice) {
          return 'Kit Setup';
        }

        // Customization components are responsible for setting the title
        return lastSetValue;
      },
    },
    /**
     * @property {Boolean} showExitPrompt
     * @parent i2web/pages/kit-activate
     * @description Indicates when the modal overlay prompt should show during exit
     */
    showExitPrompt: {
      type: 'boolean',
      value: 'false',
    },
    /**
     * @property {PairingSubsystem} subsystem
     * @parent i2ewb/pages/kit-activate
     * @description The pairing subsystem
     */
    subsystem: {
      get() {
        return getAppState().attr('subsystems').findByName('subpairing');
      },
    },
    /**
     * @property {Number} unactivatedDeviceCount
     * @parent i2web/pages/kit-activate
     * @description The number of unactivated devices
     */
    unactivatedDeviceCount: {
      get() {
        const pairingDevices = this.attr('pairingDevices');
        if (pairingDevices) {
          const unactivated = pairingDevices.filter((d) => {
            return d.attr('pairdev:pairingState')
              === PairingDeviceCapability.PAIRINGSTATE_PAIRING;
          });
          return unactivated.length;
        }
        return 0;
      },
    },
    /**
     * @property {Number} uncustomizedDeviceCount
     * @parent i2web/pages/kit-activate
     * @description The number of uncustomized devices
     */
    uncustomizedDeviceCount: {
      get() {
        const pairingDevices = this.attr('pairingDevices');
        if (pairingDevices) {
          const uncustomized = pairingDevices.filter((d) => {
            const paired = d.attr('pairdev:pairingState')
              === PairingDeviceCapability.PAIRINGSTATE_PAIRED;
            const customized = d.attr('pairdev:customizations.length') !== 0;
            return paired && !customized;
          });
          return uncustomized.length;
        }
        return 0;
      },
    },
  },
  /**
   * @function confirmExit
   * @parent i2web/pages/kit-activate
   * @description When leaving kit-activation, check for unfinished items and prompt user if necessary before exiting
   */
  confirmExit() {
    if (this.attr('unactivatedDeviceCount') || this.attr('uncustomizedDeviceCount')) {
      this.attr('showExitPrompt', true);
    } else {
      this.routeToDashboard();
    }
  },
  /**
   * @function continueKitSetup
   * @parent i2web/pages/kit-activate
   * @description When exiting kit-activation, allow user to continue kit setup after exit prompt warning, if desired
   */
  continueKitSetup() {
    this.attr('showExitPrompt', false);
  },
  /**
   * @function routeToDashboard
   * @parent i2web/pages/kit-activate
   * @description Route the User to the dashboard upon exit
   */
  routeToDashboard() {
    canRoute.attr({ page: 'home', subpage: undefined, action: undefined });
  },
});

export default Component.extend({
  tag: 'arcus-pages-kit-activate',
  viewModel: ViewModel,
  view,
  events: {
    removed() {
      this.viewModel.attr('pairingDevices').forEach((p) => {
        if (p.attr('pairdev:pairingState') === PairingDeviceCapability.PAIRINGSTATE_PAIRED) {
          p.Dismiss().catch(Errors.log);
        }
      });
    },
  },
});
