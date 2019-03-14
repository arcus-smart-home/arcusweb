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
import Errors from 'i2web/plugins/errors';
import Place from 'i2web/models/place';
import StepComponent, { StepViewModel } from 'i2web/components/wizard/step/';
import view from './how-to-use.stache';


/**
 * @module {canMap} i2web/pages/create-account/steps/how-to-use
 * @parent i2web/pages/create-account/steps/how-to-use
 * @description Account Creation 'How will I use Arcus' step
 */
export const ViewModel = StepViewModel.extend({
  define: {
    stageName: {
      value: 'web:howtouse',
    },
    /**
     * @property {boolean} bypass
     * @parent i2web/pages/create-account/steps/how-to-use
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
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description A collection of the completed stages
     */
    completedStages: {
      Type: Array,
    },
    /**
     * @property {boolean} hasCompleteState
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description Indicates if the current step is in a satisfied state and can advance
     */
    hasCompleteState: {
      get() {
        return !!this.attr('selectedUse');
      },
    },
    /**
     * @property {boolean} isSatisfied
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description Indicates if the current step is in a satisfied state and can advance
     */
    isSatisfied: {
      get() {
        return this.attr('hasCompleteState');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description The initial Place of the new Account
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Boolean} prevIgnoresBypass
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description When clicking previous, ignore the bypass check
     */
    prevIgnoresBypass: {
      type: 'boolean',
      value: true,
    },
  /*
   * @property {Function} recordProgress
   * @parent i2web/components/create-account/how-to-use
   * @description Parent component's callback method that is invoked when child wants to record progress.
   */
    recordProgress: {
      type: '*',
    },
    /**
     * @property {String} selectedUse
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description Selected use for Arcus; will be either 'security' or 'switch'
     */
    selectedUse: {
      type: 'string',
    },
    /**
     * @property {*} session
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description The authenticated session, if user logged in
     */
    session: {
      type: '*',
    },
    /**
     * @property {Boolean} showNextButton
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description Whether or not to show the Next button
     */
    showNextButton: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Boolean} showPrevButton
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description Whether or not to show the Previous button
     */
    showPrevButton: {
      type: 'boolean',
      value: false,
    },
    /*
     * @property {Boolean} startedOnMobile
     * @parent i2web/pages/create-account/steps/how-to-use
     * @description Indicates if user arrived here via mobile account creation link
     */
    startedOnMobile: {
      type: 'boolean',
    },
  },
  /**
   * @function selectAndAdvance
   * @param {string} selectedUse The intended use selected by the User
   * @parent i2web/pages/create-account/steps/how-to-use
   * @description Sets the selected use and advances the wizard
   */
  selectAndAdvance(selectedUse) {
    const recordAndAdvance = () => {
      this.recordProgress(this.attr('stageName'), {
        place: this.attr('place'),
        selectedUse: this.attr('selectedUse'),
      });
      this.next();
    };
    this.attr('selectedUse', selectedUse);
    const place = this.attr('place');
    const currentUse = `PREF_USE:${selectedUse}`;
    let previousUse = '';
    const tags = place.attr('base:tags').filter(t => t.includes('PREF_USE:'));
    if (tags.length) {
      previousUse = tags[0];
      if (place.attr('base:tags').indexOf(previousUse !== -1)) {
        place.attr('base:tags').splice(place.attr('base:tags').indexOf(previousUse), 1);
      }
    }

    place.attr('base:tags').push(currentUse);
    if (this.attr('session')) {
      place.RemoveTags(previousUse).then(() => {
        place.AddTags(currentUse).then(() => {
          recordAndAdvance();
        }).catch(e => Errors.log(e));
      }).catch(e => Errors.log(e));
    } else {
      recordAndAdvance();
    }
  },
});


export default StepComponent.extend({
  tag: 'arcus-create-account-step-how-to-use',
  viewModel: ViewModel,
  view,
});
