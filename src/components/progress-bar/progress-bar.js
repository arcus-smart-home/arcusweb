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
import view from './progress-bar.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} progressBarStyles
     * @parent i2web/components/progress-bar
     * @description The styles used to visually indicate the percentage complete
     */
    progressBarStyles: {
      get() {
        const percentage = this.attr('percentComplete');
        return (percentage > 0)
          ? `width: ${Math.max(1, Math.ceil(percentage))}%; border-width: 1px;`
          : '';
      },
    },
    /**
     * @property {Number} percentComplete
     * @parent i2web/components/progress-bar
     * @description The number representing percentage complete
     */
    percentComplete: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {String} unitText
     * @parent i2web/components/progress-bar
     * @description The text following the percentage value
     */
    unitText: {
      type: 'string',
      value: '% Complete',
    },
  },
});

export default Component.extend({
  tag: 'arcus-progress-bar',
  viewModel: ViewModel,
  view,
});
