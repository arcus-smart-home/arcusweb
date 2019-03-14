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
import canViewModel from 'can-view-model';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Places from 'i2web/models/fixtures/data/place/place.json';
import Place from 'i2web/models/place';
import './promonitoring-info';

let cleanupAfterRender;
const UsingPlace = new Place(Places[0]);
UsingPlace.attr('web:userOwnsPlace', true);

describe('i2web/components/settings/places/promonitoring-info', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-settings-places-promonitoring-info {place}="place" />',
      scope: {
        place: UsingPlace,
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
      assert.lengthOf($('arcus-settings-places-promonitoring-info'), 1, 'arcus-settings-places-promonitoring-info is rendered');
    });

    it('shall display the permit panel if permit is required', function permitNotRequired(done) {
      const viewModel = canViewModel('arcus-settings-places-promonitoring-info');
      viewModel.bind('promonitoringSettings', () => {
        viewModel.attr('permitRequired');
        assert.lengthOf($('#permit'), 1, 'permit panel needed');
        done();
      });
      viewModel.attr('place', Places[1]);
    });

    describe('print certificate rendering', function printCertRendering() {
      it('shall provide the ability to print promonitoring certificate', function printCert() {
        assert.lengthOf($('arcus-promonitoring-print-certificate'), 1, 'arcus-promonitoring-print-certificate is rendered');
      });

      it('shall include the id of the place in the certificate URL', function certURL() {
        const uuid = $('arcus-promonitoring-print-certificate a').attr('href').split('=')[1];
        assert.equal(UsingPlace['base:id'], uuid, 'the url contains the places id');
      });
    });
  });
});
