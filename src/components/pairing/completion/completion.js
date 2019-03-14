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
import view from './completion.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Array<Object>} steps
     * @parent i2web/components/pairing/completion
     * @description the array of steps included in the last 'DismissAllResponse'
     */
    steps: {
      Type: Array,
      value: [],
    },
    /**
     * @property {number} currentStepIndex
     * @parent i2web/components/pairing/completion
     * @description index of the currently displayed completion step
     */
    currentStepIndex: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {boolean} isHidden
     * @parent i2web/components/pairing/completion
     * @description if the modal of this component is hidden while a completion step shows other views
     */
    isHidden: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Object} currentStep
     * @parent i2web/components/pairing/completion
     * @description the currently selected completion step object
     */
    currentStep: {
      get() {
        return this.attr('steps')[this.attr('currentStepIndex')];
      },
    },
    /**
     * @property {Function} wrapperClasses
     * @parent i2web/components/pairing/completion
     * @description string of css classes added on the wrapper element
     */
    wrapperClasses: {
      get() {
        const classes = [];
        const hidden = this.attr('isHidden');
        if (hidden) { classes.push('hidden'); }
        return classes.join(' ');
      },
    },
  },
  /**
   * @property {Function} advance
   * @parent i2web/components/pairing/completion
   * @description Function run by steps when they are complete. Show next step or if no next step, wipes
   * state, removing component content from DOM.
   */
  advance() {
    const current = this.currentStepIndex;
    const steps = this.steps;

    if (steps.length > current + 1) {
      this.attr('currentStepIndex', this.currentStepIndex + 1);
    } else {
      this.attr('steps', []);
      this.attr('currentStepIndex', 0);
      this.exit();
    }
  },
  /**
   * @property {Function} hide
   * @parent i2web/components/pairing/completion
   * @description Function run by steps when they want to show a full-page view. Hides the completion manager modal
   * allowing whatever is in the step to render however it likes.
   */
  hide() {
    this.attr('isHidden', true);
  },
  /**
   * @property {Function} advance
   * @parent i2web/components/pairing/completion
   * @description Function run by steps when they are finished showing a full-page view. Shows the completion manager
   * modal, rendering the step within the confines of the modal content container.
   */
  show() {
    this.attr('isHidden', false);
  },
});

export default Component.extend({
  tag: 'arcus-pairing-completion-manager',
  viewModel: ViewModel,
  view,
});
