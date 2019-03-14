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
import 'i2web/helpers/global';
import view from './icon.stache';
import Scene from 'i2web/models/scene';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Scene} scene
     * @parent i2web/components/scenes/icon
     *
     * The scene related to this icon.
     */
    scene: {
      Type: Scene,
    },
    /**
     * @property {String} type
     * @parent i2web/components/scenes/icon
     *
     * What type of icon do we need. This is to compensate for when we have no
     * scene but we want a different default icon
     */
    type: {
      type: 'string',
    },
  },
});

export default Component.extend({
  tag: 'arcus-scenes-icon',
  viewModel: ViewModel,
  view,
});
