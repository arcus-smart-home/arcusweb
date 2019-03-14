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
import canViewModel from 'can-view-model';
import F from 'funcunit';
import stache from 'can-stache';
import Place from 'i2web/models/place';
import places from 'i2web/models/fixtures/data/place/place.json';
import './hub';

describe('i2web/components/pairing/connect/hub', function favorite() {
  // account for the polling interval
  const timeout = 5 * 1000 * 2;
  this.timeout(timeout);

  before(function before() {
    // FuncUnit should fail before Mocha does
    F.timeout = timeout - 500;
  });

  after(function after() {
    F.timeout = 1900;
  });

  describe('already registered hub', function alreadyRegistered() {
    beforeEach(function beforeEach(done) {
      const place = new Place(places[0]);
      place.RegisterHubV2 = () => Promise.reject({
        code: 'error.register.alreadyregistered',
      });

      const template = stache(`
        <arcus-pairing-connect-hub {place}="place" {form-values}="formValues" />
      `);

      // wait for the component to show the hub id form
      $('#test-area').append(template({
        place,
        formValues: {
          'hub-id': 'LWD-2226',
        },
      }));
      F('#hub-id-entry').exists(() => done());
    });

    afterEach(function afterEach() {
      $('#test-area').empty();
    });

    it('changing the input value updates the data', function updates(done) {
      F('#hub-id-entry').type('LWS-4040[enter]');
      F('#hub-id-entry').val(/LWS-4040/, 'should have the right value');
      F('#hub-id-entry')
        .wait(
          function checkData() {
            const vm = canViewModel($('arcus-pairing-connect-hub').get(0));
            const formValues = vm.attr('formValues');
            return formValues['hub-id'] === 'LWS-4040';
          },
          'underlying data has to be updated',
        );
      F(() => done());
    });
  });
});
