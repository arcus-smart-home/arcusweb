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
import canMap from 'can-map';
import fixture from 'can-fixture/';
import F from 'funcunit';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './staged-progress';


let cleanupAfterRender;
const template = `
  <arcus-staged-progress {stages}="stages" {{stage}} {{#if inProgress}}in-progress{{/if}} />
`;
const scope = new canMap({});

describe('i2web/components/staged-progress', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template,
      scope,
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
      assert.isAtLeast($('arcus-staged-progress').children().length, 1, 'arcus-staged-progress is rendered');
    });
    it('shall show a stage in progress with in-progress attributes', function inProgress(done) {
      scope.attr({
        stage: 'select-plan',
        stages: [
          'select-plan',
          'create-login',
          'build-profile',
          'complete',
        ],
        inProgress: true,
      });
      F('#select-plan.is-started').exists(2000, () => done());
    });
    it('shall display the icon name for in-progress stages', function correctIcon(done) {
      scope.attr({
        stage: 'select-plan',
        stages: [
          'select-plan',
          'create-login',
          'build-profile',
          'complete',
        ],
        inProgress: true,
      });
      F('#select-plan.is-started').exists(() => {
        assert.isOk(F('#select-plan i').hasClass('icon-app-more-1'), 'has correct icon class');
        done();
      });
    });
    it('shall display the appropriate text for in-progress stages', function correctText(done) {
      scope.attr({
        stage: 'select-plan',
        stages: [
          'select-plan',
          'create-login',
          'build-profile',
          'complete',
        ],
        inProgress: true,
      });
      F('#select-plan.is-started').exists(() => {
        assert.isOk(F('#select-plan span').text() === 'In Progress', 'has the correct text');
        done();
      });
    });
    it('shall have checked icon for completed stages', function checkedIcon(done) {
      scope.attr({
        stage: 'select-plan',
        stages: [
          'select-plan',
          'create-login',
          'build-profile',
          'complete',
        ],
        inProgress: false,
      });
      F('#select-plan.is-started').exists(() => {
        assert.isOk(F('#select-plan i').hasClass('icon-app-check'), 'has correct icon class');
        done();
      });
    });
    it('shall display the appropriate text for completed stages', function correctText(done) {
      scope.attr({
        stage: 'select-plan',
        stages: [
          'select-plan',
          'create-login',
          'build-profile',
          'complete',
        ],
        inProgress: false,
      });
      F('#select-plan.is-started').exists(() => {
        assert.isOk(F('#select-plan span').text() === 'Complete', 'has the correct text');
        done();
      });
    });
    it('shall show previous stages to the current stage as completed', function showPreviousComplete(done) {
      scope.attr({
        stage: 'create-login',
        stages: [
          'select-plan',
          'create-login',
          'build-profile',
          'complete',
        ],
        inProgress: true,
      });
      F('#select-plan').exists(() => {
        assert.isOk(F('#select-plan i').hasClass('icon-app-check'), 'has correct icon class');
        assert.isOk(F('#select-plan span').text() === 'Complete', 'has the correct text');
        done();
      });
    });
  });
});
