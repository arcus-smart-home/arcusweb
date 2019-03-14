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
import 'can-map-define';
import 'can-construct-super';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import view from './security-questions.stache';

/**
 * @module {canMap} i2web/pages/create-account/steps/security-questions Security Questions
 * @parent i2web/pages/create-account/steps/security-questions
 * @description Account Creation Security Questions step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:security-questions',
    },
    /**
     * @property {boolean} bypass
     * @parent i2web/pages/create-account/steps/security-questions
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
     * @parent i2web/pages/create-account/steps/security-questions
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/security-questions
     * @description The required data to populate the form fields is complete
     */
    hasCompleteState: {
      get() {
        return this.attr('person').attr('person:securityAnswerCount') > 0;
      },
    },
    /**
     * @property {Boolean} invited
     * @parent i2web/pages/create-account/steps/security-questions
     * @description Only show staged-progress component on account-creation
     */
    invited: {
      type: 'htmlbool',
    },
    /**
     * @property {boolean} prevIgnoresBypass
     * @parent i2web/pages/create-account/steps/security-questions
     * @description When clicking previous, ignore the bypass check
     */
    prevIgnoresBypass: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {boolean} showPrevButton
     * @parent i2web/pages/create-account/steps/security-questions
     * @description When clicking previous, ignore the bypass check
     */
    showPrevButton: {
      type: 'boolean',
      get() {
        return !this.attr('invited');
      },
    },
  },
  /**
   * @function onActivate
   * @parent i2web/pages/create-account/steps/welcome
   * @description When activated, request the security questions for the Person
   */
  onActivate() {
    return this.attr('person').GetSecurityAnswers().then(({ securityAnswers }) => {
      const questions = Object.keys(securityAnswers);
      if (questions.length > 0) {
        this.attr('userQuestions', []);
        questions.forEach((question) => {
          this.attr('userQuestions').push({
            selectedQuestionId: question.slice('question'.length),
            answer: securityAnswers[question],
          });
        });
        this.attr('isSatisfied', true);
      }
    });
  },
  /**
   * @function {Promise} onNext
   * @parent i2web/pages/create-account/steps/security-questions
   * @description Promise that should execute before going to the next step.
   */
  onNext() {
    return new Promise((advance, stay) => {
      if (this.isValidForm()) {
        const params = _.flatten(this.attr('userQuestions').map((q) => {
          return [`question${q.selectedQuestionId}`, q.answer];
        }).serialize());
        this.attr('person').SetSecurityAnswers(...params)
          .then(() => {
            if (this.recordProgress) {
              this.recordProgress(this.attr('stageName'));
            }
            advance();
          })
          .catch(() => {
            stay();
          });
      } else {
        stay();
      }
    });
  },
  /**
   * @function {Promise} onPrev
   * @parent i2web/pages/create-account/steps/security-questions
   * @description Promise that should execute before going to the previous step.
   */
  onPrev() {
    return new Promise((advance) => {
      if (this.undoProgress) {
        this.undoProgress(this.attr('stageName'));
      }
      advance();
    });
  },
  /**
   * @function preventSubmit
   * @parent i2web/pages/create-account/steps/security-questions
   * @description Prevent the submission of the form when there is 1 security question and
   * enter is pressed.
   */
  preventSubmit(ev) {
    ev.preventDefault();
  },
});

export default StepComponent.extend({
  tag: 'arcus-create-account-step-security-questions',
  viewModel: ViewModel,
  view,
});
