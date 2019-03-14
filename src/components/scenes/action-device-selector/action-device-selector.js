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
import canCompute from 'can-compute';
import isEmptyObject from 'can-util/js/is-empty-object/';
import 'can-map-define';
import 'can-stache-converters';
import SceneDevice from 'i2web/models/sceneDevice';
import view from './action-device-selector.stache';
import '../device-configurator/';
import 'i2web/helpers/global';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {SceneDevice.List} sceneDevices
     * @parent i2web/scenes/action-device-selector
     *
     * List of sceneDevices to be rendered in the panel
     */
    sceneDevices: {
      Type: SceneDevice.List,
      set(sceneDevices) {
        sceneDevices.attr('comparator', 'device.dev:name');
        return sceneDevices;
      },
    },
    /**
     * @property {Map} context
     * @parent i2web/scenes/action-device-selector
     *
     * Context
     */
    context: {
      set(context, setVal) {
        setVal(context);
        if (context && typeof this.attr('template') !== 'undefined') {
          this.updateSceneDevices();
        }
      },
    },
    /**
     * @property {Map} template
     * @parent i2web/scenes/action-device-selector
     *
     * Template
     */
    template: {
      set(template, setVal) {
        setVal(template);
        if (template && typeof this.attr('context') !== 'undefined') {
          this.updateSceneDevices();
        }
      },
    },
  },
  /**
   * @function updateSceneDevices
   * @parent i2web/scenes/action-device-selector
   * @description Creates scene devices from a context + template
   */
  updateSceneDevices() {
    const sceneDevices = [];
    this.attr('template').attr('selectors').each((selectors, deviceAddress) => {
      // create a new sceneDevice
      const sceneDevice = new SceneDevice({
        deviceAddress,
        values: this.attr('context.context').attr(deviceAddress) || {},
        selectors,
      });
      sceneDevices.push(sceneDevice);

      // bind to the value change
      const valuesCompute = canCompute(() => sceneDevice.attr('values').serialize());
      valuesCompute.bind('change', (ev, newVal) => {
        if (isEmptyObject(newVal)) {
          this.attr('context.context').removeAttr(deviceAddress);
        } else {
          this.attr('context.context').attr(deviceAddress, newVal);
        }
      });
    });
    this.attr('sceneDevices', sceneDevices, true);
  },
});

export default Component.extend({
  tag: 'arcus-scenes-action-device-selector',
  viewModel: ViewModel,
  view,
});
