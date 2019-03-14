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

import _ from 'lodash';
import Component from 'can-component/';
import canMap from 'can-map';
import 'can-map-define';
import view from './card.stache';
import Scene from 'i2web/models/scene';
import Notifications from 'i2web/plugins/notifications';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Scene} scene
     * @parent i2web/components/scenes/card
     *
     * The scene being displayed on the card
     */
    scene: {
      Type: Scene,
    },
    /**
     * @property {Boolean} isFiring
     * @parent i2web/components/scenes/card
     *
     * Indicates whether or not the scene is currently firing.
     */
    isFiring: {
      type: 'boolean',
      value: false,
    },
    /**
     * @function firingClass
     * @parent i2web/components/scenes/card
     *
     * Determines an appropriate CSS class for the icon
     * based on whether or not scene is currently firing.
     */
    firingClass: {
      get() {
        const fClass = !this.attr('isFiring')
          ? 'notFiring'
          : 'firing';
        return fClass;
      },
    },
  },
  /**
   * @function fireScene
   * @parent i2web/components/scenes/card
   *
   * Fire the scene
   */
  fireScene() {
    const scene = this.attr('scene');
    if (scene) {
      this.attr('isFiring', true);
      scene.Fire()
        .then(() => {
          this.attr('isFiring', false);
          Notifications.success(`'${_.truncate(scene.attr('scene:name'), { length: 51 })}' has run.`, scene.attr('icon').value);
        })
        .catch(() => {
          this.attr('isFiring', false);
        });
    }
  },
});

export default Component.extend({
  tag: 'arcus-scenes-card',
  viewModel: ViewModel,
  view,
});
