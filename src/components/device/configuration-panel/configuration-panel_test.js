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
import { ViewModel } from './configuration-panel';
import canMap from 'can-map';
import dimmerDevices from 'i2web/models/fixtures/data/device/dimmers.json';
import Device from 'i2web/models/device';
import $ from 'jquery';

const template = '<arcus-device-configuration-panel {(device)}="device" />';
let vm;
let render;
let cleanupRender;

// ViewModel unit tests
describe('i2web/components/device/arcus-device-configuration-panel', () => {
  beforeEach(function beforeEach() {
    addAppState({
      rightPanelContent: new canMap({}),
      page: 'services',
      subpage: 'lights-switches',
    });
    vm = new ViewModel({
      device: new Device(dimmerDevices[0]),
    });
    ({ render, cleanupRender } = renderTemplate('#test-area', template, vm));
    render();
  });
  afterEach(function afterEach() {
    cleanupRender();
  });
  it('shall render on the page', () => {
    assert.equal($('arcus-device-configuration-panel').length, 1);
  });
});
