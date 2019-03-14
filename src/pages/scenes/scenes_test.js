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
import SceneData from 'i2web/models/fixtures/data/scene/scenes.json';
import PlaceData from 'i2web/models/fixtures/data/place/place.json';
import Place from 'i2web/models/place';
import Scene from 'i2web/models/scene';
import './scenes';

let cleanupAfterRender;

describe('i2web/pages/scenes', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: ' <arcus-page-scenes {place}="place" {(scenes)}="scenes" />',
      scope: {
        place: new Place(PlaceData[0]),
        scenes: new Scene.List(SceneData['3d496bfc-1098-493e-afd4-7f56c12dbef6'].scenes),
      },
      appScope: {
        placeId: '3d496bfc-1098-493e-afd4-7f56c12dbef6',
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
    it('shall be rendered on the page', function isRendered() {
      assert.lengthOf($('arcus-page-scenes'), 1, 'arcus-page-scenes is rendered');
    });
  });
});
