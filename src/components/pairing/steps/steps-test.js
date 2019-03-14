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
import CanMap from 'can-map';
import fixture from 'can-fixture/';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import { ViewModel } from './steps';

let cleanupAfterRender;

describe('i2web/components/pairing/steps viewmodel', function viewmodel() {
  it('computes title correctly', function title() {
    const p = new CanMap({
      'product:vendor': 'Arcus',
      'product:shortName': 'Care Pendant',
    });
    const vm = new ViewModel();
    vm.attr('product', p);
    assert.equal(vm.attr('title'), 'Arcus Care Pendant Pairing Steps');
  });

  it('prevents duplicate consecutive words in title', function duplicate() {
    const p = new CanMap({
      'product:vendor': 'Phillips Hue',
      'product:shortName': 'Hue Bridge',
    });
    const vm = new ViewModel();
    vm.attr('product', p);
    assert.equal(vm.attr('title'), 'Phillips Hue Bridge Pairing Steps');
  });
});

describe('i2web/components/pairing/steps', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-pairing-steps {message}="message" {config}="config" />',
      scope: {
        message: 'This is the arcus-pairing-steps component',
        config: {
          form: [],
          mode: 'HUB',
          steps: [{
            id: 'pair/pair1',
            info: null,
            instructions: [],
            linkText: null,
            linkUrl: null,
            order: 1,
            title: null,
          }],
          video: '',
        },
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
    cleanupAfterRender()
      .then(done)
      .catch(() => {
        console.error(arguments);
        done();
      });
  });

  describe('rendering', function rendering() {
    it('shall be rendered on the page', function isRendered() {
      assert.isAtLeast($('arcus-pairing-steps').children().length, 1, 'arcus-pairing-steps is rendered');
    });

    it('omits tutorial link if config.video is falsey', function video() {
      assert.notOk($('.tutorial i').length);
    });
  });
});
