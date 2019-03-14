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

import canViewModel from 'can-view-model';
import CanMap from 'can-map';
import $ from 'jquery';
import assert from 'chai';
import './profile';
import fixture from 'can-fixture/';
import F from 'funcunit';
import loginAndRender from 'i2web/test/util/loginAndRender';
import people from 'i2web/models/fixtures/data/person.json';
import places from 'i2web/models/fixtures/data/place/place.json';
import account from 'i2web/models/fixtures/data/account.json';
import getAppState from 'i2web/plugins/get-app-state';

let cleanupAfterRender;

const appScope = new CanMap({
  account: account[0],
});

// ViewModel unit tests
describe('i2web/components/settings/profile', function settings() {
  before(function before() {
    fixture.reset();
  });
  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-settings-profile {(person)}="person" {(place)}="place" {(account)}="account" />',
      scope: {
        person: people[0],
        place: places[0],
        account: account[0],
      },
      appScope,
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
      assert.lengthOf($('arcus-settings-profile'), 1, 'there is one component rendered');
    });

    it('renders more panels for account owners than non-owners', function ownersMorePanels(done) {
      const prePanelCount = F('arcus-settings-profile arcus-accordion-panel').size();
      getAppState().attr('account.account:owner', 'foo:bar:baz');

      setTimeout(() => {
        const postPanelCount = F('arcus-settings-profile arcus-accordion-panel').size();
        assert.notEqual(prePanelCount, postPanelCount);
        done();
      }, 0);
    });
  });

  describe('interactions', function interaction() {
    it('shall opt a user into marketing material when checked and opt out when unchecked', function optInMarketing(done) {
      const dateRightNow = Date.now();

      F('.radio-checkbox').click(() => {
        const vm = canViewModel($('arcus-settings-profile')[0]);
        assert.isAtLeast(vm.attr('person.person:consentOffersPromotions'), dateRightNow, 'consent to opt in set to a date');
        F('.radio-checkbox').click(() => {
          assert.equal(vm.attr('person.person:consentOffersPromotions'), 0, 'consent to opt in set to 0');
          done();
        });
      });
    });
  });
});
