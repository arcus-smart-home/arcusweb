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
import canMap from 'can-map';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './acknowledge';

let cleanupAfterRender;

const ViewModel = canMap.extend({
  isSatisfied: false,
});
let vm;

describe('i2web/components/create-account/acknowledge', function acknowledge() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    vm = new ViewModel();
    loginAndRender({
      renderTo: '#test-area',
      template: `
        <arcus-create-account-acknowledge {^acknowledged}="isSatisfied" />
      `,
      scope: vm,
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
      assert.isAtLeast($('arcus-create-account-acknowledge').children().length, 1, 'arcus-create-account-acknowledge is rendered');
    });

    it('becomes satisfied when checkbox is clicked', (done) => {
      F('input[type="checkbox"]').click(() => {
        assert.ok(vm.attr('isSatisfied'));
        done();
      });
    });
  });
});
