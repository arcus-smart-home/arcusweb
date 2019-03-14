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
import CanList from 'can-list';
import CanMap from 'can-map';
import assert from 'chai';
import Subsystem from 'i2web/models/subsystem';
import SubsystemData from 'i2web/models/fixtures/data/subsystem.json';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './active';

const subsystems = SubsystemData['3d496bfc-1098-493e-afd4-7f56c12dbef6'].subsystems;
const CareSubsystem = new Subsystem(subsystems.find(s => s['base:caps'].includes('subcare')));

let cleanupAfterRender;

let app; // eslint-disable-line no-unused-vars
const scope = new CanMap({
  subsystem: CareSubsystem,
});

const active = new CanList([
  'fe113441-d6f7-4a07-8f0e-d89b75aa502e',
  'eb003210-1c51-41fe-9a53-19c4eeb2c097',
  '9d306c5c-0485-4ede-835b-3b8f76014281',
  'c12b9c43-99a1-4b78-a3f5-5e31f49c0e25',
]);
const all = new CanList([
  'fe113441-d6f7-4a07-8f0e-d89b75aa502e',
  'eb003210-1c51-41fe-9a53-19c4eeb2c097',
  '9d306c5c-0485-4ede-835b-3b8f76014281',
  'c12b9c43-99a1-4b78-a3f5-5e31f49c0e25',
  'fa4ee2c8-bdef-49f6-8e90-7cf8fbfb1064',
  '60a72239-0c95-4884-9928-07ebd27f35f3',
  '2f4e108b-fcff-498e-ac94-409e731c548a',
]);

function noBehaviors() {
  CareSubsystem.attr('subcare:activeBehaviors').replace([]);
  CareSubsystem.attr('subcare:behaviors').replace([]);
}
function someActive() {
  CareSubsystem.attr('subcare:activeBehaviors').replace(active);
  CareSubsystem.attr('subcare:behaviors').replace(all);
}

describe('i2web/components/subsystem/care/status/active', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-subsystem-care-status-active {subsystem}="subsystem" />',
      scope,
      appScope: { },
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
      noBehaviors();
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  describe('rendering', function rendering() {
    it('shall be rendered on the page', function isRendered() {
      assert.isAtLeast($('arcus-subsystem-care-status-active').children().length, 1, 'arcus-subsystem-care-status-active is rendered');
    });
    it('shall display dotted circle when there are 0 behaviors', function off() {
      assert.lengthOf($('.segmented-radial-wrapper.empty'), 1, 'only 1 empty wrapper');
    });
    it('shall disable both ON and OFF buttons when there are 0 behaviors', function disable() {
      assert.ok($('#alarm-mode-on').hasClass('disabled'), 'ON is disabled');
      assert.ok($('#alarm-mode-off').hasClass('disabled'), 'OFF is disabled');
    });
    it('shall display active/total when alarmMode is "ON"', function on(done) {
      someActive();
      setTimeout(() => {
        assert.equal($('.segment-count').text().trim(), '4 /7', '4 out of 7 active');
        done();
      }, 0);
    });
  });
  describe('interaction', function interaction() {
    it('shall display "Off" in the center when alarmMode is "VISIT"', function visit(done) {
      F('#alarm-mode-off').click(() => {
        assert.equal($('h2.segment-count').text().trim(), 'Off', 'Displaying off');
        done();
      });
    });
    it('shall display active/total when turning alarmMode to "ON"', function turnOn(done) {
      someActive();
      F('#alarm-mode-off').click();
      F('#alarm-mode-on').click(() => {
        assert.equal($('.segment-count').text().trim(), '4 /7', '4 out of 7 active');
        done();
      });
    });
  });
});
