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
import view from './steps-combined.stache';
import _ from 'lodash';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {String} defaultFooter
     * @parent i2web/components/pairing/steps-combined
     * @description If the 0th reset step doesn't have an info property, use this one
     */
    defaultFooter: {
      type: 'string',
    },
    /**
     * @property {String} defaultHeader
     * @parent i2web/components/pairing/steps-combined
     * @description If the 0th reset step doesn't have a title property, use this one
     */
    defaultHeader: {
      type: 'string',
    },
    /**
     * @property {Object} pairingTypeSteps
     * @parent i2web/components/pairing/steps-combined
     * @description The pairing-type steps to render
     */
    pairingTypeSteps: {
      get(lastSetValue) {
        return _.sortBy(lastSetValue, 'order');
      },
    },
    /**
     * @property {String} stepsFooterText
     * @parent i2web/components/pairing/steps-combined
     * @description The footer to render in italics below the steps; pulled from the first step
     */
    stepsFooterText: {
      get() {
        const steps = this.attr('pairingTypeSteps');
        return steps && steps.length > 0 && steps[0].info ? steps[0].info : this.attr('defaultFooter');
      },
    },
    /**
     * @property {String} stepsHeaderText
     * @parent i2web/components/pairing/steps-combined
     * @description The header to render in italics above the steps; pulled from the first step
     */
    stepsHeaderText: {
      get() {
        const steps = this.attr('pairingTypeSteps');
        return steps && steps.length > 0 && steps[0].title ? steps[0].title : this.attr('defaultHeader');
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-pairing-steps-combined',
  viewModel: ViewModel,
  view,
});
