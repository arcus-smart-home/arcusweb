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
import canMap from 'can-map';
import 'can-map-define';
import Rule from 'i2web/models/rule';
import RuleTemplate from 'i2web/models/rule-template';
import SidePanel from 'i2web/plugins/side-panel';
import view from './my-list.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Rule.List} rules
     * @parent i2web/components/rules/my-list
     * @description The list of rules configured for the Place
     */
    rules: {
      Type: Rule.List,
      set(rules) {
        // Note: different browsers evaluate attributes in a different order (e.g. Edge vs Chrome).
        if (rules && this.attr('templates')) {
          this.setRulesTemplates(rules, this.attr('templates'));
        }
        return rules;
      },
    },
    /**
     * @property {RuleTemplate.List} templates
     * @parent i2web/components/rules/my-list
     * @description The list of rule templates for the currently selected place.
     */
    templates: {
      Type: RuleTemplate.List,
      set(templates) {
        if (templates && this.attr('rules')) {
          this.setRulesTemplates(this.attr('rules'), templates);
        }
        return templates;
      },
    },
  },
  /**
   * @function editRule
   * @param {Rule} rule The rule containing the rule template to render
   * @param {String} clickedProperty When a User clicks on a property in the rule description
   * it selects that property in the edit panel.
   */
  editRule(rule, clickedProperty) {
    const ruleTemplate = rule.attr('ruleTemplate');
    SidePanel.right('<arcus-rules-edit-panel {clicked-property}="clickedProperty" {rule}="rule" {rule-template}="ruleTemplate" />', {
      clickedProperty,
      rule,
      ruleTemplate,
    });
  },
  /**
   * @function setRuleTemplate
   * Finds the template that the Rule matches and sets it to a ruleTemplate
   * property on the Rule.
   * @param {Rule} rule The rule that needs a template
   */
  setRuleTemplate(rule, templates = this.attr('templates')) {
    const templateIndex = _.findIndex(templates, { 'base:id': rule.attr('rule:template') });
    rule.attr('ruleTemplate', (templateIndex > -1)
      ? templates.attr(templateIndex)
      : null);
  },
  /**
   * @function setRulesTemplates
   * Populates `rule:template` prop for given rules.
   * @param {Rule.List} rules The rules that need templates
   * @param {RuleTemplate} templates The templates
   */
  setRulesTemplates(rules, templates) {
    rules.each(rule => this.setRuleTemplate(rule, templates));
  },
});

export default Component.extend({
  tag: 'arcus-rules-my-list',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel.rules} change': function rulesChanged(__, ___, index, how, added) {
      if (how === 'add' && index.indexOf('.') === -1) {
        this.viewModel.setRuleTemplate(added[0]);
      }
    },
    'a.rule-item click': function ruleItemClick(element) {
      const $el = $(element);
      const ruleId = $el.parent().attr('id');
      this.viewModel.attr('rules').each((rule) => {
        if (rule.attr('base:id') === ruleId) {
          this.viewModel.editRule(rule, $el.attr('id'));
        }
      });
    },
    '.newProperty focus': function inputIsolate(el) {
      $(el).closest('.panel-list-container').addClass('is-isolating');
    },
    '.newProperty blur': function inputUnIsolate(el) {
      $(el).closest('.panel-list-container').delay(200).removeClass('is-isolating');
    },
  },
});
