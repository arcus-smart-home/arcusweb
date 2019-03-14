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
import './edit-panel';
import canViewModel from 'can-view-model';

let cleanupAfterRender;

describe('i2web/components/schedule/edit-panel', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-schedule-edit-panel />',
      scope: {},
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
      assert.lengthOf($('arcus-schedule-edit-panel'), 1, 'arcus-schedule-edit-panel is rendered');
    });
  });

  describe('viewModel', function viewModel() {
    it('shall work with an invalid event', function invalidEvent() {
      const vm = canViewModel('arcus-schedule-edit-panel');
      vm.attr('event', { foo: 'bar' });
    });

    it('shall compute validModeSelected correctly', function invalidEvent() {
      const vm = canViewModel('arcus-schedule-edit-panel');

      vm.attr('configuration', {});
      assert.ok(vm.attr('validModeSelected'), 'valid mode selected if no modes are available');

      vm.attr('configuration').modes = {};
      assert.ok(vm.attr('validModeSelected'), 'valid mode selected if no mode options are available');

      vm.attr('configuration').modes = { options: ['FOO', 'BAR'] };
      assert.notOk(vm.attr('validModeSelected'), 'valid mode not selected if mode not set but configuration modes are');

      vm.attr('selectedMode', 'BAZ');
      assert.notOk(vm.attr('validModeSelected'), 'valid mode not selected if mode not in configuration modes');

      vm.attr('selectedMode', 'FOO');
      assert.ok(vm.attr('validModeSelected'), 'valid mode selected if mode in configuration modes');
    });

    it('shall compute canAddEvent correctly', function canAddEvent() {
      const vm = canViewModel('arcus-schedule-edit-panel');

      vm.attr('event', { attributes: {} });
      vm.attr('validModeSelected', true);
      assert.notOk(vm.attr('canAddEvent'), 'can not add an event if there is an event and validModeSelected is true');

      vm.attr('validModeSelected', false);
      assert.notOk(vm.attr('canAddEvent'), 'can not add an event if there is an event and validModeSelected is false');

      vm.removeAttr('event');
      assert.notOk(vm.attr('canAddEvent'), 'can not add an event if there is no event and validModeSelected is false');

      vm.attr('validModeSelected', true);
      assert.ok(vm.attr('canAddEvent'), 'can add an event if there is no event and validModeSelected is true');
    });
  });
});
