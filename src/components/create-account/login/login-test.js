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
import './login';

let cleanupAfterRender;
let scope;
const template = `
  <arcus-create-account-login {^has-changes}="isSatisfied" {^@form-validates}="isValidForm"
    {(email-address)}="emailAddress"
    {(keep-up-to-date)}="keepUpToDate"
    {(password)}="password"
    {(phone-number)}="phoneNumber"
  />
`;

const ViewModel = canMap.extend({
  isSatisfied: false,
});

describe('i2web/components/create-account/login', function acknowledge() {
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
      assert.isAtLeast($('arcus-create-account-login').children().length, 1, 'arcus-create-account-login is rendered');
    });
  });
  describe('functional', function functional() {
    it('becomes satisfied when at least 1 character has been entered', function isSatisfied(done) {
      F('input.phoneNumber').type('3', () => {
        assert.ok(scope.attr('isSatisfied'));
        done();
      });
    });
    it('shall be an invalid form if phoneNumber is not a phone number', function invalid(done) {
      F('input.phoneNumber').type('3[enter]', () => {
        const valid = scope.isValidForm();
        assert.isNotOk(valid, 'the form is not invalid');
        done();
      });
    });
    it('shall be an invalid form if emailAddress is not a email address', function invalid(done) {
      F('input.emailAddress').type('notValid@[enter]', () => {
        const valid = scope.isValidForm();
        assert.isNotOk(valid, 'the form is not invalid');
        done();
      });
    });
    it('shall be an invalid form if password and confirmPassword dont match', function invalid(done) {
      F('input.phoneNumber').type('123-456-7890[tab]', () => {
        F('input.emailAddress').type('mm@arcusopen.com[tab]', () => {
          F('input.password').type('hello[tab]', () => {
            F('input.confirmPassword').type('world[enter]', () => {
              const valid = scope.isValidForm();
              assert.isNotOk(valid, 'the form is invalid');
              done();
            });
          });
        });
      });
    });
    it('shall be an invalid form if password is equal to email address', function invalid(done) {
      F('input.phoneNumber').type('123-456-7890[tab]', () => {
        F('input.emailAddress').type('mm@arcusopen.com[tab]', () => {
          F('input.password').type('mm@arcusopen.com[tab]', () => {
            F('input.confirmPassword').type('mm@arcusopen.com[enter]', () => {
              const valid = scope.isValidForm();
              assert.isNotOk(valid, 'the form is invalid');
              done();
            });
          });
        });
      });
    });
    it('shall be an invalid form if password is less than 8 characters', function invalid(done) {
      F('input.phoneNumber').type('123-456-7890[tab]', () => {
        F('input.emailAddress').type('mm@arcusopen.com[tab]', () => {
          F('input.password').type('hello[tab]', () => {
            F('input.confirmPassword').type('hello[enter]', () => {
              const valid = scope.isValidForm();
              assert.isNotOk(valid, 'the form is invalid');
              done();
            });
          });
        });
      });
    });
    xit('shall be an valid form if all fields validate', function invalid(done) {
      F('input.phoneNumber').type('9122243303', () => {
        F('input.emailAddress').type('mm@arcusopen.com', () => {
          F('input.password').type('1helloworld', () => {
            F('input.confirmPassword').type('1helloworld', () => {
              const valid = scope.isValidForm();
              assert.isOk(valid, 'the form is valid');
              done();
            });
          });
        });
      });
    });
    xit('shall export phone number, email address, password', function invalid(done) {
      F('input.phoneNumber').type('9122243303[tab]', () => {
        F('input.emailAddress').type('mm@arcusopen.com[tab]', () => {
          F('input.password').type('1helloworld[tab]', () => {
            F('input.confirmPassword').type('1helloworld[enter]', () => {
              const valid = scope.isValidForm();
              assert.isOk(valid, 'the form is valid');
              assert.equal(scope.attr('phoneNumber'), '(912) 224-3303');
              assert.equal(scope.attr('emailAddress'), 'mm@arcusopen.com');
              assert.equal(scope.attr('password'), '1helloworld');
              done();
            });
          });
        });
      });
    });
  });
});
