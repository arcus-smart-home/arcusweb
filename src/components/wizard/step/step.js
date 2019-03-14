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
import canDev from 'can-util/js/dev/';
import canMap from 'can-map';
import 'can-map-define';
import canViewModel from 'can-view-model';
import Component from 'can-component';
import AppState from 'i2web/plugins/get-app-state';
import view from './step.stache';
import { ViewModel as WizardViewModel } from 'i2web/components/wizard/wizard';


// look for an element that is indicated as the initial point of focus, if found, focus it
function setFocus(stepEl) {
  const focusTarget = stepEl.querySelector('[autofocus]');

  if (focusTarget) {
    focusTarget.focus();
  }
}

export const StepViewModel = canMap.extend({
  define: {
    /**
     * @property {WizardViewModel} parent
     * @parent i2web/components/wizard/step
     * @description Parent Wizard view model for this step
     */
    parent: {
      Type: WizardViewModel,
    },
    /**
     * @property {Boolean} showPrevButton
     * @parent i2web/components/wizard/step
     * @description Whether or not to show the Previous button
     */
    showPrevButton: {
      type: 'htmlbool',
      value: true,
    },
    /**
     * @property {Boolean} disablePrevButton
     * @parent i2web/components/wizard/step
     * @description Whether or not to disable the Prev button
     */
    disablePrevButton: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {String} prevButtonLabel
     * @parent i2web/components/wizard/step
     * @description Label for the button that navigates to prior step
     */
    prevButtonLabel: {
      type: 'string',
      value: 'Back',
    },
    /**
     * @property {Boolean} showNextButton
     * @parent i2web/components/wizard/step
     * @description Whether or not to show the Next button
     */
    showNextButton: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {Boolean} forceShowNextButton
     * @parent i2web/components/wizard/step
     * @description Whether at the last step or not, show the Next button
     */
    forceShowNextButton: {
      type: 'boolean',
      value: false,
      set(forceShowNext) {
        if (!this.attr('showNextButton') && forceShowNext) {
          this.attr('showNextButton', forceShowNext);
        }
        return forceShowNext;
      },
    },
    /**
     * @property {Boolean} disableNextButton
     * @parent i2web/components/wizard/step
     * @description Whether or not to disable the Next button
     */
    disableNextButton: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {String} nextButtonLabel
     * @parent i2web/components/wizard/step
     * @description Label for the button that navigates to next step
     */
    nextButtonLabel: {
      type: 'string',
      value: 'Next',
    },
    /**
     * @property {String} nextButtonLoadingLabel
     * @parent i2web/components/wizard/step
     * @description Label for the button that navigates to next step displayedwhile next step is loading
     */
    nextButtonLoadingLabel: {
      type: 'string',
      value: 'Saving ...',
    },
    /**
     * @property {String} activeStepClass
     * @parent i2web/components/wizard/step
     * @description The CSS class applied to the step's visual container.
     * Should be set when the step's container moves between active and inactive states.
     */
    activeStepClass: {
      value: 'inactive',
    },
    /**
     * @property {String} isActive
     * @parent i2web/components/wizard/step
     * @description Must be set when the step's container moves between active and inactive states.
     */
    isActive: {
      type: 'boolean',
      set(newVal) {
        this.attr('activeStepClass', newVal ? 'active' : 'inactive');
        return newVal;
      },
    },
    /**
     * @property {String} formError
     * @parent i2web/components/wizard/step
     * @description Generic attribute to be used for form errors in any step
     */
    formError: {
      type: 'string',
    },
    /**
     * @property {Boolean} hasNoNav
     * @parent i2web/components/wizard/step
     * @description Indicates if the step lacks next and previous navigation buttons
     */
    hasNoNav: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} isSatisfied
     * @parent i2web/components/wizard/step
     * @description Indicates if the current step is in a satisfied state; used by the parent Wizard to determine if user can go to next step.
     */
    isSatisfied: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} prevIgnoresBypass
     * @parent i2web/components/wizard/step
     * @description When clicking previous, ignore the bypass check
     */
    prevIgnoresBypass: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} prevIgnoresBypass
     * @parent i2web/components/wizard/step
     * @description Register this step with the parent wizard when inserted into the DOM
     */
    registerOnInserted: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {Boolean} bypass
     * @parent i2web/components/wizard/step
     * @description Whether to bypass the current step all together
     */
    bypass: {
      type: 'boolean',
      value() {
        return AppState().attr('place.isPromon');
      },
    },
  },
  /**
   * @function onActivate
   * @description called when the step is activated
   */
  onActivate() {},
  /**
   * @property {Promise} onNext
   * @parent i2web/components/wizard/step
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return Promise.resolve();
  },
  /**
   * @property {error} onNextError
   * @parent i2web/components/wizard/step
   * @description Method that should execute if onNext Promise is rejected.
   */
  onNextError(error) {
    if (error) {
      canDev.warn(`${error.code} : ${error.message}`);
    }
  },
  /**
   * @property {Promise} onPrev
   * @parent i2web/components/wizard/step
   * @description Promise that should execute before going to the previous step.
   */
  onPrev() {
    return Promise.resolve();
  },
  /**
   * @property {error} onPrevError
   * @parent i2web/components/wizard/step
   * @description Method that should execute if onPrev Promise is rejected.
   */
  onPrevError(error) {
    if (error) {
      canDev.warn(`${error.code} : ${error.message}`);
    }
  },
});

export const StepEvents = {
  inserted() {
    const $el = $(this.element);
    const parentWizardViewModel = canViewModel($el.closest('arcus-wizard')[0]);
    // For account creation, we were using steps within steps, so we need the inner
    // step to not register itself with the parent wizard
    if (this.viewModel.attr('registerOnInserted')) {
      parentWizardViewModel.addStep(this.viewModel);
    }
    this.viewModel.attr('parent', parentWizardViewModel);
  },
  '{element} beforeremove': function beforeRemove() {
    const parentWizardViewModel = this.viewModel.attr('parent');
    if (parentWizardViewModel) {
      parentWizardViewModel.removeStep(this.scope);
    }
  },
  // listen to event occuring after a step has been activated and rendered
  '{viewModel} activated': function activationListener() {
    setFocus(this.element);
  },
};

export default Component.extend({
  tag: 'arcus-wizard-step',
  viewModel: StepViewModel,
  view,
  events: StepEvents,
});
