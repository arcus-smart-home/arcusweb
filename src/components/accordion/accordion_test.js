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

import 'jquery';
import fixture from 'can-fixture/';
import assert from 'chai';
import canList from 'can-list';
import loginAndRender from 'i2web/test/util/loginAndRender';
import { ViewModel } from './accordion';

let cleanupAfterRender;

describe('i2web/components/accordion', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach() {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-accordion />',
      scope: {},
      appScope: {
        notifications: new canList([]),
      },
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
    }).catch(() => {
      console.error(arguments);
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

  it.skip('needs tests', () => {
    const vm = new ViewModel();
    assert.isObject(vm);
  });
});
