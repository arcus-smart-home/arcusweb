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

import 'can-map-define';
import 'can-construct-super';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import Errors from 'i2web/plugins/errors';
import view from './select-plan.stache';


/**
 * @module {canMap} i2web/pages/create-account/steps/select-plan Select Plan
 * @parent i2web/pages/create-account/steps/select-plan
 * @description Account Creation Select Plan step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:plan',
    },
    /**
     * @property {boolean} bypass
     * @parent i2web/pages/create-account/steps/select-plan
     * @description Whether to bypass this step because we have completed it
     */
    bypass: {
      get() {
        return this.attr('completedStages').includes(this.attr('stageName'))
          && this.attr('hasCompleteState');
      },
    },
    /**
     * @property {Array} completedStages
     * @parent i2web/pages/create-account/steps/select-plan
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/select-plan
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        const preferredPlan = this.attr('place.base:tags')
          .filter(i => i.includes('PREF_PLAN:'));
        if (preferredPlan.length && preferredPlan[0].includes('PROMON')) {
          return this.attr('monitoringAvailable') !== 'NONE';
        }
        return preferredPlan.length > 0;
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/select-plan
     * @description Indicates if the current step is in a satisfied state and can advance
     */
    isSatisfied: {
      get() {
        return this.attr('hasCompleteState');
      },
    },
    /**
     * @property {string} monitoringAvailable
     * @parent i2web/pages/create-account/steps/select-plan
     * @description Is ProMonitoring available in the User's area
     */
    monitoringAvailable: {
      type: 'string',
    },
    /**
     * @property {boolean} prevIgnoresBypass
     * @parent i2web/pages/create-account/steps/name
     * @description When clicking previous, ignore the bypass check
     */
    prevIgnoresBypass: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {Boolean} showNextButton
     * @parent i2web/pages/create-account/steps/select-plan
     * @description Whether or not to show the Next button
     */
    showNextButton: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function selectAndAdvance
   * @param {string} plan The plan selected by the User
   * @param {MouseEvent} ev The mouse event used to cancel the default action
   * @parent i2web/pages/create-account/steps/select-plan
   * @description Sets the selected plan and advances the wizard
   */
  selectAndAdvance(selectedPlan) {
    const place = this.attr('place');
    const recordAndAdvance = () => {
      this.recordProgress(this.attr('stageName'), {
        place: this.attr('place'),
      });
      this.next();
    };

    let previousPlan = '';
    const tags = place.attr('base:tags').filter(t => t.includes('PREF_PLAN:'));
    if (tags.length) {
      previousPlan = tags[0];
      if (place.attr('base:tags').indexOf(previousPlan !== -1)) {
        place.attr('base:tags').splice(place.attr('base:tags').indexOf(previousPlan), 1);
      }
    }
    const currentPlan = `PREF_PLAN:${selectedPlan}`;
    place.attr('base:tags').push(currentPlan);

    if (this.attr('session')) {
      place.RemoveTags(previousPlan).then(() => {
        place.AddTags(currentPlan).then(() => {
          recordAndAdvance();
        }).catch(e => Errors.log(e));
      }).catch(e => Errors.log(e));
    } else {
      recordAndAdvance();
    }
  },
  /**
   * @function {Promise} onPrev
   * @parent i2web/pages/create-account/steps/select-plan
   * @description Promise that should execute before going to the previous step.
   */
  onPrev() {
    return new Promise((advance) => {
      this.undoProgress(this.attr('stageName'));
      advance();
    });
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-select-plan',
  viewModel: ViewModel,
  view,
});
