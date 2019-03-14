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
import CanMap from 'can-map';
import 'can-map-define';
import view from './help.stache';

const BUTTON_ACTIONS = {
  PAIRING_STEPS: {
    text: 'Show Steps',
    class: 'btn',
  },
  FACTORY_RESET: {
    text: 'Reset Device',
    class: 'btn-cancel',
  },
  FORM: {
    text: 'Re-enter Code',
    class: 'btn',
  },
};

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Object} helpSteps
     * @parent i2web/components/pairing/help
     * @description The help steps to render, if a product was selected the steps
     * are passed in as an argument, if not, the default steps are used
     */
    helpSteps: {
      get(lastSetValue) {
        return _.sortBy(lastSetValue, 'order');
      },
    },
    /**
     * @property {string} title
     * @parent i2web/components/pairing/help
     * @description The title displayed on the page showing the pairing status
     */
    title: {
      get() {
        return 'Searching...';
      },
    },
  },
  /**
   * @function actionClick
   * @param {String} action
   * @parent i2web/components/pairing/help
   * @description The click handler for all help actions, to be overriden by parent
   */
  actionClick() { },
  /**
   * @function {Object} buttonAction
   * @param {Object} step
   * @parent i2web/components/pairing/help
   * @description Return a button description object for the particular action
   */
  buttonAction(step) {
    return BUTTON_ACTIONS[step.action];
  },
});

export default Component.extend({
  tag: 'arcus-pairing-help',
  viewModel: ViewModel,
  view,
});
