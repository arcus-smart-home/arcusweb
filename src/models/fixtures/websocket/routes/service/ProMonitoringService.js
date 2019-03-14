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

import _ from 'lodash';
import routerUtils from '../../util';
import promonSettingsData from 'i2web/models/fixtures/data/pro-monitoring-settings.json';


export default {
  init() {
    const promonSettings = _.cloneDeep(promonSettingsData);

    return {
      address: 'SERV:promon',
      'promon:GetSettings': function promonGetSettings(params) {
        const placeId = params.place.split(':')[2];
        const placePromonSettings = _.find(promonSettings, ['base:id', placeId]);

        if (!placePromonSettings) {
          return routerUtils.requestDestinationNotFound(`SERV:promon:${placeId}`);
        }
        return {
          messageType: 'promon:GetSettingsResponse',
          attributes: {
            settings: placePromonSettings,
          },
        };
      },
    };
  },
};
