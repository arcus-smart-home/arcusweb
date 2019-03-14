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
import loginAndRender from 'i2web/test/util/loginAndRender';
import './tooltip';
import 'i2web/app.less';

let cleanupAfterRender;

describe('i2web/components/tooltip', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: `<div class="tooltip-demo">
        <div class="other-text">Some example text</div>
        <button class="btn tooltip-trigger" type="button">Hover this for tooltip</button>
        <arcus-tooltip>This is a tooltip!</arcus-tooltip>
      </div>`,
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
      assert.lengthOf($('arcus-tooltip'), 1, 'arcus-tooltip is rendered');
    });
    it('is hidden initially', function isHiddenInitially() {
      assert.equal($('arcus-tooltip').css('visibility'), 'hidden', 'arcus-tooltip is hidden');
    });
  });

  describe('interaction', function interaction() {
    it.skip('shows the tooltip on mouseover', function mouseOver(done) {
      $('.tooltip-demo').width(300);
      F('.other-text').move({
        to: '.tooltip-trigger',
        duration: 100,
      });
      assert.equal($('arcus-tooltip').css('visibility'), 'visible', 'arcus-tooltip is visible');
      done();
    });
  });
});
