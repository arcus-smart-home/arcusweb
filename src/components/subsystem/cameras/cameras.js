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
import canRoute from 'can-route';
import 'can-map-define';
import AppState from 'i2web/plugins/get-app-state';
import Subsystem from 'i2web/models/subsystem';
import view from './cameras.stache';
import _ from 'lodash';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} activeDisplay
     * @parent i2web/components/subsystem/cameras
     * @description The active display of the cameras page
     */
    activeDisplay: {
      get() {
        const subpage = canRoute.attr('subpage');
        const page = canRoute.attr('page');
        const action = canRoute.attr('action');
        const defaultAction = 'status';
        const validPages = [defaultAction, 'clips', 'storage'];
        if (page === 'services' && subpage === 'cameras' && validPages.indexOf(action) === -1) {
          canRoute.attr('action', defaultAction);
          return defaultAction;
        }
        return action || defaultAction;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/cameras
     * @description Where the displayed camera information is configured
     */
    place: {
      get() {
        return AppState().attr('place');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/cameras
     * @description The cameras subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function changeCameraDisplay
   * @parent i2web/pages/cameras
   * @param {string} to Which content to display.
   * @description Click handlers to change the settings subpage
   */
  changeCameraDisplay(to) {
    canRoute.attr('action', to);
  },
  /**
   * @function cameraDisplayedIs
   * @parent i2web/pages/cameras
   * @param {string} display Which content is currently displayed.
   * @return {string}
   * @description Used to indictate which button is active, will render 'active' or ''
   */
  cameraDisplayedIs(display) {
    return this.attr('activeDisplay') === display;
  },
  /**
   * @function {string} cameraNameFromID
   * @parent i2web/components/subsystem/cameras/status
   * @param {string} id The UUID of the camera
   * @description Return the camera name of the ID provided
   */
  cameraNameFromID(id) {
    let camera;
    if (id) {
      const idType = (id.indexOf('DRIV:dev') !== -1 ? 'base:address' : 'base:id');
      camera = _.find(this.attr('subsystem.web:subcameras:cameras') || [], c => c.attr(idType) === id);
    }
    return (camera && camera.attr('dev:name')) || 'Unknown Camera';
  },
  /**
   * @function routeToDashboard
   * @description redirects the user to the Dashboard page
   */
  routeToDashboard() {
    canRoute.attr({
      page: 'home',
      subpage: '',
      action: '',
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-cameras',
  viewModel: ViewModel,
  view,
});
