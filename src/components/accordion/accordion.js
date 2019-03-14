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
import canBatch from 'can-event/batch/';
import 'can-map-define';
import './panel/';
import view from './accordion.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {canList} panels
     * @parent i2web/components/accordion
     * @description When a panel is removed, DO NOT set the next one in the list
     * as active
     */
    noAutoActivate: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {canList} panels
     * @parent i2web/components/accordion
     * @description All of the panels on the page
     */
    panels: {
      value: [],
    },
  },
  /**
   *
   * @function addPanel
   * @param {} panel
   * @parent i2web/components/accordion
   * @description add panels to the view model
   */
  addPanel(panel) {
    this.attr('panels').push(panel);
    if (panel.attr('active')) {
      this.makeActive(panel);
    }
  },
  /**
   * @function removePanel
   * @param {} panel
   * @parent i2web/components/accordion
   * @description When a `<panel>` element is removed from the document,
   * it calls this method to remove the panel's scope from
   * the panels array.
   */
  removePanel(panel) {
    const panels = this.attr('panels');
    canBatch.start();
    panels.splice(panels.indexOf(panel), 1);
    // if the panel was active, make the first item active
    if (panel === this.attr('active')) {
      if (panels.length && !this.attr('noAutoActivate')) {
        this.attr('active', panels[0]);
        panels[0].attr('active', true);
      } else {
        this.removeAttr('active');
      }
    }
    canBatch.stop();
  },
  /**
   * @function makeActive
   * @param {} panel
   * @parent i2web/components/accordion
   * @description Make the panel active.
   */
  makeActive(panel, element) {
    this.attr('panels').each((thisPanel) => {
      thisPanel.attr('active', false);
    });
    panel.attr('active', panel !== this.attr('active'));

    if (this.onPanelActivation) {
      this.onPanelActivation(panel, $(element).closest('arcus-accordion-panel'));
    }

    this.attr('active', panel.attr('active') ? panel : null);
  },
  /**
   * @function isActive
   * @parent i2web/components/accordion
   * @param {} panel
   * @description Is the panel active
   * @return {Boolean}
   */
  // this is scope, not mustache
  // consider removing scope as arg
  isActive(panel) {
    return this.attr('active') === panel;
  },
});
export default Component.extend({
  tag: 'arcus-accordion',
  viewModel: ViewModel,
  view,
});
