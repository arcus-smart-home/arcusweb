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
import addAppState from 'i2web/test/util/addAppState';
import renderTemplate from 'i2web/test/util/renderTemplate';
import { ViewModel } from './detail-panel';
import canMap from 'can-map';
import switchDevices from 'i2web/models/fixtures/data/device/switches.json';
import products from 'i2web/models/fixtures/data/product.json';
import Device from 'i2web/models/device';
import $ from 'jquery';
import moment from 'moment';

const template = '<arcus-device-detail-panel {(device)}="device" />';
let vm;
let render;
let cleanupRender;

const productsById = new canMap({});
products.forEach((product) => {
  productsById.attr(product['product:id'], product);
});
// ViewModel unit tests
describe('i2web/components/device/detail-panel', () => {
  beforeEach(function before() {
    addAppState({
      products: productsById,
    });
    vm = new ViewModel({
      device: new Device(switchDevices[0]),
    });
    ({ render, cleanupRender } = renderTemplate('#test-area', template, vm));
    render();
  });
  afterEach(function after() {
    cleanupRender();
  });
  it('shall render on the page', () => {
    assert.equal($('arcus-device-detail-panel').length, 1);
  });
  it('shall display correct device information', () => {
    assert.include($('arcus-device-detail-panel').text(), switchDevices[0]['dev:name'], 'The display text contains the device name');
    assert.include($('arcus-device-detail-panel').text(), `\n  ${moment(switchDevices[0]['devadv:added']).format('MMM DD YYYY')}`, 'The display text contains last paired');
  });
  it('shall display correct product information', () => {
    const product = productsById[switchDevices[0]['dev:productId']];
    assert.include($('arcus-device-detail-panel').text(), product['product:name'], 'The display text contains the product Id');
    assert.include($('arcus-device-detail-panel').text(), product['product:arcusModelId'], 'The display text contains the model id');
    assert.include($('arcus-device-detail-panel').text(), product['product:cert'], 'The display text contains the product certification');
    assert.include($('arcus-device-detail-panel').text(), product['product:protoFamily'], 'The display text contains the wireless info');
  });
});
