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
import F from 'funcunit';
import fixture from 'can-fixture/';
import assert from 'chai';
import Subsystem from 'i2web/models/subsystem';
import SubsystemData from 'i2web/models/fixtures/data/subsystem.json';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './behaviors';

const subsystems = SubsystemData['3d496bfc-1098-493e-afd4-7f56c12dbef6'].subsystems;
const CareSubsystem = new Subsystem(subsystems.find(s => s['base:caps'].includes('subcare')));

let cleanupAfterRender;
let app; // eslint-disable-line no-unused-vars

describe('i2web/components/subsystem/care/behaviors', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-subsystem-care-behaviors {subsystem}="subsystem" />',
      scope: {
        subsystem: CareSubsystem,
      },
      appScope: {
        rightPanelContent: {},
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
    xit('shall be rendered on the page', function isRendered() {
      assert.isAtLeast($('arcus-subsystem-care-behaviors').children().length, 1, 'arcus-subsystem-care-behaviors is rendered');
    });
    xit('shall only render the templates that have devices', function hasDevices() {
      assert.lengthOf($('#satisfied-care-templates').children('.behavior-template'), 7, 'only behavior templates with devices');
    });
  });
  describe('interaction', function interaction() {
    xit('shall open side panel and render the edit panel when clicked', function sidePanelRendered(done) {
      F('div.behavior-template:first').click(() => {
        const content = app.attr('rightPanelContent');
        assert.ok(content.template, 'right panel includes component');
        assert.ok(content.attributes, 'right panel has attributes for component');
        done();
      });
    });
  });
});
