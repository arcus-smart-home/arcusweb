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

export default Component.extend({
  tag: 'arcus-devtools',
  events: {
    /* eslint-disable promise/catch-or-return */
    inserted() {
      steal.done().then(() => {
        // Wait for steal to finish loading before importing the devtools script
        // On live-reloads this will be resolved already but the page will be
        // re-rendered so we have to call the plugin again.
        System.import('i2web-devtools').then(() => {
          $('body').arcusDevTools();
        });
      });
    },
    /* eslint-enable promise/catch-or-return */
  },
});
