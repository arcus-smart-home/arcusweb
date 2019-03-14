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

/**
 * @module {canMap} i2web/models/hub Hub
 * @parent app.models
 *
 * Model of a hub.
 */
import 'can-map-define';
import 'can-construct-super';
import Cornea from 'i2web/cornea/';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import HubCapability from 'i2web/models/capability/Hub';
import HubNetworkCapability from 'i2web/models/capability/HubNetwork';
import HubPowerCapability from 'i2web/models/capability/HubPower';
import getAppState from 'i2web/plugins/get-app-state';
import Errors from 'i2web/plugins/errors';

const Hub = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} metadata i2web/models/hub.static.metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/hub.static
   *
   * Cornea connection metadata.
   * Note that destination address is different from other classes in that
   * namespace is at the end rather than in the middle of the address.
   */
  metadata: {
    namespace: 'hub',
    destination: 'SERV:{base:id}:{namespace}',
  },
}, {
  define: {
    /**
     * @property {string} web:icon:on
     *
     * Icon class indicating hub is online
     */
    'web:icon:on': {
      get() {
        return this.attr('hub:model') && this.attr('hub:model').includes('IH2')
          ? 'icon-platform-hub-1'
          : 'icon-platform-hub-v3-2';
      },
    },
    /**
     * @property {string} web:icon:on
     *
     * Icon class indicating hub is offline
     */
    'web:icon:off': {
      get() {
        return this.attr('hub:model') && this.attr('hub:model').includes('IH2')
          ? 'icon-platform-hub-2'
          : 'icon-platform-hub-v3-1';
      },
    },
    /**
     * @property {boolean} connectionType
     *
     * Human-readable display of how the Hub is connected to the network
     */
    connectionType: {
      get() {
        const type = this.attr('hubnet:type');
        if (this.attr('currentState') === HubCapability.STATE_DOWN) {
          return 'No Connection';
        }
        switch (type) {
          case HubNetworkCapability.TYPE_3G:
            return 'Cellular Backup';
          case HubNetworkCapability.TYPE_ETH:
            return 'Ethernet';
          case HubNetworkCapability.TYPE_WIFI:
            return 'Wi-Fi';
          default:
            return undefined;
        }
      },
    },
    /**
     * @property {boolean} isConnected4G
     *
     * Determines if the hub is currently connected via Cellular Backup.
     */
    isConnected4G: {
      get() {
        return this.attr('hubnet:type') === HubNetworkCapability.TYPE_3G;
      },
    },
    /**
     * @property {boolean} isConnectedEthernet
     *
     * Determines if the hub is currently connected via Ethernet.
     */
    isConnectedEthernet: {
      get() {
        return this.attr('hubnet:type') === HubNetworkCapability.TYPE_ETH;
      },
    },
    /**
     * @property {boolean} isConnectedWiFi
     *
     * Determines if the hub is currently connected via WiFi.
     */
    isConnectedWiFi: {
      get() {
        return this.attr('hubnet:type') === HubNetworkCapability.TYPE_WIFI;
      },
    },
    /**
     * @property {string} currentState
     *
     * Determines current state of hub; assumes hub is down or inaccessible
     * when hub object lacks the hub:state property.
     */
    currentState: {
      get() {
        const state = this.attr('hub:state');
        if (state) {
          return state;
        }
        return HubCapability.STATE_DOWN;
      },
    },
    /**
     * @property {boolean} isOffline
     *
     * Boolean to indicate if hub is offline and inaccessible.
     */
    isOffline: {
      get() {
        return this.attr('currentState') === HubCapability.STATE_DOWN;
      },
    },
    /**
     * @property {boolean} isBatteryLow
     *
     * Boolean to indicate if hub is currently on battery power and battery is low.
     */
    isBatteryLow: {
      get() {
        if (this.attr('hubpow:source') === HubPowerCapability.SOURCE_BATTERY) {
          return (this.attr('hubpow:Battery') <= 30);
        }
        return false;
      },
    },
  },
  init() {
    this._super(arguments);
    // when a hub receives a message that it had been deleted from the platform, remove it's reference from the app state
    this.one('base:Deleted', () => {
      const appState = getAppState();
      if (this === appState.attr('hub')) {
        appState.attr('hub', null);
      }
    });
  },
  /**
   * @function onUnpairedDeviceRemoved
   *
   * Event sent when an unpaired or unvetted device is removed from the hub.
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onUnpairedDeviceRemoved(callback) {
    Cornea.on('hub hubadv:UnpairedDeviceRemoved', callback);
  },
});

const idProp = 'base:address';

export const HubConnection = ModelConnection('hub', idProp, Hub);

/*
 * Fallback in case we ran into a timeout when we tried to load hub's full info during app initialization
 * Timeouts occur when the hub is disconnected but not yet "confirmed" as such.
 * On hub connect & disconnect events we try to re-fetch the full data.
 * TODO: replace this with a simpler repetitive request occuring after the initial timeout
 *       possibly delay app loading until Hub is completely loaded to avoid managing "paritally loaded" models
 *       or create a separate model for the incomplete hub
 *       why do we need this on hub connection events?
 * Issue: https://eyeris.atlassian.net/browse/ITWO-9243
 */
function completeHubLoading(data) {
  const id = data[idProp];
  const hub = HubConnection.instanceStore.get(id);

  if (hub && hub.attr('__halfFull')) {
    HubConnection.getData({
      'base:id': hub['base:id'],
    }).then((hubAttributes) => {
      hub.removeAttr('__halfFull');
      HubConnection.updateInstance(Object.assign({ 'base:address': id }, hubAttributes));
    }).catch(e => Errors.log(e, true));
  }
}

HubCapability.events.onHubConnected((data) => {
  const hubInstance = HubConnection.instanceStore.get(data[idProp]);

  // https://eyeris.atlassian.net/browse/I2-4790
  // We are now seeing onHubConnected events come from the platform before
  // base:Added events (where we previous observed the opposite). So if we get
  // onHubConnected before base:Added we should get the Hub from the place and
  // set it on AppState
  if (!hubInstance && !getAppState().attr('hub')) {
    getAppState().attr('place').GetHub().then(({ hub }) => {
      getAppState().attr('hub', hub);
    })
    .catch(e => Errors.log(e, true));
  }

  // if we got a connect event for a hub and we didn't previously have one,
  // add the new hub to the app state
  if (hubInstance && !getAppState().attr('hub')) {
    getAppState().attr('hub', hubInstance);
  }

  completeHubLoading(data);
});

HubCapability.events.onHubDisconnected(completeHubLoading);

export default Hub;
