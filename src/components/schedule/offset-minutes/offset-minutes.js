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
import view from './offset-minutes.stache';

/**
 * @module i2web/components/schedule/offset-minutes
 * @parent i2web/components/schedule
 */

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Boolean} initializing
     * @parent i2web/components/schedule/offset-minutes
     * @description Whether we're initializing the component
     */
    initializing: {
      value: true,
    },
    /**
     * @property {Number} offsetMinutes
     * @parent i2web/components/schedule/offset-minutes
     * @description Whether the offsetMinutes represents before sunrise/set
     */
    offsetMinutes: {
      type: 'number',
      set(minutes) {
        // on initial set, need to determine the proper value of offsetBefore
        if (this.attr('initializing')) {
          this.attr('initializing', false);
          this.attr('offsetBefore', (minutes < 0));
        }
        return minutes;
      },
    },
    /**
     * @property {Number} offsetMinutesAbs
     * @parent i2web/components/schedule/offset-minutes
     * @description Display value for the offsetMinutes
     */
    offsetMinutesAbs: {
      type: 'number',
      set(newVal) {
        // convert the value back to offsetMinutes
        let newOffsetMinutes = newVal;
        if (newVal > 0 && this.attr('offsetBefore')) {
          newOffsetMinutes *= -1;
        }
        this.attr('offsetMinutes', newOffsetMinutes);
        return newVal;
      },
      get() {
        return Math.abs(this.attr('offsetMinutes'));
      },
    },
    /**
     * @property {Boolean} offsetBefore
     * @parent i2web/components/schedule/offset-minutes
     * @description Whether the offsetMinutes represents before sunrise/set
     */
    offsetBefore: {
      type: 'boolean',
    },
  },
  /**
   * @function toggleOffsetBefore
   * @parent i2web/components/schedule/offset-minutes
   * Toggles offsetBefore
   */
  toggleOffsetBefore(ev, value) {
    if (ev) {
      ev.preventDefault();
    }
    if (value === this.attr('offsetBefore')) return;
    this.attr('offsetBefore', value);

    // toggle the offsetMinutes value
    if (this.attr('offsetMinutes') !== 0) {
      this.attr('offsetMinutes', (-1 * this.attr('offsetMinutes')));
    }
  },
});

export default Component.extend({
  tag: 'arcus-offset-minutes',
  viewModel: ViewModel,
  view,
});
