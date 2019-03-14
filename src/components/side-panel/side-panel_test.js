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

import assert from 'chai';
import renderTemplate from 'i2web/test/util/renderTemplate';
import $ from 'jquery';
import canMap from 'can-map';
import F from 'funcunit';
import './side-panel';

const template = '<arcus-side-panel class="is-left" {(content)}="content" />';
let data;
let render;
let cleanupRender;

describe('i2web/components/side-panel', function sidePanel() {
  beforeEach(function beforeEach() {
    data = new canMap({
      content: {},
    });
    ({ render, cleanupRender } = renderTemplate('#test-area', template, data));
    render();
  });

  afterEach(function afterEach() {
    data.attr('content', {});
    cleanupRender();
  });

  describe('rendering', function rendering() {
    it('shall be rendered on the page with no content', function rendered() {
      assert.lengthOf($('arcus-side-panel'), 1, 'there is one component rendered');
    });

    it('shall hide the panel container when there is no content', function hidePanelContainer() {
      assert.include($('arcus-side-panel > .panel-container').attr('class'), 'hidden', 'panel-container is hidden');
    });

    it('shall hide the panel-backdrop when there is no content', function hidePanelBackdrop() {
      assert.include($('arcus-side-panel > .panel-backdrop').attr('class'), 'hidden', 'panel-backdrop is hidden');
    });
  });

  describe('rendering a template argument', function templateRendering() {
    beforeEach(function beforeEach() {
      data.attr('content', {
        template: '<h3 id="message">{{message}}</h3>',
        attributes: {
          message: 'Hello Left Panel',
        },
      });
    });

    it('shall accept a template as a content.template property value', function renderContentTemplate() {
      assert.lengthOf($('arcus-side-panel > .panel-container').children(), 1, 'container now has 1 child');
    });

    it('shall NOT hide the panel container when there IS content', function hidePanelContainer() {
      assert.notInclude($('arcus-side-panel > .panel-container').attr('class'), 'hidden', 'panel-container is hidden');
    });

    it('shall NOT hide the panel-backdrop when there IS content', function hidePanelBackdrop() {
      assert.notInclude($('arcus-side-panel > .panel-backdrop').attr('class'), 'hidden', 'panel-backdrop is hidden');
    });
  });

  describe.skip('interactions', function interactions() {
    it('shall hide the side-panel when "{{closeButton}}" is inserted and clicked', function panelClose(done) {
      data.attr('content', {
        template: '{{close-button type="cancel"}}<h3 id="message">{{message}}</h3>',
        attributes: {
          message: 'Hello Left Panel',
        },
      });
      F('.btn-cancel').click(() => {
        F('arcus-side-panel').invisible(() => {
          F('arcus-side-panel > .panel-container').hasClass('hidden', 'panel-container is hidden');
          done();
        });
      });
    });
  });
});
