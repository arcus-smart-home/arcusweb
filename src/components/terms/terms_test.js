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
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Person from 'i2web/models/person';
import people from 'i2web/models/fixtures/data/person.json';
import userData from 'i2web/models/fixtures/data/user.json';
import './terms';

let cleanupAfterRender;
const session = new canMap(userData[0].session);

describe('i2web/components/terms', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-terms {person}="person" {(session)}="session" />',
      scope: {
        session,
        person: new Person(people[0]),
      },
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
      assert.lengthOf($('arcus-terms'), 1, 'arcus-terms is rendered');
    });
    it('does not initially show the modal window', function doesNotShow() {
      session.attr({
        requiresPrivacyPolicyConsent: false,
        requiresTermsAndConditionsConsent: false,
      });
      assert.lengthOf($('form.terms-and-conditions'), 0, 'terms-and-conditions form is rendered');
    });
    it('shows when privacy consent required', function showsPrivacy() {
      session.attr({
        requiresPrivacyPolicyConsent: true,
        requiresTermsAndConditionsConsent: false,
      });
      assert.lengthOf($('form.terms-and-conditions'), 1, 'terms-and-conditions form is rendered');
    });
    it('shows when terms consent required', function showsTerms() {
      session.attr({
        requiresPrivacyPolicyConsent: false,
        requiresTermsAndConditionsConsent: true,
      });
      assert.lengthOf($('form.terms-and-conditions'), 1, 'terms-and-conditions form is rendered');
    });
    it('shows when both terms and privacy consent required', function showsTermsAndPrivacy() {
      session.attr({
        requiresPrivacyPolicyConsent: true,
        requiresTermsAndConditionsConsent: false,
      });
      assert.lengthOf($('form.terms-and-conditions'), 1, 'terms-and-conditions form is rendered');
    });
  });
});
