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
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import view from './panel.stache';
import Hub from 'i2web/models/hub';
import HubPowerCapability from 'i2web/models/capability/HubPower';
import Place from 'i2web/models/place';
import Analytics from 'i2web/plugins/analytics';
import AppState from 'i2web/plugins/get-app-state';
import SidePanel from 'i2web/plugins/side-panel';
import 'i2web/components/hub/configuration-panel/';
import 'i2web/components/hub/detail-panel/';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Boolean} batterPowered
     * @parent i2web/components/hub/panel
     *
     * Is the Hub currently plugged in or running on batteries?
     */
    batteryPowered: {
      get() {
        const hub = this.attr('hub');
        const powerSource = hub ? hub.attr('hubpow:source') : null;
        return powerSource === HubPowerCapability.SOURCE_BATTERY;
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/components/hub/panel
     *
     * The hub associated with the panel
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {String} iconClass
     * @parent i2web/components/hub/panel
     *
     * Sets the icon used based on the hub. Different icons for on and offline states
     */
    iconClass: {
      get() {
        const hub = this.attr('hub');

        if (hub) {
          switch (hub.attr('currentState')) {
            case Hub.STATE_DOWN:
              return hub.attr('web:icon:off');
            case Hub.STATE_PAIRING:
            case Hub.STATE_UNPAIRING:
            case Hub.STATE_NORMAL:
            default:
              return hub.attr('web:icon:on');
          }
        }
        return 'icon-platform-hub-2';
      },
    },
    /**
     * @property {String} hub
     * @parent i2web/components/hub/panel
     *
     * The model name associated with the hub
     */
    modelName: {
      get() {
        const hub = this.attr('hub');
        if (hub && hub.attr('hub:model')) {
          if (hub.attr('hub:model').startsWith('IH2')) {
            return AppState().attr(`products.${'dee000'}.product:name`);
          }
          if (hub.attr('hub:model').startsWith('IH3')) {
            return AppState().attr(`products.${'dee001'}.product:name`);
          }
        }
        return 'Unknown Model';
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/hub/panel
     *
     * Place in which the hub is located
     */
    place: {
      Type: Place,
    },
    /**
     * @property {String} stateClass
     * @parent i2web/components/hub/panel
     *
     * Sets outer div class for hub state
     */
    stateClass: {
      get() {
        const hub = this.attr('hub');
        const classes = [];

        if (hub) {
          switch (hub.attr('currentState')) {
            case Hub.STATE_DOWN:
              classes.push('offline');
              classes.push('warning');
              break;
            case Hub.STATE_PAIRING:
            case Hub.STATE_UNPAIRING:
            case Hub.STATE_NORMAL:
            default:
              break;
          }
          return classes.join(' ');
        }
        return '';
      },
    },
  },
  /**
   * @function toggleConfigurationPanel
   * @parent i2web/components/hub/panel
   *
   * Puts hub configuration information in the right side panel
   */
  toggleConfigurationPanel() {
    SidePanel.right('<arcus-hub-configuration-panel {hub}="hub"></arcus-hub-configuration-panel>', {
      hub: this.compute('hub'),
    });
  },
  /**
   * @function toggleDetailsPanel
   * @parent i2web/components/hub/panel
   *
   * Puts hub details information in the right side panel
   */
  toggleDetailsPanel() {
    const tagName = `devices.more`;
    Analytics.tag(tagName);
    SidePanel.right('<arcus-hub-detail-panel {place}="place" {hub}="hub"></arcus-hub-detail-panel>', {
      hub: this.compute('hub'),
      place: this.compute('place'),
    });
  },
});

export default Component.extend({
  tag: 'arcus-hub-panel',
  viewModel: ViewModel,
  view,
  events: {
    '.property focus': function inputIsolate(el) {
      $(el).closest('.panel-list-container').addClass('is-isolating');
    },
    '.property blur': function inputUnIsolate(el) {
      $(el).closest('.panel-list-container').delay(200).removeClass('is-isolating');
    },
  },
});
