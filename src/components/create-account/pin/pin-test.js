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
import './pin';

let cleanupAfterRender;
let scope;
const template = `
  <arcus-create-account-pin {^has-changes}="isSatisfied" {^@form-validates}="isValidForm"
    {(pin-code)}="pinCode"
  />
`;

const ViewModel = canMap.extend({
  isSatisfied: false,
});

describe('i2web/components/create-account/pin', function favorite() {
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
      assert.isAtLeast($('arcus-create-account-pin').children().length, 1, 'arcus-create-account-pin is rendered');
    });
  });
  describe('functional', function functional() {
    it('becomes satisfied when at least 1 digit has been entered', function isSatisfied(done) {
      F('input.pinCode').type('1', () => {
        assert.ok(scope.attr('isSatisfied'));
        done();
      });
    });
    it('shall be an invalid form without values entered for pin and confirm pin fields', function invalid(done) {
      F('input.pinCode').type('1[enter]', () => {
        const valid = scope.isValidForm();
        assert.isNotOk(valid, 'the form is not valid');
        done();
      });
    });
    it('shall be an invalid form when the pin is less than 4 digits', function lessThan4(done) {
      F('input.pinCode').type('123[tab]');
      F('input.confirmPinCode').type('123[enter]', () => {
        const valid = scope.isValidForm();
        assert.isNotOk(valid, 'the form is not valid');
        done();
      });
    });
    it('shall be an invalid form when the pin is not composed of ALL digits', function digits(done) {
      F('input.pinCode').type('123a[tab]');
      F('input.confirmPinCode').type('123a[enter]', () => {
        const valid = scope.isValidForm();
        assert.isNotOk(valid, 'the form is not valid');
        done();
      });
    });
    it('shall be a valid form when pin and confirm pin fields are entered and equal', function formValidates(done) {
      F('input.pinCode').type('1234[tab]');
      F('input.confirmPinCode').type('1234[enter]', () => {
        const valid = scope.isValidForm();
        assert.isOk(valid, 'the form is valid');
        done();
      });
    });
    it('shall export the entered PIN code to the parent component', function exportName(done) {
      F('input.pinCode').type('1234[tab]');
      F('input.confirmPinCode').type('1234[enter]', () => {
        const valid = scope.isValidForm();
        assert.isOk(valid, 'the form is valid');
        assert.equal(scope.attr('pinCode'), '1234');
        done();
      });
    });
  });
});
