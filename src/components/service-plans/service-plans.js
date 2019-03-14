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
import { costOf } from 'i2web/helpers/global';
import CanMap from 'can-map';
import 'can-map-define';
import config from 'i2web/config';
import { plans, yearlyDiscount, features } from 'config/plans.json';
import Plans from 'i2web/models/capability/Place';
import Place from 'i2web/models/place';
import view from './service-plans.stache';

const ANNUAL_PLANS = {
  [Plans.SERVICELEVEL_PREMIUM_PROMON]: Plans.SERVICELEVEL_PREMIUM_PROMON_ANNUAL,
  [Plans.SERVICELEVEL_PREMIUM]: Plans.SERVICELEVEL_PREMIUM_ANNUAL,
  [Plans.SERVICELEVEL_BASIC]: Plans.SERVICELEVEL_BASIC,
};

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Boolean} annualBilling
     * @parent i2web/components/service-plans
     * @description Is the billing cycle annual
     */
    annualBilling: {
      get(lastSetValue) {
        // https://eyeris.atlassian.net/browse/I2-5450
        // We want to show the check box for the current plan when we initially
        // load, but we want to use the value set if the User clicks the toggle
        if (lastSetValue !== undefined) return lastSetValue;
        return Place.isAnnualPlan(this.attr('currentPlan'));
      },
    },
    /**
     * @property {String} currentPlan
     * @parent i2web/components/service-plans
     * @description The current plan of the Place, undefined if in account creation
     */
    currentPlan: {
      get() {
        return (this.attr('updatingExisting'))
          ? this.attr('place.place:serviceLevel')
          : undefined;
      },
    },
    /**
     * @property {Boolean} displayCellBackup
     * @parent i2web/components/service-plans
     * @description Show the cell backup add/remove option to the User
     */
    displayCellBackup: {
      get() {
        const currentPlan = this.attr('currentPlan');
        return this.attr('updatingExisting') && !Place.isPromon(currentPlan);
      },
    },
    /**
     * @property {Boolean} displayFeatures
     * @parent i2web/components/service-plans
     * @description Are we displaying the features table to the User
     */
    displayFeatures: {
      type: 'boolean',
      get(lastSetValue) {
        return lastSetValue || this.attr('updatingExisting');
      },
    },
    /**
     * @property {Boolean} displayStickyHeader
     * @parent i2web/components/service-plans
     * @description Show/Hide the Plan sticky header when the larger plans
     * scrolls out/in the viewport
     */
    displayStickyHeader: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} enableYearlySubscription
     * @parent i2web/components/service-plans
     * @description Are yearly subscriptions currently available to Users
     */
    enableYearlySubscription: {
      get() {
        return !!parseInt(config.enableYearlySubscription, 10);
      },
    },
    /**
     * @property {Boolean} hasCellBackup
     * @parent i2web/components/service-plans
     * @description Does the place currently have the cellular backup addon
     */
    hasCellBackup: {
      get() {
        const addons = this.attr('place.place:serviceAddons');
        return addons && addons.attr().includes(Plans.SERVICEADDON_CELLBACKUP);
      },
    },
    /**
     * @property {String} monitoringAvailable
     * @parent i2web/components/service-plans
     * @description Is ProMonitoring available in the User's area
     */
    monitoringAvailable: {
      type: 'string',
    },
    /**
     * @property {Place} place
     * @parent i2web/components/service-plans
     * @description The User's current place, or the temporary one created
     * during account creation
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Function} selectCellularBackup
     * @parent i2web/components/service-plans
     * @description Call the parent's function when the User has selected the
     * cellular backup option
     */
    selectCellularBackup: {
      Type: Function,
    },
    /**
     * @property {Function} selectPlan
     * @parent i2web/components/service-plans
     * @description Call the parent's function when the User has selected a plan
     */
    selectPlan: {
      Type: Function,
    },
    /**
     * @property {Boolean} showBasicWarningModal
     * @parent i2web/components/service-plans
     * @description If the User clicks 'Skip this step' show a modal warning
     * them what they are missing being on Basic
     */
    showBasicWarningModal: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} updatingExisting
     * @parent i2web/components/service-plans
     * @description Show we display the feature toggle, allowing the User
     * to hide/close the features table; also, should we show the Basic service level
     */
    updatingExisting: {
      type: 'boolean',
    },
  },
  /**
   * @property {String} annualPriceFor
   * @param {String} plan The plan to look up the price for
   * @parent i2web/components/service-plans
   * @description Annual price for plan
   */
  annualPriceFor(plan) {
    const prices = plans[plan];
    return prices ? `$ ${prices.yearDisplayPrice} billed annually` : '';
  },
  /**
   * @property {String} annualSavingsFor
   * @param {String} plan The plan to look up the savings for
   * @parent i2web/components/service-plans
   * @description Annual savings for plan
   */
  annualSavingsFor(plan) {
    const prices = plans[plan];
    return prices ? `Save $${prices.yearSavings}` : '';
  },
  /**
   * @function clickCellularBackup
   * @param {Event} ev The mouse click event
   * @parent i2web/components/service-plans
   * @description Click to add or remove cellular backup add-on
   */
  clickCellularBackup(ev) {
    ev.preventDefault();
    this.selectCellularBackup();
  },
  /**
   * @function featureSupport
   * @param {String} plan
   * @param {Object} feature
   * @parent i2web/components/service-plans
   * @description Show a value, check, or dash in the field based on the feature
   * and plan arguments
   */
  featureSupport(plan, feature) {
    let display = '<i class="icon-app-check"></i>';
    const support = feature.plans.serialize();
    if (Array.isArray(support)) {
      display = support.includes(plan) ? display : '&#45;&#45;';
    }
    const value = support[plan];
    if (typeof value === 'string') display = value;
    if (typeof value === 'number') display = `+$${value}/mo`;
    return `
      <span class="${display.includes('check') ? 'green' : 'grey'}">${display}</span>
    `;
  },
  yearlyDiscount,
  features,
  Plans,
  /**
   * @function {String} monthlyPriceFor
   * @param {String} plan The plan to look up the pricing for
   * @parent i2web/components/service-plans
   * @description Look up the pricing for each plan based on monthly or yearly subscription
   */
  monthlyPriceFor(planTier) {
    const isAnnual = this.attr('annualBilling');
    if (isAnnual) {
      return costOf(ANNUAL_PLANS[planTier], false, 'month');
    }
    return costOf(planTier, false, 'month');
  },
  /**
   * @function planButtonClicked
   * @param {String} plan The selected plan string
   * @parent i2web/components/service-plans
   * @description Call select plan with the User selected plan. Modify the string
   * if the Annual plan is selected
   */
  planButtonClicked(plan, ev) {
    if (ev) ev.preventDefault();
    if (!this.attr('updatingExisting') && plan === Plans.SERVICELEVEL_BASIC) {
      this.attr('showBasicWarningModal', true);
    } else {
      const selected = this.attr('annualBilling')
        ? ANNUAL_PLANS[plan] || plan
        : plan;
      this.selectPlan(selected);
    }
  },
  /**
   * @function {Boolean} planButtonDisabled
   * @param {String} plan The plan name of the button in question
   * @parent i2web/components/service-plans
   * @description Whether the button for this plan is disabled. If we are on the
   * service plan page then our Place will have a serviceLevel, so we need
   * to disable the button for the plan they already have. If we are in account
   * creation we are only concern with disabled Pro-Monitoring if they do not
   * have access to it.
   */
  planButtonDisabled(planTier) {
    const currentPlan = this.attr('currentPlan');
    const isAnnual = this.attr('annualBilling');
    if (currentPlan) {
      switch (planTier) {
        case Plans.SERVICELEVEL_PREMIUM_PROMON:
          if (this.attr('monitoringAvailable') === 'NONE') {
            return true;
          } else if (isAnnual) {
            return currentPlan === Plans.SERVICELEVEL_PREMIUM_PROMON_ANNUAL;
          }
          return Place.isMonthlyPromon(currentPlan);
        case Plans.SERVICELEVEL_PREMIUM:
          if (isAnnual) {
            return currentPlan === Plans.SERVICELEVEL_PREMIUM_ANNUAL;
          }
          return Place.isMonthlyPremium(currentPlan);
        case Plans.SERVICELEVEL_BASIC:
          return Place.isBasic(currentPlan);
        default:
          return false;
      }
    } else {
      return planTier === Plans.SERVICELEVEL_PREMIUM_PROMON
          && this.attr('monitoringAvailable') === 'NONE';
    }
  },
  /**
   * @function toggleBilling
   * @parent i2web/components/service-plans
   * @description Toggle annual billing on and off
   */
  toggleBilling() {
    this.attr('annualBilling', !this.attr('annualBilling'));
  },
  /**
   * @function toggleFeatures
   * @param {Event} ev The mouse click event
   * @parent i2web/components/service-plans
   * @description Toggle the displaying of the features table to the User
   */
  toggleFeatures(ev) {
    ev.preventDefault();
    this.attr('displayFeatures', !this.attr('displayFeatures'));
  },
});

export default Component.extend({
  tag: 'arcus-service-plans',
  viewModel: ViewModel,
  view,
  events: {
    scrollHandler: null,
    inserted() {
      const plansElement = document.querySelector('arcus-service-plans .plans');
      this.scrollHandler = _.throttle((function throttleScroll() {
        const box = plansElement.getBoundingClientRect();
        const adjustBy = this.attr('updatingExisting') ? 140 : 0;
        this.attr('displayStickyHeader',
          Math.abs(box.height) - Math.abs(box.top) - adjustBy < 0);
      }).bind(this.viewModel));
      window.addEventListener('scroll', this.scrollHandler);
    },
    removed() {
      window.removeEventListener('scroll', this.scrollHandler);
    },
  },
});
