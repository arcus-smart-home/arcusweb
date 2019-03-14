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
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Places from 'i2web/models/fixtures/data/place/place.json';
import People from 'i2web/models/fixtures/data/person.json';
import 'i2web/helpers/';
import './edit-contact-info';

describe('i2web/components/settings/people/edit-contact-info', function favorite() {
  describe('full access rendering', function rendering() {
    before(function before() {
      fixture.reset();
    });

    let cleanupAfterRender;
    const person = People[0];

    beforeEach(function beforeEach(done) {
      person[`web:role:${Places[0]['base:id']}`] = 'FULL_ACCESS';

      loginAndRender({
        renderTo: '#test-area',
        template: '<arcus-settings-people-edit-contact-info {(person)}="person" {place}="place" />',
        scope: {
          person,
          place: Places[0],
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

    it('shall be rendered on the page', function isRendered() {
      assert.lengthOf($('arcus-settings-people-edit-contact-info'), 1, 'arcus-settings-people-edit-contact-info is rendered');
    });

    it('shall include a "done" button', function doneButton() {
      assert.equal($('arcus-settings-people-edit-contact-info button:first').text(), 'Done', 'done button exists');
    });

    it('shall include a "remove person" button', function removePersonButton() {
      assert.lengthOf($('arcus-settings-people-edit-contact-info button.remove-person'), 1, 'remove person button included');
    });

    it('shall include a "Edit Contact Information" header', function editContactHeader() {
      assert.equal($('arcus-settings-people-edit-contact-info h3:first').text(), 'Edit Contact Information', 'edit contact information is rendered');
    });

    it('shall include the full name of the person in the text', function personName() {
      const personsName = `${person['person:firstName']} ${person['person:lastName']}`;
      const name = $('arcus-settings-people-edit-contact-info .panel-content p span:first').text();
      assert.equal(name, personsName, 'includes full name of person');
    });

    it('shall include the name of the place in the text', function placeName() {
      const placesName = Places[0]['place:name'];
      const name = $('arcus-settings-people-edit-contact-info .panel-content p span:last').text();
      assert.equal(name, placesName, 'includes name of place');
    });
  });

  describe('partial access rendering', function rendering() {
    before(function before() {
      fixture.reset();
    });

    let cleanupAfterRender;
    const person = People[0];

    beforeEach(function beforeEach(done) {
      person[`web:role:${Places[0]['base:id']}`] = 'HOBBIT';

      loginAndRender({
        renderTo: '#test-area',
        template: '<arcus-settings-people-edit-contact-info {(person)}="person" {place}="place" />',
        scope: {
          person,
          place: Places[0],
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

    it('shall be rendered on the page', function isRendered() {
      assert.lengthOf($('arcus-settings-people-edit-contact-info'), 1, 'arcus-settings-people-edit-contact-info is rendered');
    });

    it('shall include a "cancel" button', function doneButton() {
      assert.equal($('arcus-settings-people-edit-contact-info button:first').text(), 'Cancel', 'cancel button exists');
    });

    it('shall include a "remove person" button', function removePersonButton() {
      assert.lengthOf($('arcus-settings-people-edit-contact-info button.remove-person'), 1, 'remove person button included');
    });

    it('shall include a "Edit Guest Information" header', function editContactHeader() {
      assert.equal($('arcus-settings-people-edit-contact-info h3:first').text(), 'Edit Guest Information', 'edit guest information is rendered');
    });
  });
});
