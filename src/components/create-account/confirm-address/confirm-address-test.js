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
import $ from 'jquery';
import assert from 'chai';
import fixture from 'can-fixture/';
import loginAndRender from 'i2web/test/util/loginAndRender';
import CanMap from 'can-map';
import Place from 'i2web/models/place';
import PlaceData from 'i2web/models/fixtures/data/place/place.json';

import 'i2web/plugins/debug';
import 'i2web/components/create-account/confirm-address/';

let cleanupAfterRender;

const singleSuggestion = [{
  zip: '90210',
  line1: '455 N Rexford Dr',
  line2: 'Unit. 5, Basement',
  city: 'Beverly Hills',
  state: 'California',
}];

const suggestions = singleSuggestion.concat([{
  zip: '60048',
  line1: '1134 Pinetree Lane',
  line2: '',
  city: 'Libertyville',
  state: 'IL',
}]);

const place = new Place(PlaceData[3]);

const scope = new CanMap({
});
const appScope = new CanMap({
  supportNumber: '1-912-224-3303',
});

describe('i2web/components/create-account/confirm-address', function addressTest() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: `
        <arcus-create-account-confirm-address
          {^is-satisfied}="isSatisfied"
          {place}="place"
          {^selected-suggestion}="selectedSuggestion"
          {suggested-addresses}="suggestions"
        />`,
      scope,
      appScope,
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

  describe('address verification', function testDesc() {
    it('requires selection of a verified address to continue', function testFunc(done) {
      scope.attr('suggestions', suggestions);
      assert.isNotOk(scope.isSatisfied, 'component won\'t enable next step till selection occurs');
      F('.radio-wrapper:first-child label').click(() => {
        assert.exists(scope.selectedSuggestion, 'a suggestion is selected');
        assert.ok(scope.isSatisfied, 'components allows next step after selection');
        done();
      });
    });

    it('selects first suggested address if only a single suggestion is returned', function testFunc() {
      assert.notExists(scope.selectedSuggestion, 'a suggestion is not selected');
      scope.attr('suggestions', singleSuggestion);
      assert.exists(scope.selectedSuggestion, 'a suggestion is selected');
    });

    it('requires residential property confirmation to enable next button only if promon was selected', function testFunc(done) {
      scope.attr('suggestions', singleSuggestion);
      assert.equal($('input[name=promon-confirmation]').length, 0, 'Promon confirmation not always shown');
      scope.attr('place', place);
      assert.equal($('input[name=promon-confirmation]').length, 1, 'Promon confirmation shown when promon enabled');
      assert.notOk(scope.isSatisfied, 'Form not satisfied before promon confirmed.');
      F('label[for=promon-confirmation]').click(() => {
        assert.ok(scope.isSatisfied, 'Form satisfied after promon confirmed.');
        done();
      });
    });
  });
});
