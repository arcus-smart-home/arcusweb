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
import './delete-account';
import canViewModel from 'can-view-model';

import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import accounts from 'i2web/models/fixtures/data/account.json';
import people from 'i2web/models/fixtures/data/person.json';


let cleanupAfterRender;
let vm = {};

describe('i2web/components/form/delete-account', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-form-delete-account />',
      scope: {
        account: new Account(accounts[0]),
        person: new Person(people[0]),
      },
      appScope: {

      },
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      vm = canViewModel($('arcus-form-delete-account')[0]);
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
    it('be rendered on the page', function isRendered() {
      assert.lengthOf($('arcus-form-delete-account'), 1, 'arcus-delete-account is rendered');
    });
  });
  describe('interaction', () => {
    it('when something other than "DELETE" is entered into the input field, show not show next confirmation field', function dontShowConfirm(done) {
      F('.delete').type('foo');
      F('#delete-submit').click(() => {
        assert.lengthOf($('#confirm-delete'), 0, 'should not show confirmation field');
        done();
      });
    });
    it('when "delete" is entered into the input field, show the next confirmation field', (done) => {
      F('.delete').type('delete');
      F('#delete-submit').click(() => {
        assert.lengthOf($('#confirm-delete'), 1, 'should show confirmation field');
        done();
      });
    });
    it('when "DELETE" is entered into the input field, show the next confirmation field', function showConfirmUpperCase(done) {
      F('.delete').type('DELETE');
      F('#delete-submit').click(() => {
        assert.lengthOf($('#confirm-delete'), 1, 'should show confirmation field');
        done();
      });
    });
    it('when "Yes" is entered into the input field, account is deleted', function showConfirmUpperCase(done) {
      F('.delete').type('delete');
      F('#delete-submit').click(() => {
        F('#confirm-delete').click(() => {
          assert.equal(vm.attr('person'), undefined, 'the person is undefined');
          assert.equal(vm.attr('account'), undefined, 'the account is undefined');
          done();
        });
      });
    });
  });
});
