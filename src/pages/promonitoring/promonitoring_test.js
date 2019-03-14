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
import Place from 'i2web/models/place';
import Person from 'i2web/models/person';
import Places from 'i2web/models/fixtures/data/place/place.json';
import Persons from 'i2web/models/fixtures/data/person.json';
import 'i2web/pages/promonitoring/';

let cleanupAfterRender;

function renderWithScope(scope, cb) {
  loginAndRender({
    renderTo: '#test-area',
    template: '<arcus-page-promonitoring {person}="person" {place}="place"/>',
    scope,
  }).then(({ cleanup }) => {
    cleanupAfterRender = cleanup;
    cb();
  }).catch(() => {
    console.error(arguments);
    cb();
  });
}

describe('i2web/pages/promonitoring', function promonitoring() {
  before(function before() {
    fixture.reset();
  });

  describe('initial render', function rendering() {
    beforeEach(function beforeEach(done) {
      renderWithScope({
        place: new Place(Places[0]),
        person: new Person(Persons[0]),
      }, done);
    });

    afterEach(function afterEach(done) {
      cleanupAfterRender().then(() => {
        done();
      }).catch(() => {
        console.error(arguments);
        done();
      });
    });
    it('shall be rendered on the page', function rendered() {
      assert.lengthOf($('arcus-page-promonitoring'), 1, 'there is one component rendered');
    });
  });
});
