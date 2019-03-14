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
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import CanList from 'can-list';
import view from './question.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {number} selectedQuestionId
     * @parent i2web/components/create-account/security-questions/question
     * @description The User selected question
     */
    question: {
      type: 'string',
      value: '',
    },
    /**
    * @property {string} answer
    * @parent i2web/components/create-account/security-questions/question
    * @description The User selected answer
    */
    answer: {
      type: 'string',
      value: '',
    },
    /**
     * @property {CanMap} constraints
     * @parent i2web/components/create-account/security-questions/question
     * @description Form validation constraints
     */
    constraints: {
      value: {
        question: {
          presence: true,
        },
        answer: {
          presence: true,
        },
      },
    },
    /**
     * @property {CanList} allQuestions
     * @parent i2web/components/create-account/security-questions/question
     * @description the list of all security questions
     */
    allQuestions: {
      Type: CanList,
    },
    /**
     * @property {CanList} selectedQuestions
     * @parent i2web/components/create-account/security-questions/question
     * @description the list of security questions and answer pairs selected by the user
     */
    selectedQuestions: {
      Type: CanList,
    },
    /**
     * @property {CanList} possibleQuestions
     * @parent i2web/components/create-account/security-questions/question
     * @description list of all questions excluding all selected questions, except this component's own selection
     */
    possibleQuestions: {
      get() {
        const mySelectedQuestionId = this.attr('question');
        const selectedQuestionIds = this.attr('selectedQuestions')
          .map(q => q.attr('selectedQuestionId')).filter(id => id !== mySelectedQuestionId).attr();
        return this.attr('allQuestions').filter(q => !selectedQuestionIds.includes(q.id));
      },
    },
  },
});

export default FormComponent.extend({
  tag: 'arcus-create-account-security-questions-question',
  viewModel: ViewModel,
  view,
});
