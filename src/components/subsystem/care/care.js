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
import AppState from 'i2web/plugins/get-app-state';
import Component from 'can-component';
import canMap from 'can-map';
import canRoute from 'can-route';
import 'can-map-define';
import Errors from 'i2web/plugins/errors';
import Place from 'i2web/models/place';
import Subsystem from 'i2web/models/subsystem';
import view from './care.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {string} activeDisplay
     * @parent i2web/components/subsystem/care
     * @description The active display of the care page
     */
    activeDisplay: {
      get() {
        const subpage = canRoute.attr('subpage');
        const page = canRoute.attr('page');
        const action = canRoute.attr('action');
        const defaultAction = 'status';
        const validPages = [defaultAction, 'behaviors', 'activity', 'settings'];
        if (page === 'services' && subpage === 'care' && validPages.indexOf(action) === -1) {
          canRoute.attr('action', defaultAction);
          return defaultAction;
        }
        return action || defaultAction;
      },
    },
    /**
     * @property {List<BehaviorTemplate>} behaviorTemplates
     * @parent i2web/components/subsystem/care
     * @description The behavior templates available to the Place's subsystem
     */
    behaviorTemplates: {
      get(__, asyncReturn) {
        // Execute this getter when devices changes
        this.attr('subsystem.subcare:careCapableDevices.length');

        this.attr('subsystem').ListBehaviorTemplates()
          .then(({ behaviorTemplates }) => {
            const transformed = behaviorTemplates.map(this.transformTemplate);
            asyncReturn(transformed);
          })
          .catch(Errors.log);

        return [];
      },
    },
    /**
     * @property {Boolean} isPremiumPlace
     * @parent i2web/components/subsystem/care
     * @description Boolean indicating if the current place is Premium
     */
    isPremiumPlace: {
      get() {
        return this.attr('place.isPremium');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/care
     * @description Where the displayed care information is configured
     */
    place: {
      Type: Place,
      get() {
        return AppState().attr('place');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care
     * @description The care subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function changeCareDisplay
   * @parent i2web/components/subsystem/care
   * @param {string} to Which content to display.
   * @description Click handlers to change the  subpage
   */
  changeCareDisplay(to) {
    canRoute.attr('action', to);
  },
  /**
   * @function careDisplayedIs
   * @parent i2web/components/subsystem/care
   * @param {string} display Which content is currently displayed.
   * @return {string}
   * @description Used to indicate which button is active, will render 'active' or ''
   */
  careDisplayedIs(display) {
    return this.attr('activeDisplay') === display;
  },
  /**
   * @function transformTemplate
   * @param {Object} template The raw care behavior template from the platform
   * @return {Object}
   * @parent i2web/components/subsystem/care
   * @description Bring sanity to the Care Behavior Template so that we can
   * easier render the web UI components related to adding and updating care
   * behaviors.
   *
   * Take a structure like:
   * {
   *   fieldDescriptions: {
   *     devices: ...
   *     timeWindows: ...
   *   },
   *   fieldValues: {
   *     devices: ...
   *     timeWindows: ...
   *   }
   * }
   *
   * And turn it into:
   *
   * {
   *   fields: {
   *     devices: {
   *       description: ...
   *       value: ...
   *     },
   *     timeWindows: {
   *       description: ...
   *       value: ...
   *     },
   *   }
   * }
   */
  transformTemplate(template) {
    const [fieldKeys, otherKeys] =
      _.partition(Object.keys(template), key => key.includes('field'));
    const transformed = _.pick(template, otherKeys);
    const fields = {};
    fieldKeys.forEach((k) => {
      // Shorten names for field-related properties, e.g. 'fieldDescriptions' -> 'description'
      const fieldName = /^field(\w*)$/.exec(k)[1].toLowerCase().slice(0, -1);
      Object.keys(template[k]).forEach((f) => {
        let fld = f;
        if (f.endsWith('Temp')) {
          // lowTemp and highTemp are collapsed into a temperatureRange field
          fld = 'temperatureRange';
        } else if (f === 'timeWindows' && template.fieldUnits.timeWindows === 'NODURATION') {
          // A noduration timeWindow only requires a single time setting; create a new field type
          fld = 'time';
        } else if (f === 'devices' && template.type === 'OPEN_COUNT') {
          // The devices and count values are stored differently for the Monitor Memory Habits template
          fld = 'devicesOpenCount';
        }
        if (!fields[fld]) {
          fields[fld] = {};
          fields[fld].sortKey = fld;
        }
        // Multipoint values are transformed from strings to arrays, e.g
        // '20-105' -> [20, 105]  or  '1,2,3,4,5' -> [1, 2, 3, 4, 5]
        fields[fld][fieldName] = (fieldName === 'value')
          ? _.split(template[k][f], /-|,/)
          : template[k][f];
      });
    });
    if (fields.temperatureRange) {
      // Special case: Update the label and add a description for temperatureRange
      fields.temperatureRange.label = 'Temperature Range';
      fields.temperatureRange.description = 'Choose the temperature range that you want to monitor.';
    }
    if (template.type === 'OPEN_COUNT') {
      // Special case: Add the range of open count values for devices on the Monitor Memory Habits template
      fields.devicesOpenCount.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
    }

    transformed.fields = fields;
    return transformed;
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-care',
  viewModel: ViewModel,
  view,
});
