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
import 'can-map-define';
import Errors from 'i2web/plugins/errors';
import Hub from 'i2web/models/hub';
import Notifications from 'i2web/plugins/notifications';
import view from './remove.stache';

const ORPHAN_REMOVAL_TIMEOUT = 2 * 60 * 1000; // 2 minutes

// UnpairingRequest state
const SEARCH_STATUS = {
  unstarted: 'unstarted',
  pending: 'pending',
  finished: 'finished',
};

// the modal states
const STATES = {
  closed: 'closed',
  search: 'search',
  success: 'success',
  failure: 'failure',
};

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Hub} hub
     * @parent i2web/components/zwave-tools/remove
     *
     * The AppState's hub instance
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {string} mode
     * @parent i2web/components/zwave-tools/remove
     *
     * The curent mode of the UI, valid values defined in STATES
     */
    mode: {
      get() {
        const isOpen = this.attr('open');
        const searchStatus = this.attr('searchStatus');
        const numDevicesChanged = this.attr('numDevicesChanged');
        const unpairedDeviceRemoved = this.attr('unpairedDeviceRemoved');

        if (isOpen) {
          if (searchStatus !== SEARCH_STATUS.finished) {
            return STATES.search;
          }
          return (numDevicesChanged || unpairedDeviceRemoved)
            ? STATES.success
            : STATES.failure;
        }

        return STATES.closed;
      },
    },
    /**
     * @property {Boolean} numDevicesChanged
     * @parent i2web/components/zwave-tools/remove
     *
     * Whether hubzwave:numDevices changed
     */
    numDevicesChanged: {
      value: false,
    },
    /**
     * @property {boolean} open
     * @parent i2web/components/zwave-tools/remove
     *
     * Whether to show the modal, this is the component public API.
     */
    open: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} searchStatus
     * @parent i2web/components/zwave-tools/remove
     *
     * Whether the UnpairingRequest has started, is pending or finished.
     */
    searchStatus: {
      value: false,
    },
    /**
     * @property {Boolean} unpairedDeviceRemoved
     * @parent i2web/components/zwave-tools/remove
     *
     * Whether hubadv:UnpairedDeviceRemoved was received.
     */
    unpairedDeviceRemoved: {
      value: false,
    },
  },
  /**
   * @property {Function} cancelAfterFailure
   * @parent i2web/components/zwave-tools/remove
   *
   * Callback for the cancel button on the failure screen
   */
  cancelAfterFailure() {
    this.attr('open', false);
  },
  /**
   * @property {Function} cancelOrphanRemoval
   * @parent i2web/components/zwave-tools/remove
   *
   * Callback for the Cancel button on the search screen
   */
  cancelOrphanRemoval() {
    this.attr('hub').UnpairingRequest('STOP_UNPAIRING').catch(Errors.log);
    this.attr('open', false);
  },
  /**
   * @property {Function} done
   * @parent i2web/components/zwave-tools/remove
   *
   * Callback for the Done button on the success screen
   */
  done() {
    this.attr('open', false);
  },
  /**
   * @property {Function} done
   * @parent i2web/components/zwave-tools/remove
   *
   * Callback for the Keep Searching button on the failure screen
   */
  keepSearching() {
    this.startOrphanRemoval();
  },
  /**
   * @property {Function} startOrphanRemoval
   * @parent i2web/components/zwave-tools/remove
   *
   * Local helper to call UnpairingRequest in search mode
   */
  startOrphanRemoval() {
    const protocol = '';
    const protocolId = '';
    const force = false;

    // Setting `searchStatus` right away to avoid the delay
    // while the platform sends a hub:state change
    this.attr('searchStatus', SEARCH_STATUS.pending);

    return this.attr('hub').UnpairingRequest(
      'START_UNPAIRING',
      ORPHAN_REMOVAL_TIMEOUT,
      protocol,
      protocolId,
      force,
    )
    .catch(() => {
      this.attr('searchStatus', SEARCH_STATUS.finished);
    });
  },
});

export default Component.extend({
  tag: 'arcus-zwave-tools-remove',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      this.viewModel.attr('hub').onUnpairedDeviceRemoved(() => {
        Notifications.success('A device was removed.');
        this.viewModel.attr('unpairedDeviceRemoved', true);
      });
      this.viewModel.startOrphanRemoval();
    },

    '{hub} hubzwave:numDevices': function numDevicesChanged() {
      Notifications.success('A device was removed.');
      this.viewModel.attr('numDevicesChanged', true);
    },

    '{hub} hub:state': function hubStateChaged(hub, evt, newState, oldState) {
      if (newState === 'UNPAIRING') {
        this.viewModel.attr('searchStatus', SEARCH_STATUS.pending);
      } else if (oldState === 'UNPAIRING' && newState === 'NORMAL') {
        this.viewModel.attr('searchStatus', SEARCH_STATUS.finished);
      }
    },
  },
});
