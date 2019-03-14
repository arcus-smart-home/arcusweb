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
import fixture from 'can-fixture/';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './status';
import subsystems from 'i2web/models/fixtures/data/subsystem.json';
import Subsystem from 'i2web/models/subsystem';
import CanMap from 'can-map';

let cleanupAfterRender;
let app; // eslint-disable-line no-unused-vars
const _subsystems = new Subsystem.List(subsystems['bf8bf389-80d1-4dcd-9d9f-7d3d51ac5177'].subsystems);

describe('i2web/components/subsystem/care/status', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-subsystem-care-status {subsystem}="subsystem"/>',
      scope: {
        subsystem: new CanMap(_subsystems[7]),
      },
      appScope: {

      },
    }).then(({ cleanup, appState }) => {
      cleanupAfterRender = cleanup;
      app = appState;
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
    it('shall be rendered on the page', function isRendered() {
      assert.isAtLeast($('arcus-subsystem-care-status').children().length, 1, 'arcus-subsystem-care-status is rendered');
    });
  });
});
