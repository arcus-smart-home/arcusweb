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

import _ from 'lodash';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import Analytics from 'i2web/plugins/analytics';
import config from 'i2web/config';
import AppState from 'i2web/plugins/get-app-state';
import RuleTemplate from 'i2web/models/rule-template';
import SidePanel from 'i2web/plugins/side-panel';
import view from './category-list.stache';

const categoryMetadata = config.ruleCategories;

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {canMap} categories
     *
     * A object with categories names as property names and the number of templates
     * associated with that category as property value.
     */
    categories: {
      set(categories) {
        if (categories && this.attr('templates')) {
          const sorted = this.sortTemplatesByCategory(this.attr('templates'), categories);
          this.attr('sortedCategories', sorted);
        }
        return categories;
      },
    },
    /**
     * @property {boolean} placeIsPremium
     *
     * Whether the current place is premium or basic
     */
    placeIsPremium: {
      type: 'boolean',
      get() {
        return AppState().attr('place.isPremium');
      },
    },
    /**
     * @property {Array<Object>} sortedCategories
     * @param {String} title The category name
     * @param {String} icon The icon representing the rule category
     * @param {Number} count The number of templates in that category
     * @param {Array<i2web/models/rule-template>} templates Templates associated with the category
     */
    sortedCategories: { },
    /**
     * @property {RuleTemplate.List} templates
     * @parent i2web/components/rules/category-list
     * @description The list of rule templates for the currently selected place.
     */
    templates: {
      Type: RuleTemplate.List,
      set(templates) {
        if (templates && this.attr('categories')) {
          const sorted = this.sortTemplatesByCategory(templates, this.attr('categories'));
          this.attr('sortedCategories', sorted);
        }
        return templates;
      },
    },
  },
  /**
   * @function addNewRule
   * @param {RuleTemplate} tmpl The template to display in the side panel
   * @description Render the arcus-rules-edit-panel component on the side panel
   */
  addNewRule(tmpl) {
    SidePanel.right('<arcus-rules-edit-panel {rule-template}="tmpl" />', {
      tmpl,
    });
  },
  /**
   * @function onCategoryActivation
   * @param {Object} panel The panel being activated/deactivated
   * @description Callback when accordion panels are activated
   */
  onCategoryActivation(panel) {
    if (panel.attr('active')) {
      Analytics.tag('rules.add.category');
    }
  },
  /**
   * @function sortTemplatesByCategory
   * @param {Array<RuleTemplate>} templates The templates to categorize and sort
   * @param {Object} newCategories The categories used against the templates
   * @description Divide up the rule template by category, determine if they
   * are satisfiable and sort them by name.
   */
  sortTemplatesByCategory(templates, newCategories) {
    function sortItems(list, property) {
      list.sort((a, b) => {
        const aText = a[property].toLowerCase();
        const bText = b[property].toLowerCase();
        return (aText < bText) ? -1 : 1;
      });
      return list;
    }

    const categories = Object.keys(newCategories.attr())
    .filter((c) => {
      return (categoryMetadata[c] && newCategories[c] > 0);
    })
    .map((prop) => {
      const category = Object.assign({}, categoryMetadata[prop]);
      category.count = newCategories[prop];
      category.templates = { satisfiable: [], unsatisfiable: [] };
      templates.each((template) => {
        if (_.includes(template['ruletmpl:categories'], prop)) {
          if (template.attr('ruletmpl:satisfiable')) {
            if (template.attr('ruletmpl:premium')) {
              if (this.attr('placeIsPremium')) {
                category.templates.satisfiable.push(template);
              } else {
                category.templates.unsatisfiable.push(template);
              }
            } else {
              category.templates.satisfiable.push(template);
            }
          } else {
            category.templates.unsatisfiable.push(template);
          }
        }
        sortItems(category.templates.satisfiable, 'ruletmpl:name');
        sortItems(category.templates.unsatisfiable, 'ruletmpl:name');
      });
      return category;
    });
    sortItems(categories, 'title');
    return categories;
  },
  /**
   * @function unsatisfiableTextFor
   * @param {Object} category
   * @return {String}
   * @description Given a category return a string that tells the User that they don't have
   * any device to fullfil this category's rules or the category is not supported by the Place's
   * service plan.
   */
  unsatisfiableTextFor(category) {
    if (category.premium && !this.attr('placeIsPremium')) {
      return `Your current service plan does not support ${category.attr('title')} rules.`;
    }
    return category.attr('title').toLowerCase() === 'scene'
      ? 'A scene with compatible devices must be created to support these rules.'
      : `There are no connected devices to support ${category.attr('title')} rules.`;
  },
});

export default Component.extend({
  tag: 'arcus-rules-category-list',
  viewModel: ViewModel,
  view,
});
