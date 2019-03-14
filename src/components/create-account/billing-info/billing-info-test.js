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
import Person from 'i2web/models/person';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './billing-info';

let cleanupAfterRender;
let scope;
const template = `
  <arcus-create-account-billing-info {^has-changes}="isSatisfied" {^@form-validates}="isValidForm"
    {^card-number}="billingInfo.number"
    {^cvv}="billingInfo.verification_value"
    {^exp-month}="billingInfo.month"
    {^exp-year}="billingInfo.year"
    {^first-name}="billingInfo.first_name"
    {^last-name}="billingInfo.last_name"
    {person}="person"
  />
`;

const ViewModel = canMap.extend({
  isSatisfied: false,
  billingInfo: {
    number: '',
    verification_value: '',
    month: '',
    year: '',
    first_name: '',
    last_name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal_code: '',
  },
  person: new Person({
    'base:caps': [
      'person',
      'base',
    ],
    'person:mobileNumber': '5555555555',
    'person:email': 'test@arcusopen.com',
    'base:id': '96fc8c89-5ee1-4c0a-8158-56fe4036b0bd',
    'base:address': 'SERV:person:96fc8c89-5ee1-4c0a-8158-56fe4036b0bd',
    'person:currPlace': '3d496bfc-1098-493e-afd4-7f56c12dbef6',
    'person:firstName': 'Arcus',
    'base:tags': [],
    'base:type': 'person',
    'person:placesWithPin': [
      '3d496bfc-1098-493e-afd4-7f56c12dbef6',
    ],
    'person:lastName': 'Tester',
  }),
});

describe('i2web/components/create-account/billing-info', function favorite() {
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
      assert.isAtLeast($('arcus-create-account-billing-info').children().length, 1, 'arcus-create-account-billing-info is rendered');
    });
  });
  describe('functional', function functional() {
    it('becomes satisfied when at least 1 character has been entered', function isSatisfied(done) {
      F('input.firstName').type('M', () => {
        assert.ok(scope.attr('isSatisfied'));
        done();
      });
    });
    it('shall be an invalid form without values entered for first and last name', function invalid(done) {
      F('input.firstName').type('M[enter]', () => {
        const valid = scope.isValidForm();
        assert.isNotOk(valid, 'the form is not valid');
        done();
      });
    });
  });
});
