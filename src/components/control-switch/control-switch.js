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
import uniqueId from 'i2web/plugins/unique-id';
import view from './control-switch.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Boolean} disabled
     * @parent i2web/components/control-switch
     *
     * whether the input checkbox is disabled
     */
    isDisabled: {
      value: false,
      type: 'boolean',
    },
    /**
     * @property {String} uniqueId
     * @parent i2web/components/control-switch
     *
     * a unique id for the thing that toggles
     */
    uniqueId: {
      type: 'string',
      value() {
        return uniqueId('control-switch');
      },
    },
    /**
     * @property {Boolean} isOn
     * @parent i2web/components/control-switch
     *
     * is the thing on?
     */
    isOn: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function toggle
   * @parent i2web/components/control-switch
   *
   * function that should be defined by the component trying use use the control switch
   */
  toggle() {
    throw new Error('toggle must be defined');
  },
});

export default Component.extend({
  tag: 'arcus-control-switch',
  viewModel: ViewModel,
  view,
  events: {
    // The toggle button triggers a click event on both the label and the input
    // Since the toggle method is hooked up to the input (which is clicked second),
    // no-op on the label click (and stop propagation)
    'label click': function labelClick(el, ev) {
      ev.stopImmediatePropagation();
    },
  },
});
