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
import assert from 'chai';
import CanMap from 'can-map';
import CanList from 'can-list';
import F from 'funcunit';
import stache from 'can-stache';
import './alerts';

describe('i2web/components/subsystem/weather/alerts', function weatherAlerts() {
  // mock AppState to be used by the components
  const appState = new CanMap({
    devices: new CanList([
      new CanMap({
        'base:address': 'DRIV:dev:8206c650-6711-4c6f-93a1-652b154d127b',
        'dev:name': 'Halo Smart Labs Halo Plus',
        'noaa:lastalerttime': 1525213794913,
        'noaa:currentalert': 'TOR',
        'halo:devicestate': 'ALERT',
      }),
      new CanMap({
        'base:address': 'DRIV:dev:8206c650-6711-4c6f-93a1-652b154d127c',
        'dev:name': 'Halo Plus 2',
        'noaa:lastalerttime': 1525213794913,
        'noaa:currentalert': 'WSW',
        'halo:devicestate': 'ALERT',
      }),
    ]),
    subsystems: new CanMap({
      findByName() {
        return new CanMap({
          'subweather:weatherRadios': new CanList([
            'DRIV:dev:8206c650-6711-4c6f-93a1-652b154d127b',
            'DRIV:dev:8206c650-6711-4c6f-93a1-652b154d127c',
          ]),
        });
      },
    }),
    place: new CanMap({
      'place:addrCounty': 'Douglas',
      'place:state': 'KS',
    }),
  });

  describe('rendering all signaling devices', function rendering() {
    const template = stache(
      `<arcus-subsystem-weather-alerts {app-state}="appState"/>`,
    );

    beforeEach(function beforeEach(done) {
      $('#test-area').append(template({ appState }));
      F('arcus-subsystem-weather-alerts').exists(() => done());
    });

    afterEach(function afterEach() {
      $('#test-area').empty();
    });

    it('shall be rendered on the page', function isRendered() {
      assert.isAtLeast(
        $('arcus-subsystem-weather-alerts').length,
        1,
        'arcus-subsystem-weather-alerts is rendered',
      );
    });
  });
});
