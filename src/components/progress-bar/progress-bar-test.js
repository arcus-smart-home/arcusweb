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

import CanMap from 'can-map';
import $ from 'jquery';
import fixture from 'can-fixture/';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './progress-bar';

let cleanupAfterRender;
const scope = new CanMap({
});

describe('i2web/components/progress-bar', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-progress-bar {percent-complete}="percent" />',
      scope,
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
      assert.lengthOf($('arcus-progress-bar'), 1, 'arcus-progress-bar is rendered');
    });
    it('shall default to 0 for used and total', function defaultsTo0() {
      assert.equal($('#used').text(), '0', 'used defaults to 0%');
    });
    it('shall have a progress bar displaying the ratio', function ratioProgressBar() {
      scope.attr({
        percent: 50,
      });
      assert.equal($('.progress-usage').attr('style'), 'width: 50%; border-width: 1px;', 'displays ratio in progress bar');
    });
  });
});
