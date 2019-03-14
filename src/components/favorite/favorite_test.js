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
import F from 'funcunit';
import assert from 'chai';
import canList from 'can-list';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Device from 'i2web/models/device';
import switches from 'i2web/models/fixtures/data/device/switches.json';
import './favorite';


let cleanupAfterRender;

describe('i2web/components/favorite', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-favorite {thing}="device" {display-property}="property" />',
      scope: {
        device: new Device(switches[2]),
        property: 'dev:name',
      },
      appScope: {
        notifications: new canList([]),
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
    it('shall be rendered on the page', function rendered() {
      assert.lengthOf($('arcus-favorite'), 1, 'there is one component rendered');
    });

    it('shall have the default color', function defaultColor() {
      assert.isOk($('arcus-favorite i').hasClass('default'), 'should have default class');
    });

    it('shall have the default icon', function defaultIcon() {
      assert.isOk($('arcus-favorite i').hasClass('icon-app-heart-2'), 'should have default icon');
    });
  });

  describe('interactions', function interactions() {
    it('shall, when clicked, change from default to active color',
    function toActiveColor(done) {
      F('arcus-favorite').click(() => {
        assert.isOk($('arcus-favorite i').hasClass('active'), 'should have the active color');
        assert.isNotOk($('arcus-favorite i').hasClass('default'), 'should not have default color');
        done();
      });
    });

    it('shall, when clicked, change from default to active icons',
    function toActiveIcon(done) {
      F('arcus-favorite').click(() => {
        assert.isOk($('arcus-favorite i').hasClass('icon-app-heart-1'), 'should have the active icon');
        assert.isNotOk($('arcus-favorite i').hasClass('icon-app-heart-2'), 'should not have default icon');
        done();
      });
    });

    it('shall, when active and clicked again, change from active to default color',
    function toDefaultColor(done) {
      F('arcus-favorite').click(() => {
        F('arcus-favorite').click(() => {
          assert.isOk($('arcus-favorite i').hasClass('default'), 'should have the default color');
          assert.isNotOk($('arcus-favorite i').hasClass('active'), 'should not have active color');
          done();
        });
      });
    });

    it('shall, when active and clicked again, change from active to default icon',
    function toDefaultColor(done) {
      F('arcus-favorite').click(() => {
        F('arcus-favorite').click(() => {
          assert.isOk($('arcus-favorite i').hasClass('icon-app-heart-2'), 'should have the default icon');
          assert.isNotOk($('arcus-favorite i').hasClass('icon-app-heart-1'), 'should not have active icon');
          done();
        });
      });
    });
  });
});
