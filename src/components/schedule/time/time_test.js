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
import { ViewModel } from './time';


describe('i2web/components/schedule/time', function favorite() {
  describe('parsedTime', function parsedTime() {
    const vm = new ViewModel({ time: '16:31:00' });
    it('shall parse time string correctly', function itParsedTime() {
      assert.equal(vm.attr('hour'), 4);
      assert.equal(vm.attr('minuteTens'), 3);
      assert.equal(vm.attr('minuteOnes'), 1);
      assert.equal(vm.attr('isPM'), true);
    });
  });
});
