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
import './settings';
import fixture from 'can-fixture/';
import loginAndRender from 'i2web/test/util/loginAndRender';
import people from 'i2web/models/fixtures/data/person.json';
import places from 'i2web/models/fixtures/data/place/place.json';
import account from 'i2web/models/fixtures/data/account.json';

let cleanupAfterRender;

// ViewModel unit tests
describe('i2web/pages/settings', function settings() {
  before(function before() {
    fixture.reset();
  });
  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-page-settings {(person)}="person" {(place)}="place" {(account)}="account" />',
      scope: {
        person: people[0],
        place: places[0],
        account: account[0],
      },
      appScope: {
      },
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      done();
    }).catch(() => {
      console.error(arguments);
    });
  });

  afterEach(function after(done) {
    cleanupAfterRender().then(() => {
      done();
    }).catch(() => {
      console.error(arguments);
    });
  });

  describe('rendering', function rendering() {
    it('shall be rendered on the page', function rendered() {
      assert.lengthOf($('arcus-page-settings'), 1, 'there is one component rendered');
    });
  });
});
