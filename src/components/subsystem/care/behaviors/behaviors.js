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
import _ from 'lodash';
import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import CareBehaviorConfig from 'config/care-behaviors.json';
import SidePanel from 'i2web/plugins/side-panel';
import Subsystem from 'i2web/models/subsystem';
import view from './behaviors.stache';

import './edit-panel/';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {List<Object} behaviorTemplates
     * @parent i2web/components/subsystem/care/behaviors
     * @description The behavior templates available to the Place's subsystem
     */
    behaviorTemplates: {
      Type: Array,
    },
    /**
     * @property {Array<Array<Object>>} partitionedTemplates
     * @parent i2web/components/subsystem/care/behaviors
     * @description Divide the templates into two collection, with and without
     * availableDevices
     */
    partitionedTemplates: {
      get(prevValue) {
        if (prevValue) return prevValue;
        const templates = this.attr('behaviorTemplates');
        if (templates.length) {
          return _.partition(templates, t => t.availableDevices.length > 0);
        }
        return [[], []];
      },
    },
    /**
     * @property {Array<Object>} satisfiedTemplates
     * @parent i2web/components/subsystem/care/behaviors
     * @description Templates that have at least one active device
     */
    satisfiedTemplates: {
      get() {
        const [satisfied] = this.attr('partitionedTemplates');
        return satisfied;
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/behaviors
     * @description The associated subsystem, this should be a subsystem with
     * the subcare capability
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {*} transformTemplate
     * @parent i2web/components/subsystem/care/behaviors
     * @description Method to be invoked when the templates are listed and transformed
     *
     */
    transformTemplate: {
      type: '*',
    },
    /**
     * @property {Array<Object>} unsatisfiedTemplates
     * @parent i2web/components/subsystem/care/behaviors
     * @description Templates that have zero active devices
     */
    unsatisfiedTemplates: {
      get() {
        const [, unsatisfied] = this.attr('partitionedTemplates');
        return unsatisfied;
      },
    },
  },
  /**
   * @function newBehaviorFrom
   * @param {Object} template
   * @description Open side panel and display the care behavior edit panel
   */
  newBehaviorFrom(template) {
    const careBehavior = _.find(CareBehaviorConfig, (behavior) => {
      return behavior.templateId === template.id;
    });

    const attrs = '{care-behavior}="careBehavior" {subsystem}="subsystem" {template}="template"';
    SidePanel.right(`<arcus-subsystem-care-behaviors-edit-panel ${attrs} />`, {
      careBehavior,
      subsystem: this.compute('subsystem'),
      template,
    });
  },
  /**
   * @function showBehaviorExample
   * @param {Object} template
   * @description Open side panel and display read-only details for the unavailable template
   */
  showBehaviorExample(template) {
    const attrs = '{subsystem}="subsystem" {template}="template"';
    SidePanel.right(`<arcus-subsystem-care-behaviors-edit-panel ${attrs} />`, {
      subsystem: this.compute('subsystem'),
      template,
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-care-behaviors',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      setTimeout(() => $('html, body').scrollTop(0), 0);
    },
  },
});
