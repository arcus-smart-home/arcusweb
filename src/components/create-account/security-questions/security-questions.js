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
import CanList from 'can-list';
import CanMap from 'can-map';
import canViewModel from 'can-view-model';
import 'can-map-define';
import I18NService from 'i2web/models/service/I18NService';
import Error from 'i2web/plugins/errors';
import view from './security-questions.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Array} allQuestions
     * @parent i2web/components/create-account/security-questions
     * @description The list of all selectable questions
     */
    allQuestions: {
      get(__, setAttr) {
        const word = 'security_question';
        I18NService.LoadLocalizedStrings([word]).then((response) => {
          const questions = [];
          Object.keys(response.localizedStrings).forEach((key) => {
            const questionObj = {
              id: key.slice(`${word}:question`.length),
              question: response.localizedStrings[key],
            };
            questions.push(new CanMap(questionObj));
          });
          setAttr(questions);
        }).catch(e => Error.log(e));
      },
    },
    /**
     * @property {Array} disableAddQuestion
     * @parent i2web/components/create-account/security-questions
     * @description Disable the add question button when the User has 3 questions
     */
    disableAddQuestion: {
      get() {
        return this.attr('userQuestions.length') > 2;
      },
    },
    /**
     * @property {Array} disableRemoveQuestion
     * @parent i2web/components/create-account/security-questions
     * @description Disable the remove question button when the User have only 1 question
     */
    disableRemoveQuestion: {
      get() {
        return this.attr('userQuestions.length') === 1;
      },
    },
    /*
     * @property {Boolean} invited
     * @parent i2web/components/create-account/security-questions
     *
     * @description Only show staged-progress component on account-creation
     */
    invited: {
      type: 'boolean',
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/components/create-account/security-questions
     * @description Does the form have enough information to attempt validation
     */
    isSatisfied: {
      type: 'boolean',
    },
    /**
     * @property {Array} userQuestions
     * @parent i2web/components/create-account/security-questions
     * @description The list of User configured questions
     */
    userQuestions: {
      Type: CanList,
      value: () => { return [new CanMap({})]; },
    },
  },
  /**
   * @function addQuestion
   * @parent i2web/components/create-account/security-questions
   * @description Add a new question for the User to answer
   */
  addQuestion() {
    const userQuestions = this.attr('userQuestions');
    userQuestions.unshift(new CanMap({}));
    return false;
  },
  /**
   * @function validateForm
   * @parent i2web/components/create-account/security-questions
   * @description Validate each of the security question view models
   */
  formValidates() {
    let valid = true;
    $('arcus-create-account-security-questions-question').each((__, comp) => {
      valid = valid && canViewModel(comp).formValidates();
    });
    return valid;
  },
  /**
   * @function removeQuestion
   * @parent i2web/components/create-account/security-questions
   * @description Remove the specific question
   */
  removeQuestion(index) {
    return () => this.attr('userQuestions').splice(index, 1);
  },
});

export default Component.extend({
  tag: 'arcus-create-account-security-questions',
  viewModel: ViewModel,
  view,
  events: {
    'input input': function inputInput() {
      this.viewModel.attr('isSatisfied', true);
    },
  },
});
