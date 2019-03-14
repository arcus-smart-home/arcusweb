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

import F from 'funcunit';
import assert from 'chai';
import stache from 'can-stache';
import CanMap from 'can-map';

import 'i2web/plugins/debug';
import 'i2web/components/create-account/input-address/';

const fixtureEl = document.getElementById('test-area');
const template = stache(`
  <arcus-create-account-input-address
    {^has-changes}="isSatisfied"
    {^@form-validates}="validateForm"
    {(zip-code)}="zip"
    {(street-address)}="streetAddress"
    {(street-address-optional-line)}="unit"
    {(city)}="city"
    {(state)}="state"
  />
`);
const testAddress = {
  zip: '90210',
  streetAddress: '455 N Rexford Dr',
  city: 'Beverly Hills',
  state: 'California',
};
let currentVM = null;

describe('i2web/components/create-account/input-address', function addressTest() {
  beforeEach(() => {
    currentVM = new CanMap({ hasChanges: false, formValidates: null });
    fixtureEl.appendChild(template(currentVM));
  });

  afterEach(() => {
    fixtureEl.innerHTML = '';
    currentVM = null;
  });

  describe('address creation', function addressCreationTest() {
    xit('form is satisifed once any field has been modified', function buttonStateTest(done) {
      assert.isNotOk(currentVM.isSatisfied, 'isSatisfied is initially false');
      F('input.zipCode').type('9', () => {
        assert.isOk(currentVM.isSatisfied, 'isSatisfied is true after single field modification');
        done();
      });
    });

    xit('form is valid once once all fields (except unit field) are populated', function buttonStateTest(done) {
      assert.isNotOk(currentVM.validateForm(), 'Form isn\'t initially valid');

      F('input.zipCode').type(`${testAddress.zip}[enter]`, () => {
        assert.isNotOk(currentVM.validateForm(), 'Form isn\'t valid after single field entry.');

        F('input.streetAddress').type(`${testAddress.streetAddress}[enter]`, () => {
          F('input.city').type(`${testAddress.city}[enter]`, () => {
            F('input.state').type(`${testAddress.state}[enter]`, () => {
              assert.isOk(currentVM.validateForm(), 'Form is valid after address, zip, city & state entry.');
              done();
            });
          });
        });
      });
    });
  });
});
