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
import canList from 'can-list';
import canBatch from 'can-event/batch/';
import 'can-map-define';
import view from './wizard.stache';
import { StepViewModel } from './step/';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {ViewModelList} steps
     * @parent i2web/components/wizard
     * @description All of the steps in the wizard.
     */
    steps: {
      Type: canList,
      value: [],
    },
    /**
     * @property {boolean} initialStep
     * @parent i2web/components/wizard
     * @description Sets the initial step to be shown when wizard is first rendered,
     * using 0-based indexing. For example, use 0 for the first step, etc...
     * You should ensure prior steps are already satisfied before setting to a
     * value other than 0.
     */
    initialStepIndex: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {StepViewModel} activeStep
     * @parent i2web/components/wizard
     * @description Reference to the step currently active in the wizard.
     */
    activeStep: {
      Type: StepViewModel,
      set(step) {
        if (step) {
          step.attr('isActive', true);
        }
        return step;
      },
    },
    /**
     * @function getActiveIndex
     * @parent i2web/components/wizard
     * @description The numeric index of the currently active wizard step.
     */
    activeIndex: {
      get() {
        return this.attr('activeStep') ? this.attr('steps').indexOf(this.attr('activeStep')) : 0;
      },
    },
    /**
     * @property {boolean} showLeaveAtFirstStep
     * @parent i2web/components/wizard
     * @description Determines whether or not to show the back button on first step
     */
    showLeaveAtFirstStep: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} atFirstStep
     * @parent i2web/components/wizard
     * @description Determines if user is on first step.
     */
    atFirstStep: {
      get() {
        return this.attr('activeIndex') === 0;
      },
    },
    /**
     * @property {boolean} atLastStep
     * @parent i2web/components/wizard
     * @description Determines if user is on last step.
     */
    atLastStep: {
      get() {
        const numSteps = this.attr('steps') ? this.attr('steps').attr('length') : 0;
        if (this.attr('activeStep.forceShowNextButton')) {
          return false;
        }
        return this.attr('activeIndex') === numSteps - 1;
      },
    },
    /**
     * @property {boolean} loadingNext
     * @parent i2web/components/wizard
     * @description Indicates wizard is in the process of loading the next step; shows spinner on next buttons, which is useful for slow responding promises.
     */
    loadingNext: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} loadingPrev
     * @parent i2web/components/wizard
     * @description Indicates wizard is in the process of loading the previous step; shows spinner on previous buttons, which is useful for slow responding promises.
     */
    loadingPrev: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function restart
   * @parent i2web/components/wizard
   * @description Start the wizard over at the zeroth stage
   */
  restart() {
    const firstStep = this.attr('steps.0');
    this.makeActive(firstStep);
  },
  /**
   * @function next
   * @parent i2web/components/wizard
   * @param {Event} ev Event that triggered the next call
   * @description Navigates to the next step in the wizard,
   * as long as the user has not reached the end.
   */
  next(ev) {
    if (ev) ev.preventDefault();

    const active = this.attr('activeStep');
    if (this.attr('loadingNext') || !active.attr('isSatisfied')) return;

    this.attr('loadingNext', true);
    active.onNext().then(() => {
      this.attr('loadingNext', false);

      const steps = this.attr('steps');
      let newIndex = this.attr('activeIndex') + 1;
      while (newIndex < steps.attr('length')) {
        const step = steps.attr(newIndex);
        if (!step.attr('bypass')) {
          this.makeActive(step);
          break;
        }
        newIndex += 1;
      }
    }).catch((e) => {
      this.attr('loadingNext', false);
      active.onNextError(e);
    });
  },
  /**
   * @function prev
   * @parent i2web/components/wizard
   * @param {Event} ev Event that triggered the prev call
   * @description Navigates to the previous step in the wizard,
   * as long as the user is not at the beginning.
   */
  prev(ev) {
    if (ev) ev.preventDefault();
    this.attr('loadingPrev', true);
    this.attr('activeStep').onPrev().then(() => {
      this.attr('loadingPrev', false);

      const steps = this.attr('steps');
      let newIndex = this.attr('activeIndex') - 1;
      while (newIndex >= 0) {
        const step = steps.attr(newIndex);
        if (!step.attr('bypass') || step.attr('prevIgnoresBypass')) {
          this.makeActive(step);
          break;
        }
        newIndex -= 1;
      }
    }).catch((e) => {
      this.attr('loadingNext', false);
      this.attr('activeStep').onPrevError(e);
    });
  },
  /**
   * @function addStep
   * @param {} step to be added
   * @parent i2web/components/wizard
   * @description Add a `<step>` to the wizard's view model
   */
  addStep(step) {
    this.attr('steps').push(step);
    const startingIndex = this.attr('initialStepIndex');
    if (this.attr('steps').attr('length') === (startingIndex + 1)) {
      if (!step.attr('bypass')) {
        this.makeActive(step);
      } else {
        this.attr('initialStepIndex', startingIndex + 1);
      }
    }
  },
  /**
   * @function removeStep
   * @param {} step to be removed
   * @parent i2web/components/wizard
   * @description When a `<step>` element is removed from the document,
   * it calls this method to remove the step's scope from
   * the steps array.
   */
  removeStep(step) {
    const steps = this.attr('steps');
    canBatch.start();
    steps.splice(steps.indexOf(step), 1);
    // if the removed step was active, make the first step active instead
    if (step === this.attr('activeStep')) {
      if (steps.attr('length') > 0) {
        this.attr('activeStep', steps.attr(0));
      } else {
        this.removeAttr('activeStep');
      }
    }
    canBatch.stop();
  },
  /**
   * @function makeActive
   * @param {} step to be made active
   * @parent i2web/components/wizard
   * @description Makes the `<step>` active.
   */
  makeActive(step) {
    const steps = this.attr('steps');
    canBatch.start();
    steps.forEach((thisStep) => {
      thisStep.attr('isActive', false);
    });
    if (step !== this.attr('activeStep')) {
      this.attr('activeStep', step);
      step.onActivate();
      // send 'activated' event on step view model as soon as page activation changes are complete
      setTimeout(() => { step.dispatch('activated', []); }, 0);
    }
    canBatch.stop();
  },
  /**
   * @function _leaveWizard
   * @parent i2web/components/wizard
   * @description Internal function only, any logic needed to all wizards should go here.
   */
  _leaveWizard(ev) {
    if (ev) ev.preventDefault();

    if (typeof this.onLeaveWizard === 'function') {
      this.onLeaveWizard();
    }
  },
  /**
   * @function onLeaveWizard
   * @parent i2web/components/wizard
   * @description If defined, a button will be rendered to allow the use to exit the wizard from
   * the first step. Logic for exiting the wizard must be implemented in this function.
   */
  onLeaveWizard: undefined,
  init() {
    if (this.onLeaveWizard) {
      this.attr('showLeaveAtFirstStep', true);
    }
  },
});

export default Component.extend({
  tag: 'arcus-wizard',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel} activeStep': function onActiveStep() {
      $('html, body').scrollTop(0);
    },
  },
});
