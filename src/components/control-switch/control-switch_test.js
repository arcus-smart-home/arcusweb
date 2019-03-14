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

import renderTemplate from 'i2web/test/util/renderTemplate';
import F from 'funcunit';
import assert from 'chai';
import { ViewModel } from './control-switch';
import canMap from 'can-map';
import $ from 'jquery';
import 'can-stache-converters';
import 'i2web/components/control-switch/';


const template = `<arcus-control-switch {is-on}="equal(checked, 'ON')" {toggle}="@toggleOnOff" />`;
const VM = canMap.extend({
  checked: 'OFF',
  toggleOnOff() {
    const newVal = (this.attr('checked') === 'ON') ? 'OFF' : 'ON';
    this.attr('checked', newVal);
  },
});

let vm;
let render;
let cleanupRender;

// ViewModel unit tests
describe('i2web/components/arcus-control-switch', () => {
  beforeEach(function beforeEach() {
    vm = new VM();
    ({ render, cleanupRender } = renderTemplate('#test-area', template, vm));
    render();
  });
  afterEach(function afterEach() {
    cleanupRender();
  });
  describe('instantiation', function instantiation() {
    it.skip('without values', function withoutValues() {
      assert.throws(new ViewModel({}), Error);
    });
  });

  describe('rendering', function rendering() {
    it('displays the default value of the state of the device', () => {
      assert.equal(false, $('arcus-control-switch input').is(':checked'), 'arcus-control-switch defaults to device state');
    });
    it('updates checked when device state is updated', () => {
      vm.attr('checked', 'ON');
      assert.equal(true, $('arcus-control-switch input').is(':checked'), 'arcus-control-switch defaults to checked');
      vm.attr('checked', 'OFF');
      assert.equal(false, $('arcus-control-switch input').is(':checked'), 'arcus-control-switch set to unchecked when device state switches');
    });
  });

  describe('interaction', function interaction() {
    it('updates device state when clicked', function testClick(done) {
      vm.attr('checked', 'ON');
      assert.equal(true, $('arcus-control-switch input').is(':checked'), 'arcus-control-switch defaults to checked');
      F('input').click(() => {
        assert.equal(false, $('arcus-control-switch input').is(':checked'), 'arcus-control-switch set to unchecked when clicking');
        done();
      });
    });
  });
});
