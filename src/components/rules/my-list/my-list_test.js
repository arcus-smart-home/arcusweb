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
import './my-list';
import DescParser from 'i2web/models/rule-desc-parser';
import deviceData from 'i2web/models/fixtures/data/device';
import ruleData from 'i2web/models/fixtures/data/rule/rules.json';
import templateData from 'i2web/models/fixtures/data/rule/templates.json';

let cleanupAfterRender;

describe('i2web/components/rules/my-list', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    const placeId = '3d496bfc-1098-493e-afd4-7f56c12dbef6';
    const templates = templateData[placeId].ruleTemplates;
    const rules = ruleData[placeId].rules;

    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-rules-my-list {templates}="templates" {rules}="rules" />',
      scope: {
        rules,
        templates,
      },
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
    it('shall be rendered on the page', function isRendered() {
      assert.lengthOf($('arcus-rules-my-list'), 1, 'arcus-rules-my-list is rendered');
    });
  });

  describe('functional', function functional() {
    describe('desc-parser', function descParser() {
      describe('renderItem', function renderItem() {
        it.skip('resolved', function resolved() {
          const result = DescParser.renderItem(true, 'button', deviceData[0]['dev:name']);
          assert(result.button === `<a class="rule-item">${deviceData[0]['dev:name']}</a>`);
        });

        it.skip('unresolved', function unresolved() {
          const result = DescParser.renderItem(false, 'button', 'Device');
          assert(result.button === `<a class="rule-item error">Device</a>`);
        });
      });

      describe('resolveDevice', function resolveDevice() {
        it.skip('resolved', function resolved(done) {
          const address = deviceData[0]['base:address'];
          DescParser.resolveDevice(address, 'button').then((device) => {
            assert(device.button === `<a class="rule-item">${deviceData[0]['dev:name']}</a>`);
            done();
          }).catch(() => {
            console.error(arguments);
            assert.ok(false);
            done();
          });
        });

        it.skip('unresolved', function unresolved(done) {
          DescParser.resolveDevice('000000-000', 'button').then((resolved) => {
            assert(resolved.button === `<a class="rule-item error">Device</a>`);
            done();
          }).catch(() => {
            console.error(arguments);
            assert.ok(false);
            done();
          });
        });
      });
    });
  });
});
