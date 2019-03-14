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
import route from 'can-route';
import 'can-map-define';
import view from './preferences.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {String} activeDisplay
     * @parent i2web/pages/preferences
     * @description The active display of the preferences page
     */
    activeDisplay: {
      type: 'string',
      get() {
        const subpage = route.attr('subpage');
        const page = route.attr('page');
        const defaultPage = 'cards';
        const validPages = [defaultPage];
        if (page === 'preferences' && !validPages.includes(subpage)) {
          route.attr('subpage', defaultPage);
          return defaultPage;
        }
        return subpage || defaultPage;
      },
    },
    /**
     * @property {CanMap} preferences
     * @parent i2web/pages/preferences
     * @description The User preferences, used for dashboard card ordering,
     * hiding, and showing and hiding tutorials.
     */
    preferences: {
      Type: CanMap,
    },
  },
});

export default Component.extend({
  tag: 'arcus-page-preferences',
  viewModel: ViewModel,
  view,
});
