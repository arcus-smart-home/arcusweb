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

import F from 'funcunit';
import fixture from 'can-fixture/';

fixture.on = true;

describe('i2web functional smoke test', function functionalSmokeTest() {
  beforeEach(function beforeEach() {
    F.open('../development.html');
  });

  describe('rendering', function rendering() {
    it('shall be render the login component on the page', function isRendered(done) {
      this.timeout(30 * 1000);
      F('.login-wrapper').visible(function loginPageVisible() {
        done();
      });
    });
  });
});
