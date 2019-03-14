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
import assert from 'chai';
import CanMap from 'can-map';
import makeRender from 'i2web/test/util/renderTemplate';
import './water-heater.component';

describe('i2web/components/pairing/customize/water-heater', function waterHeater() {
  const container = '#test-area';
  const template = `
    <arcus-pairing-customize-water-heater
      {device}="device"
      {customization-step}="step"
      {^title}="title"
      {when-complete}="@customizationCompleted" />
  `;

  describe('with defaults', function missing() {
    const renderer = makeRender(container, template, new CanMap());

    before(function before() {
      renderer.render();
    });

    after(function after() {
      renderer.cleanupRender();
    });

    it('has sensible defaults', function defaults() {
      assert.match(
        $('.box-gray-radius > h4').html(),
        /Water Heater Assistance/,
      );
    });
  });
});
