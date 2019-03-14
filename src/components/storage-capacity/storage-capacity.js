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
import view from './storage-capacity.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} progressBarStyles
     * @parent i2web/components/subsystem/cameras/storage
     * @description The styles for the percentage of space used by clips at a place
     */
    progressBarStyles: {
      get() {
        if (this.attr('usedBytes') && this.attr('totalBytes')) {
          const percentage = (this.attr('usedBytes') / this.attr('totalBytes')) * 100;
          if (percentage > 0) return `width: ${Math.max(1, Math.ceil(percentage))}%; border-width: 1px;`;
        }
        return '';
      },
    },
    /**
     * @property {number} usedBytes
     * @parent i2web/components/storage-capacity
     * @description The number of bytes used by clips at a place, it should not render more than
     * the value of totalBytes
     */
    usedBytes: {
      type: 'number',
      value: 0,
      get(usedBytes) {
        return Math.min(usedBytes, this.attr('totalBytes'));
      },
    },
    /**
     * @property {number} totalBytes
     * @parent i2web/components/subsystem/cameras/storage
     * @description The total bytes available to be used by clips at a place
     */
    totalBytes: {
      type: 'number',
      value: 0,
    },
  },
    /**
   * @function convertBytesTo
   * @param {number} bytes The number of bytes to convert
   * @return {string}
   *
   * Given a number of bytes return the mega or gigabyte conversion, use 1 decimal
   * place if the number is a float
   */
  convertBytesTo(bytes) {
    const giga = bytes / (1024 * 1024 * 1024);
    const mega = bytes / (1024 * 1024);
    const unit = (giga < 1) ? 'MB' : 'GB';
    const converted = (giga < 1) ? mega : giga;
    return `${converted.toFixed(converted % 1 === 0 ? 0 : 1)} ${unit}`;
  },
});

export default Component.extend({
  tag: 'arcus-storage-capacity',
  viewModel: ViewModel,
  view,
});
