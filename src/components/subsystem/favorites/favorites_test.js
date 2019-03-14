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
import fixture from 'can-fixture';
import canViewModel from 'can-view-model';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Devices from 'i2web/models/fixtures/data/device/lights.json';
import SceneData from 'i2web/models/fixtures/data/scene/scenes.json';
import './favorites';

let cleanupAfterRender;

describe('i2web/components/subsystem/favorites', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    const placeId = '3d496bfc-1098-493e-afd4-7f56c12dbef6';
    const scenes = SceneData[placeId].scenes;
    const devices = Devices;

    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-subsystem-card-favorites {devices}="devices" {scenes}="scenes" />',
      scope: {
        devices,
        scenes,
      },
      appScope: {

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
    it('shall be rendered on the page', function isRendered() {
      assert.lengthOf($('arcus-subsystem-card-favorites'), 1, 'arcus-subsystem-card-favorites is rendered');
    });

    describe('rendering all favorite devices', function renderingAll(done) {
      it('shall render an arcus-device-card for each favorite device on the place', function deviceCards() {
        canViewModel($('arcus-subsystem-card-favorites')[0]).bind('devices', () => {
          assert.lengthOf($('arcus-device-card'), 1, 'there was 1 favorite device rendered');
          done();
        });
      });

      it('shall render a heading with total favorites count', function deviceCards() {
        canViewModel($('arcus-subsystem-card-favorites')[0]).bind('devices', () => {
          assert.equal($('.favorites-count').text(), '3 Total');
          done();
        });
      });
    });
  });
});
