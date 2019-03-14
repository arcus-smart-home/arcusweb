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

import $ from 'jquery';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import canViewModel from 'can-view-model';
import { ViewModel as SegmentedRadialViewModel } from 'i2web/components/segmented-radial/';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {SegmentedRadialViewModel} parent
     * @parent i2web/components/segmented-radial/segment
     * @description The containing segmented-radial component
     */
    parent: {
      Type: SegmentedRadialViewModel,
    },
    /**
     * @property {boolean} state
     * @parent i2web/components/segmented-radial
     * @description State of the segment, also sets a default color.
     */
    state: {
      type: 'string',
      set(state) {
        switch (state) {
          // This color is used for Offline devices
          case 'alarming':
            this.attr('color', '#CE0F69');
            break;
          case 'ready':
            this.attr('color', '#26D07C');
            break;
          default:
            this.attr('color', '#cccccc');
            break;
        }
        return state;
      },
    },
    /**
     * @property {string} color
     * @parent i2web/components/segmented-radial
     * @description Color to be used for this segment
     */
    color: {
      type: 'string',
      value: '#cccccc',
    },
  },
});

export default Component.extend({
  tag: 'arcus-segmented-radial-segment',
  viewModel: ViewModel,
  events: {
    inserted() {
      const $el = $(this.element);
      this.viewModel.attr('element', this.element);
      const parentViewModel = canViewModel($el.closest('arcus-segmented-radial')[0]);
      parentViewModel.addSegment(this.viewModel);
      this.viewModel.attr('parent', parentViewModel);
    },
    '{element} beforeremove': function beforeRemove() {
      if (this.viewModel && this.viewModel.attr('parent')) {
        this.viewModel.attr('parent').removeSegment(this.viewModel);
      }
    },
  },
});
