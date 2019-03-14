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
import { ViewModel } from './offset-minutes';


describe('i2web/components/schedule/offset-minutes', function favorite() {
  describe('vm props', function vmProps() {
    let vm;
    beforeEach(function beforeEach() {
      vm = new ViewModel({ offsetMinutes: -5 });
    });
    it('shall set offsetMinutesAbs', function offsetMinutesAbs() {
      assert.equal(vm.attr('offsetMinutesAbs'), 5);
    });
    it('shall toggle offsetBefore', function offsetMinutesAbs() {
      assert.equal(vm.attr('offsetBefore'), true);
      vm.toggleOffsetBefore(null, false);
      assert.equal(vm.attr('offsetBefore'), false);
      assert.equal(vm.attr('offsetMinutes'), 5);
    });
  });
});
