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

import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import view from './cards.stache';

export const ViewModel = CanMap.extend({
  define: {
    message: {
      value: 'This is the arcus-preferences-cards component',
    },
    /**
     * @property {CanMap} preferences
     * @parent i2web/components/preferences/cards
     * @description The User preferences, used for dashboard card ordering,
     * hiding, and showing and hiding tutorials.
     */
    preferences: {
      Type: CanMap,
    },
  },
});

export default Component.extend({
  tag: 'arcus-preferences-cards',
  viewModel: ViewModel,
  view,
});
