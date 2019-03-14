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

import CanMap from 'can-map';
import CanList from 'can-list';
import { FormComponent, FormViewModel, FormEvents } from 'i2web/components/form/';
import view from './security-question.stache';
import SidePanel from 'i2web/plugins/side-panel';
import 'can-map-backup';
import _ from 'lodash';


/**
 * @module {CanMap} i2web/components/form/security-question Security Questions
 * @parent i2web/components/form
 * @description Security question editing form
 */
export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {CanMap} constraints
     * @parent i2web/components/form/security-question
     * @description form validation constraints
     */
    constraints: {
      value: {
        'currentQuestion.answer': { presence: true },
        'currentQuestion.id': { presence: true },
      },
    },
    /**
     * @property {Map} currentQuestion
     * @parent i2web/components/form/security-question
     * @description the questions a user may choose from
     */
    selectableQuestions: { Type: CanList },
    /**
     * @property {Integer} index
     * @parent i2web/components/form/security-question
     * @description the index of the current question / answer pair
     */
    index: { type: 'number' },
    /**
     * @property {Map} currentQuestion
     * @parent i2web/components/form/security-question
     * @description the question/answer combo the user is editing
     */
    currentQuestion: {
      Type: CanMap,
      set(value) {
        value.backup(); // store the state so we can revert if editing is canceled
        return value;
      },
    },
    /**
     * @property {Boolean} saving
     * @parent i2web/components/form/security-question
     * @description whether the form is being saved
     */
    saving: {
      type: 'boolean',
      value: false,
    },
  },
  save(ev) {
    ev.preventDefault();
    if (this.hasChanges() && this.formValidates()) {
      this.attr('saving', true);
      this.saveAllQuestions().then(() => {
        this.attr('saving', false);
        this.attr('currentQuestion.saved', true);
        SidePanel.close();
      }).catch((e) => {
        this.attr('saving', false);
        this.attr('formError', e.message || e);
      });
    }
  },
  cancel() {
    this.canceling = true; // let id change listener know we're canceling and not to clear out the restored answer
    this.attr('currentQuestion').restore(); // revert question state
    delete this.canceling;
    SidePanel.close();
  },
});

const events = Object.assign({
  '{viewModel.currentQuestion} id': function questionChange(vm, ev, id) {
    if (this.viewModel.canceling) { return; } // don't run this listener if we're restoring the original Q/A model state

    const questions = this.viewModel.attr('selectableQuestions');
    const question = (_.find(questions, q => q.id === id) || {}).question;

    // clear out the answer when the question changes
    this.viewModel.attr('currentQuestion.answer', '');
    // update question string to match new id
    this.viewModel.attr('currentQuestion.question', question);
  },
}, FormEvents);

export default FormComponent.extend({
  tag: 'arcus-form-security-question',
  viewModel: ViewModel,
  view,
  events,
});
