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
import canViewModel from 'can-view-model';
import 'can-map-define';
import 'can-stache-converters';
import view from './panel.stache';
import { ViewModel as AccordionViewModel } from 'i2web/components/accordion/accordion';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {AccordionViewModel} parent
     * @parent i2web/components/accordion/panel
     * @description The containing accordion
     */
    parent: {
      Type: AccordionViewModel,
    },
    /**
     * @property {String} action
     * @parent i2web/components/accordion/panel
     * @description Action name
     */
    action: {},
    /**
     * @property {Boolean} active
     * @parent i2web/components/accordion/panel
     * @description Determines if the panel is active (expanded) or not
     */
    active: {
      value: false,
      type: 'htmlbool',
    },
    /**
     * @property {Boolean} enabled
     * @parent i2web/components/accordion/panel
     * @description Determines if the panel can be expanded
     */
    enabled: {
      value: true,
      type: 'htmlbool',
      set(enabled) {
        // if the panel is disabled, also make it inactive
        if (!enabled) {
          this.attr('active', false);
        }
        return enabled;
      },
    },
    /**
     * @property {number} scrollTimeout
     * @parent i2web/components/accordion/panel
     * @description Timeout value for scroll animation
     */
    scrollTimeout: {
      type: 'number',
      value: 300,
    },
  },
});

export default Component.extend({
  tag: 'arcus-accordion-panel',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      const $el = $(this.element);
      const parentAccordionViewModel = canViewModel($el.closest('arcus-accordion')[0]);
      parentAccordionViewModel.addPanel(this.viewModel);
      this.viewModel.attr('parent', parentAccordionViewModel);
    },
    '{element} beforeremove': function beforeRemove() {
      if (this.viewModel && this.viewModel.attr('parent')) {
        this.viewModel.attr('parent').removePanel(this.viewModel);
      }
    },
  },
});
