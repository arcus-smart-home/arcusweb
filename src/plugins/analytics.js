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

/**
 * @module i2web/app/plugins/analytics Analytics
 * @parent app.plugins
 * @description Web app tagging for analytics
 */

import canDev from 'can-util/js/dev/';
import SessionService from 'i2web/models/service/SessionService';
import AppState from 'i2web/plugins/get-app-state';

const Analytics = {
  tag(tagName, prefix = 'arcus.client.', context = {}) {
    // We only want to send a tag when we have an active session
    if (AppState().attr('session')) {
      const serviceLevel = AppState().attr('place.place:serviceLevel');
      if (serviceLevel) {
        Object.assign(context, { 'service.level': serviceLevel });
      }
      // TaggingService.Tag(`${prefix}${tagName}`, context).catch(e => canDev.warn(e));
    }
  },
};

// capture click events targeting elements that have the attribute 'data-analytics' and log them
// this listener runs during the capture phase so that we can log these events even when they interfere with bubbling by stopping propagation or modifying the page hierarchy
document.body.addEventListener('click', (ev) => {
  // target or it's ancestor with a data-analytics tag
  const el = ev.target.closest('[data-analytics]');

  if (el !== null) {
    Analytics.tag(el.getAttribute('data-analytics'));
  }
}, true);

export default Analytics;
