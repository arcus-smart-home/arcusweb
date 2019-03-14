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
import canList from 'can-list';
import 'can-map-define';
import template from './favorites.stache';
import Device from 'i2web/models/device';
import Place from 'i2web/models/place';
import Scene from 'i2web/models/scene';
import AppState from 'i2web/plugins/get-app-state';
import { deviceNameSorter, sceneNameSorter } from 'i2web/plugins/sorters';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device.List} devices
     * @parent i2web/components/subsystem/favorites
     *
     * Device list
     */
    devices: {
      Type: Device.List,
    },
    /**
     * @property {Device.List} favoriteDevices
     * @parent i2web/components/subsystem/favorites
     *
     * List of the favorite devices that get displayed on the screen
     */
    favoriteDevices: {
      Type: Device.List,
      get() {
        return (this.attr('devices') || [])
          .filter(device => device.attr('isFavorite'))
          .sort(deviceNameSorter);
      },
    },
    /**
     * @property {Boolean} isOwner
     * @parent i2web/components/subsystem/favorites
     * @description Whether the currently logged in person is this place's account owner
     */
    isOwner: {
      type: 'boolean',
      get() {
        return AppState().attr('person.base:id') === AppState().attr('account.account:owner');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/favorites
     *
     * Place whose favorites are being shown
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Scene.List} scenes
     * @parent i2web/components/subsystem/favorites
     *
     * Scene list
     */
    scenes: {
      Type: Scene.List,
    },
    /**
     * @property {Scene.List} favoriteScenes
     * @parent i2web/components/subsystem/favorites
     *
     * List of the favorite scenes that get displayed on the screen
     */
    favoriteScenes: {
      Type: Scene.List,
      get() {
        return (this.attr('scenes') || [])
          .filter(scene => scene.attr('isFavorite'))
          .sort(sceneNameSorter);
      },
    },
    /**
     * @property {canList} favoriteThings
     * @parent i2web/components/subsystem/favorites
     *
     * List of the favorite devices and scenes that get displayed on the screen
     */
    favoriteThings: {
      type: canList,
      get() {
        return Array.from(this.attr('favoriteDevices')).concat(Array.from(this.attr('favoriteScenes')));
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-card-favorites',
  viewModel: ViewModel,
  template,
});
