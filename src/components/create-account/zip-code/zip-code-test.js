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
import './zip-code';


let cleanupAfterRender;
let scope;
const template = `
  <arcus-create-account-zip-code {^has-changes}="hasChanges" {^@form-validates}="isValidForm"
    {(zip-code)}="zipCode"
    {(state)}="state"
  />
`;

const ViewModel = canMap.extend({
  isSatisfied: false,
  zipCode: '',
  state: 'GA',
});

describe('i2web/components/create-account/zip-code', function acknowledge() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    scope = new ViewModel();
    loginAndRender({
      renderTo: '#test-area',
      template,
      scope,
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
      assert.isAtLeast($('arcus-create-account-zip-code').children().length, 1, 'arcus-create-account-zip-code is rendered');
    });
  });
  describe('functional', function functional() {
    it('becomes satisfied when at least 1 number has been entered', function isSatisfied(done) {
      F('input.zipCode').type('1', () => {
        assert.ok(scope.attr('hasChanges'));
        done();
      });
    });
    it('shall be an invalid form when less than 5 digits have been entered', function invalid(done) {
      F('input.zipCode').type('123d[enter]', () => {
        const valid = scope.isValidForm();
        assert.isNotOk(valid, 'the form is not valid');
        done();
      });
    });
    it('shall be a valid form when 5 digits have been entered', function formValidates(done) {
      F('input.zipCode').type('12345[enter]', () => {
        const valid = scope.isValidForm();
        assert.isOk(valid, 'the form is valid');
        done();
      });
    });
    it('shall export the entered zip code to the parent component', function exportZIP(done) {
      F('input.zipCode').type('12345[enter]', () => {
        const valid = scope.isValidForm();
        assert.isOk(valid, 'the form is valid');
        assert.equal(scope.attr('zipCode'), '12345');
        done();
      });
    });
  });
});
