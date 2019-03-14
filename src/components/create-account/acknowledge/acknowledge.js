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
import canMap from 'can-map';
import 'can-map-define';
import view from './acknowledge.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
    * @property {boolean} acknowledged
    * @parent i2web/components/create-account/acknowledge
    * @description Whether or not the user acknowledges they need to complete the following
    * steps to have their account be professionally monitored
    */
    acknowledged: {
      type: 'boolean',
    },
  },
});

export default Component.extend({
  tag: 'arcus-create-account-acknowledge',
  viewModel: ViewModel,
  view,
});
