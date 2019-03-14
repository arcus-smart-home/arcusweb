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
import canRoute from 'can-route';
import fixture from 'can-fixture/';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Place from 'i2web/models/place';
import './alarms';
import './notification-list/notification-list_test';
import './settings/settings_test';
import './status/status_test';

import Places from 'i2web/models/fixtures/data/place/place.json';

let cleanupAfterRender;

describe('i2web/components/subsystem/alarms', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    canRoute.attr({
      page: 'services',
      subpage: 'alarms',
    });
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-subsystem-alarms />',
      scope: {
      },
      appScope: {
        place: new Place(Places[0]),
      },
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  afterEach(function after(done) {
    cleanupAfterRender().then(() => {
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  describe('rendering', function rendering() {
    xit('shall be rendered on the page', function isRendered() {
      assert.lengthOf($('arcus-subsystem-alarms'), 1, 'arcus-subsystem-alarms is rendered');
    });
    xit('shall display the name of the place in the context bar', function placeName() {
      const name = Places[0]['place:name'];
      assert.equal($('#place-name').text().trim(), name, 'displays the place name');
    });
    xit('shall, by default, make Status active', function statusAction() {
      assert.ok($('.segment-btn button').first().hasClass('active'), 'status is active');
    });
  });
});
