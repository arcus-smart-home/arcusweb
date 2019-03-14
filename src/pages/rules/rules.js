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

import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import canMap from 'can-map';
import canRoute from 'can-route';
import 'can-map-define';
import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import Rule from 'i2web/models/rule';
import RuleService from 'i2web/models/service/RuleService';
import RuleTemplate from 'i2web/models/rule-template';
import view from './rules.stache';
import Errors from 'i2web/plugins/errors';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Account} account
     * @parent i2web/pages/rules
     * @description The User's account object passed in by AppState
     */
    account: {
      Type: Account,
    },
    /**
     * @property {String} activeDisplay
     * @parent i2web/pages/rules
     * @description The active display of rules, either 'my' or 'add'.
     * A value of 'my' will display the 'MY RULES' data. A value of 'add'
     * will display the 'ADD A RULE' data. 'activeDisplay' is also updated
     * by passing in the 'subpage'.
     */
    activeDisplay: {
      type: 'string',
      get() {
        const subpage = canRoute.attr('subpage');
        const page = canRoute.attr('page');
        const defaultPage = 'my';
        const validPages = [defaultPage, 'add'];
        if (page === 'rules' && validPages.indexOf(subpage) === -1) {
          canRoute.attr('subpage', defaultPage);
          return defaultPage;
        }
        return subpage || defaultPage;
      },
    },
    /**
     * @property {Boolean} isOwner
     * @parent i2web/pages/rules
     * @description Whether the currently logged in person is this place's account owner
     */
    isOwner: {
      type: 'boolean',
      get() {
        return this.attr('person.base:id') === this.attr('account.account:owner');
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/rules
     * @description The default person.
     */
    person: {
      Type: Person,
    },
    /**
     * @property {String} place
     * @parent i2web/pages/rules
     * @description The currently selected place. The placeId is needed
     * to get the list of rule templates.
     */
    place: {
      Type: Place,
      set(place) {
        if (!place) { return place; }
        const placeId = place.attr('base:id');
        RuleService.GetCategories(placeId).then(({ categories }) => {
          this.attr('categories', categories);
        }).catch((e) => {
          this.attr('categories', []);
          Errors.log(e, true);
        });
        return place;
      },
    },
    /**
     * @property {Rule.List} rules
     * @parent i2web/pages/rules
     * @description The list of rules configured for the Place
     */
    rules: {
      Type: Rule.List,
    },
    /**
     * @property {RuleTemplate.List} templates
     * @parent i2web/pages/rules
     * @description The list of rule templates for the currently selected place.
     */
    templates: {
      Type: RuleTemplate.List,
    },
  },
  /**
   * @function changeRulesDisplayed
   * @parent i2web/pages/rules
   * @param {String} to The rules data to display, value will be 'my' or 'add'
   *
   * @description Display either 'MY RULES' or 'ADD A RULE' content
   */
  changeRulesDisplayed(to) {
    let tagName;
    if (to === 'my') {
      tagName = 'rules.myrules';
    } else if (to === 'add') {
      tagName = 'rules.library';
    }
    Analytics.tag(tagName);

    canRoute.attr('subpage', to);
    this.attr('activeDisplay', to);
  },
  /**
   * @function displayRules
   * @parent i2web/pages/rules
   * @param {String} display Which content is currently display, 'my' or 'add'
   * @return {String}
   * @description Used to indictate which button is active, will render 'active' or ''
   */
  displayRules(display) {
    return this.attr('activeDisplay') === display;
  },
});

export default Component.extend({
  tag: 'arcus-page-rules',
  viewModel: ViewModel,
  view,
});
