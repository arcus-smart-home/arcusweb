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
import CanMap from 'can-map';
import Subsystem from 'i2web/models/subsystem';
import './cameras';

const scope = new CanMap({});
let cleanupAfterRender;

describe('i2web/components/subsystem/cameras', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-subsystem-cameras {subsystem}="subsystem" />',
      scope,
      appScope: {},
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
    it('shall be rendered on the page without a subsystem', function isRenderedWithoutSubsystem() {
      assert.lengthOf($('arcus-subsystem-cameras'), 1, 'arcus-subsystem-cameras is rendered');
    });
    it('shall be rendered on the page with a subsystem', function isRenderedWithSubsystem() {
      scope.attr('subsystem', new Subsystem({ 'base:id': '1234' }));
      assert.lengthOf($('arcus-subsystem-cameras'), 1, 'arcus-subsystem-cameras is rendered');
    });
  });
});
