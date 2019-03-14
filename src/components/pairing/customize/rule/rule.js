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
import CanMap from 'can-map';
import 'can-map-define';
import 'i2web/components/rules/edit-panel/';
import getAppState from 'i2web/plugins/get-app-state';
import view from './rule.stache';
import SidePanel from 'i2web/plugins/side-panel';
import RuleTemplate from 'i2web/models/rule-template';
import _find from 'lodash/find';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {String} title
     * @parent i2web/components/pairing/customize/rule
     * @description Header field from the customization step, to be displayed as the primary title
     */
    title: {
      value: 'Advanced Automation',
    },
    /**
     * @property {Array} description
     * @parent i2web/components/pairing/customize/rule
     * @description Description field from the customization step, to be displayed on screen
     */
    description: {
      get() {
        const step = this.attr('customizationStep');
        if (step && step.description && step.description.length > 0) {
          return step.description;
        }
        return ['Rules are a simple way to automate the control of devices based on things like temperature, presence, and/or the action of another device.'];
      },
    },
    /**
     * @property {String} subtitle
     * @parent i2web/components/pairing/customize/rule
     * @description Title field from the customization step, to be displayed in the
     * title area inside the box-gray-radius
     */
    subtitle: {
      get() {
        const step = this.attr('customizationStep');
        return step && step.title ? step.title : 'Add a Rule';
      },
    },
    /**
     * @property {Object} customizationStep
     * @parent i2web/components/pairing/customize/rule
     * @description Customization step that contains display text
     */
    customizationStep: {
      type: '*',
    },
    /**
     * @property {RuleTemplate.List} templates
     * @parent i2web/components/pairing/customize/rule
     * @description List of rule templates
     */
    templates: {
      Type: RuleTemplate.List,
      get() {
        const step = this.attr('customizationStep');
        if (step && step.choices) {
          const allTemplates = getAppState().attr('ruleTemplates');
          const templates = allTemplates.filter(template => _find(step.choices, (ruleId) => { return ruleId === template.attr('base:address'); }));
          return templates.length > 0 ? templates : undefined;
        }
        return undefined;
      },
    },
    /**
     * @property {Array} rules
     * @parent i2web/components/pairing/customize/rule
     * @description List of rules
     */
    rules: {
      type: '*',
    },
    /**
     * @property {Boolean} showSuggested
     * @parent i2web/components/pairing/customize/rule
     * @description Toggles the view for showing the list of rules or not.
     */
    showSuggested: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {*} whenComplete
     * @parent i2web/components/pairing/customize/rule
     * @description Callback when a given rule is added
     */
    whenComplete: {},
  },
  /**
   * @function addNewRule
   * @param {RuleTemplate} tmpl The template to display in the side panel
   * @description Render the arcus-rules-edit-panel component on the side panel
   */
  addNewRule(tmpl) {
    // set the selectedTemplate so that we can monitor when it is saved / changed and call whenComplete accordingly
    this.attr('selectedTemplate', tmpl);
    SidePanel.right('<arcus-rules-edit-panel {rule-template}="tmpl" />', {
      tmpl,
    });
  },
  /**
   * @function toggleSuggested
   * @description Toggles the state that controls if the rules list should be shown or not.
   */
  toggleSuggested() {
    this.attr('showSuggested', !this.attr('showSuggested'));
  },
  /**
   * @function isLastRule
   * @description Helper method that determines if the given index is of the last rule. Needed to add `no-border` class
   */
  isLastRule(index) {
    return this.attr('templates').length - 1 === index;
  },
});

export default Component.extend({
  tag: 'arcus-pairing-customize-rule',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel.selectedTemplate} changed': function ruleAdded() {
      const vm = this.viewModel;
      if (vm.attr('whenComplete')) {
        vm.attr('whenComplete')('RULES');
      }
    },
  },
});
