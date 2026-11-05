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

import 'mocha/mocha';
import assert from 'chai';
import sinon from 'sinon';
import fixture from 'can-fixture/';
import canMap from 'can-map';
import config from 'i2web/config';
import Errors from 'i2web/plugins/errors';
import addAppState from 'i2web/test/util/addAppState';
import switchDevices from 'i2web/models/fixtures/data/device/switches.json';
import Device from 'i2web/models/device';

const url = `POST ${config.apiUrl.replace(/\/$/, '')}/prodcat/GetProduct`;

// A product the startup GetProducts list leaves out (canbrowse=false), so the
// device has to fetch it on its own
const product = {
  'product:id': 'aa159b',
  'product:vendor': 'Springs Window Fashions',
  'product:name': 'Multichannel Remote',
  'product:shortName': 'Remote',
};

// Retries check until it stops throwing, then calls done
function eventually(check, done, tries = 50) {
  try {
    check();
    done();
  } catch (e) {
    if (tries <= 0) {
      done(e);
    } else {
      setTimeout(() => eventually(check, done, tries - 1), 20);
    }
  }
}

describe('i2web/models/device', function device() {
  let sandbox;
  let products;
  let cleanupAppState;

  before(function before() {
    fixture.on = true;
  });

  beforeEach(function beforeEach() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(Errors, 'log');
    products = new canMap({});
    cleanupAppState = addAppState({
      products,
      place: { 'base:address': 'SERV:place:test' },
    });
    fixture(url, (request, response) => {
      response(200, { payload: { attributes: { product } } });
    });
  });

  afterEach(function afterEach() {
    fixture(url, null);
    cleanupAppState();
    sandbox.restore();
  });

  // Each test gets its own address: the model reuses an existing instance with the
  // same address, which would keep the fixture's productId or an earlier test's product
  let deviceCount = 0;
  function newDevice() {
    deviceCount += 1;
    const id = `product-test-${deviceCount}`;
    return new Device(Object.assign({}, switchDevices[0], {
      'base:id': id,
      'base:address': `DRIV:dev:${id}`,
      'dev:productId': product['product:id'],
    }));
  }

  describe('product', function productTests() {
    it('shows the brand of a product it had to fetch', function bound(done) {
      const dev = newDevice();
      const names = [];
      // Bind the way a template does
      dev.bind('productName', (ev, name) => names.push(name));
      assert.isNull(dev.attr('productName'));

      eventually(() => {
        assert.deepEqual(names, ['Springs Window Fashions Remote']);
        assert.equal(dev.attr('product.product:vendor'), 'Springs Window Fashions');
        assert.isTrue(products.hasOwnProperty('aa159b'), 'the product is cached for other devices');
        assert.equal(Errors.log.args.map(args => String(args[0])).join('; '), '', 'nothing is logged');
      }, done);
    });

    it('caches a product read once without a binding and logs no error', function unbound(done) {
      const dev = newDevice();
      assert.isUndefined(dev.attr('product'));

      eventually(() => {
        assert.isTrue(products.hasOwnProperty('aa159b'));
        assert.equal(Errors.log.args.map(args => String(args[0])).join('; '), '', 'nothing is logged');
        assert.equal(dev.attr('productName'), 'Springs Window Fashions Remote');
      }, done);
    });
  });
});
