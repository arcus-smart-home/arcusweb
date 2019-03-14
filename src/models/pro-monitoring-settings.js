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
 * @module {canMap} i2web/models/promon-settings Pro Monitoring Settings
 * @parent app.models
 *
 * Model of Pro Monitoring settings for a Place.
 */
import 'can-map-define';
import canList from 'can-list';
import makeCloneable from 'i2web/connections/cloneable';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';

const ALERT_NAME_MAP = {
  SECURITY: 'Security',
  PANIC: 'Panic',
  SMOKE: 'Smoke',
  CO: 'Carbon Monoxide (CO)',
};

const ProMonitoringSettings = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} i2web/models/promon.static.metadata metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/promon.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'promon',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  define: {
    'promon:alerts': {
      Type: canList,
      get() {
        const supportedAlerts = this.attr('promon:supportedAlerts');
        const monitoredAlerts = this.attr('promon:monitoredAlerts');
        const alerts = supportedAlerts.map((alert) => {
          return {
            name: ALERT_NAME_MAP[alert],
            isSelected: monitoredAlerts.indexOf(alert) !== -1,
          };
        });

        return alerts;
      },
    },
  },
});

export const ProMonitoringSettingsConnection = ModelConnection('promon', 'base:address', ProMonitoringSettings);
ProMonitoringSettings.connection = ProMonitoringSettingsConnection;
makeCloneable(ProMonitoringSettings);

export default ProMonitoringSettings;
