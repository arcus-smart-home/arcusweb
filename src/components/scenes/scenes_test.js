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
import { ViewModel as CardViewModel } from './card/';
import { ViewModel as IconViewModel } from './icon/';
import { ViewModel as PanelViewModel } from './list-panel/';

describe('i2web/components/scene', () => {
  it.skip('arcus-scenes-card needs tests', () => {
    const vm = new CardViewModel();
    assert.isObject(vm);
  });

  it.skip('arcus-scenes-icon needs tests', () => {
    const vm = new IconViewModel();
    assert.isObject(vm);
  });

  it.skip('arcus-scenes-list-panel needs tests', () => {
    const vm = new PanelViewModel();
    assert.isObject(vm);
  });
});
