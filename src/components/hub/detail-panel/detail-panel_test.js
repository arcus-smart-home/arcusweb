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
import renderTemplate from 'i2web/test/util/renderTemplate';
import { ViewModel } from './detail-panel';
import places from 'i2web/models/fixtures/data/place/place.json';
import hubs from 'i2web/models/fixtures/data/device/hub.json';
import Place from 'i2web/models/place';
import Hub from 'i2web/models/hub';
import $ from 'jquery';

const template = '<arcus-hub-detail-panel {(hub)}="hub" {place}="place"/>';
let vm;
let render;
let cleanupRender;

// ViewModel unit tests
describe('i2web/components/hub/detail-panel', () => {
  beforeEach(function before() {
    vm = new ViewModel({
      place: new Place(places[0]),
      hub: new Hub(Object.assign({ 'base:address': '123456' }, hubs[0])),
    });
    ({ render, cleanupRender } = renderTemplate('#test-area', template, vm));
    render();
  });
  afterEach(function after() {
    cleanupRender();
  });
  it('shall render on the page', () => {
    assert.equal($('arcus-hub-detail-panel').length, 1);
  });
  it('shall display correct hub information', () => {
    assert.include($('arcus-hub-detail-panel').text(), places[0]['place:name'], 'The display text contains the Place name');
    assert.include($('arcus-hub-detail-panel').text(), hubs[0]['hub:name'], 'The display text contains the Hub name');
    assert.include($('arcus-hub-detail-panel').text(), hubs[0]['hubadv:mfgInfo'], 'The display text contains the Manufacturer');
    assert.include($('arcus-hub-detail-panel').text(), hubs[0]['hub:model'], 'The display text contains the Model');
    assert.include($('arcus-hub-detail-panel').text(), hubs[0]['hub:id'], 'The display text contains the Hub ID');
    assert.include($('arcus-hub-detail-panel').text(), hubs[0]['hubadv:osver'], 'The display text contains the Firmware Version');
    assert.include($('arcus-hub-detail-panel').text(), hubs[0]['hubnet:ip'], 'The display text contains the IP Address');
  });
});
