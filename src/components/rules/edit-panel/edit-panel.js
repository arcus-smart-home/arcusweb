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
import _truncate from 'lodash/truncate';
import { FormEvents, FormComponent, FormViewModel } from 'i2web/components/form/';
import canMap from 'can-map';
import 'can-map-define';
import Analytics from 'i2web/plugins/analytics';
import AppState from 'i2web/plugins/get-app-state';
import Notifications from 'i2web/plugins/notifications';
import SidePanel from 'i2web/plugins/side-panel';
import Errors from 'i2web/plugins/errors';
import RuleDescParser, { isResolved } from 'i2web/models/rule-desc-parser';
import Rule from 'i2web/models/rule';
import RuleTemplate from 'i2web/models/rule-template';
import 'i2web/helpers/rules';
import view from './edit-panel.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/rules/edit-panel
     * @description Field constraints
     */
    constraints: {
      value: {
        ruleName: {
          presence: true,
        },
      },
    },
    /**
     * @property {canMap} availableSelectors
     * @parent i2web/components/rules/edit-panel
     * @description The list of possible values for each template argument
     */
    availableSelectors: {
      Type: canMap,
    },
    /**
     * @property {canMap} chosen
     * @parent i2web/components/rules/edit-panel
     * @description The key value pairs chosen by the User to satisfy this particular rule
     */
    chosen: {
      Type: canMap,
      Value: canMap,
    },
    /**
     * @property {string} clickedProperty
     * @parent i2web/components/rules/edit-panel
     * @description The id of the selectable property in the rule description
     */
    clickedProperty: {
      type: 'string',
    },
    /**
     * @property {string} description
     * @parent i2web/components/rules/edit-panel
     * @description The generated HTML description the User will used to edit the rule
     */
    description: {
      type: 'string',
      value: '',
      set(description) {
        if (description && this.attr('clickedProperty')) {
          setTimeout(() => {
            const $el = $(`button.selectable[id="${this.attr('clickedProperty')}"]`);
            if (!$el.hasClass('active')) {
              $(`button.selectable[id="${this.attr('clickedProperty')}"]`).click();
            }
          }, 0);
        }
        return description;
      },
    },
    /**
     * @property {string} ruleName
     * @parent i2web/components/rules/edit-panel
     * @description Name of the rule
     */
    ruleName: {
      get(ruleName) {
        if (ruleName !== undefined) return ruleName;
        return this.attr('rule.rule:name') || this.attr('ruleTemplate.ruletmpl:name');
      },
    },
    /**
     * @property {Rule} rule
     * @parent i2web/components/rules/edit-panel
     * @description The instance of the rule that is being edited
     */
    rule: {
      Type: Rule,
    },
    /**
     * @property {RuleTemplate} templates
     * @parent i2web/components/rules/edit-panel
     * @description The instance of a template that is being added/edited
     */
    ruleTemplate: {
      Type: RuleTemplate,
    },
    /**
     * @property {Boolean} saveable
     * @parent i2web/components/rules/saveable
     * @description Whether the rule can be saved (i.e. it has a description and the description
     * does not include an error button class).
     */
    saveable: {
      type: 'boolean',
      value: false,
      get() {
        const resolvable = !!this.attr('description') && isResolved(this.attr('description'));
        if (this.attr('ruleTemplate.ruletmpl:premium')) {
          return AppState().attr('place.isPremium') && resolvable;
        }
        return resolvable;
      },
    },
    /**
     * @property {Map} selectors
     * @parent i2web/components/rules/edit-panel
     * @description The list of current or potential values for each template argument
     */
    selectors: {
      Type: canMap,
      set(selectors) {
        const parseFn = (this.attr('rule'))
          ? RuleDescParser.parseForEditing
          : RuleDescParser.parseForAdding;
        parseFn(selectors, this.attr('ruleTemplate')).then((description) => {
          this.attr('description', description);
          $(`button.selectable[id="${this.attr('clickedProperty')}"]`).click();
        }).catch(e => Errors.log(e, true));
        return selectors;
      },
    },
    /**
     * @property {Map} selected
     * @parent i2web/components/rules/edit-panel
     * @description When the User clicks a template option, this is the available context
     * for that selector
     */
    selected: {
      Type: canMap,
    },
    /**
     * @property {Boolean} deletingRule
     * @parent i2web/components/rules/edit-panel
     * Whether the form is being deleted
     */
    deletingRule: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function startDelete
   *
   * Start the scene deleting process by allowing the deletion confirmation
   * to display
   */
  startDelete() {
    this.attr('deletingRule', true);
  },
  /**
   * @function cancelDelete
   *
   * Cancel the 'in-progress' delete scene action
   */
  cancelDelete() {
    this.attr('deletingRule', false);
  },
  /**
   * @function continueDelete
   * @param {Rule} rule The rule to delete
   * @description Delete the rule, and close the right side panel
   */
  continueDelete(rule) {
    Analytics.tag('rules.delete');
    rule.Delete()
    .then(() => {
      SidePanel.closeRight();
    })
    .catch((e) => {
      Errors.log(e, true);
    });
  },
  /**
   * @function saveRule
   * @description Save new or updated Rule to the platform
   */
  saveRule(vm, el, ev) {
    ev.preventDefault();

    if (this.formValidates()) {
      const chosen = this.attr('chosen').serialize();
      const closeEditPanel = () => SidePanel.closeRight();
      const name = this.attr('ruleName');

      if (this.attr('rule')) {
        const rule = this.attr('rule');
        rule.attr('rule:name', name);
        this.attr('saving', true);
        rule.save()
          .then(() => {
            this.attr('saving', false);
            return rule.UpdateContext(chosen);
          })
          .then(closeEditPanel)
          .catch((e) => {
            this.attr('saving', false);
            Errors.log(e, true);
          });
      } else {
        const unchosen = [];
        this.attr('availableSelectors').each((value, key) => { if (!chosen[key]) { unchosen.push(key.toUpperCase()); } });
        if (unchosen.length) {
          this.attr('formError', `The rule is incomplete. Please choose a setting for ${unchosen.join(', ')}.`);
        } else {
          const placeId = AppState().attr('placeId');
          const description = this.attr('ruleTemplate.ruletmpl:description');
          this.attr('saving', true);
          this.attr('ruleTemplate')
            .CreateRule(placeId, name, description, chosen)
            .then(() => {
              this.attr('saving', false);
              closeEditPanel();
              Notifications.success(`'${_truncate(name, { length: 51 })}' has been saved to My Rules.`, 'icon-app-pencil-2');
            })
            .catch((e) => {
              this.attr('saving', false);
              Errors.log(e, true);
            });
        }
      }
    }
  },
});

const events = Object.assign({}, FormEvents, {
  inserted() {
    const vm = this.viewModel;
    const template = vm.attr('ruleTemplate');
    if (!template) {
      vm.attr('description', vm.attr('rule.rule:description'));
    } else {
      template.Resolve(AppState().attr('placeId')).then(({ selectors }) => {
        vm.attr('availableSelectors', selectors);
        vm.attr('selectors', (vm.attr('rule')) ? vm.attr('rule.rule:context') : selectors);
      }).catch(e => Errors.log(e, true));
    }
  },
  /**
   * So a rule cannot resolve because a device is no longer available for that rule. The User
   * edits the rule, and selects a different device. This updates the selectors so that the
   * description gets reparsed and the save button becomes enabled if the description does
   * not have any error classes.
   */
  '{viewModel.chosen} change': function chosenChanged(obj) {
    const selectors = Object.assign({}, this.viewModel.attr('selectors').serialize(), obj.serialize());
    this.viewModel.attr('selectors', selectors);
  },
  /**
   * We listen to click events because the description that contains 'selectable'
   * elements is dynamically generated and inserted into the page. So to ensure
   * there is no binding weirdness, we will listen for the event instead of assigning
   * click events on the element itself.
   */
  'button.selectable click': function selectableClick(element) {
    const $el = $(element);
    $('button.selectable').removeClass('active');

    const vm = this.viewModel;
    const property = $el.attr('id');
    const selected = vm.attr(`availableSelectors.${property}`);
    if (vm.attr(`selected.${property}`) === selected) {
      vm.removeAttr('selected');
    } else {
      vm.attr('selected', {
        [property]: selected,
      });
      $el.addClass('active');
    }
    vm.attr('clickedProperty', property);
  },
  /**
   * Select the text of the name input element when the User focuses on the field.
   */
  '#rule-title focus': function ruleTitleFocus(element) {
    element.select();
  },
});

export default FormComponent.extend({
  tag: 'arcus-rules-edit-panel',
  ViewModel,
  view,
  events,
});
