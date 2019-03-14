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
import './storage-capacity';

let cleanupAfterRender;
const scope = new CanMap();

describe('i2web/components/storage-capacity', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-storage-capacity {used-bytes}="used" {total-bytes}="total" />',
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
      assert.lengthOf($('arcus-storage-capacity'), 1, 'arcus-storage-capacity is rendered');
    });
    it('shall default to 0 for used and total', function defaultsTo0() {
      assert.equal($('#used').text(), '0 MB', 'used defaults to 0 MB');
      assert.equal($('#total').text(), '0 MB', 'used defaults to 0 MB');
    });
    it('shall have a progress bar displaying the ratio', function ratioProgressBar() {
      scope.attr({
        used: 50 * 1024 * 1024,
        total: 100 * 1024 * 1024,
      });
      assert.equal($('.storage-usage').attr('style'), 'width: 50%; border-width: 1px;', 'displays ratio in progress bar');
    });
    it('shall be MB if bytes are less than 1 GB', function megaBytes() {
      scope.attr({
        used: 50 * 1024 * 1024,
        total: 100 * 1024 * 1024,
      });
      assert.equal($('#used').text(), '50 MB', 'used is MB if less than 1 GB');
      assert.equal($('#total').text(), '100 MB', 'total is MB if less than 1 GB');
    });
    it('shall be GB if bytes are greater than 0 GB', function megaBytes() {
      scope.attr({
        used: 50 * 1024 * 1024 * 1024,
        total: 100 * 1024 * 1024 * 1024,
      });
      assert.equal($('#used').text(), '50 GB', 'used is GB if greater than 0 GB');
      assert.equal($('#total').text(), '100 GB', 'total is GB if greater than 0 GB');
    });
    it('shall have 1 decimal place if not a whole number', function oneDecimalPlace() {
      scope.attr({
        used: (51 * 1024 * 1024) / 2,
        total: 100 * 1024 * 1024,
      });
      assert.equal($('#used').text(), '25.5 MB', 'used has 1 decimal place if not a whole number');
    });

    it('shall not render a higher used higher than total, even if a larger number is passed in', function largerUsed() {
      scope.attr({
        used: 150 * 1024 * 1024 * 1024,
        total: 100 * 1024 * 1024 * 1024,
      });
      assert.equal($('#used').text(), '100 GB', 'used is equal to 100 GB');
      assert.equal($('#total').text(), '100 GB', 'total is equal to 100 GB');
    });
  });
});
