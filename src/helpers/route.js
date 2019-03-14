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

import canRoute from 'can-route';
import stache from 'can-stache';

const routeMatches = (value, prop) => {
  // if we're checking for the page route
  if (typeof value !== 'undefined') {
    const propValue = canRoute.attr(prop);
    // fail the check if the pages don't match
    if (typeof propValue === 'undefined') {
      if (value !== '') {
        return false;
      }
    } else if (propValue !== value) {
      return false;
    }
  }
  return true;
};

/**
 * @module {function} i2web/helpers/match-route matchRoute
 * @parent app.helpers
 *
 * @description Check the canRoute attributes against the arguments passed. Return the
 * then block if matches, return the else block if not.
 *
 * If 'subpage' is not defined, the helper will only match against the 'page'
 * property. If 'subpage' is defined, the helper will match against the 'page'
 * and 'subpage' properties.
 *
 * @param {Object} toMatch
 *   @option {String} page The page to check against
 *   @option {String} subpage The subpage to check against.
 * @param {Object} options Stache options
 *
 * @return {String} The value returned from the evaluation of options.fn()
 * options.inverse();
 */
stache.registerSimpleHelper('matchRoute', function matchRoute(route, options) {
  if (!route || !options) return '';

  if (!routeMatches(route.page, 'page') || !routeMatches(route.subpage, 'subpage')) {
    return options.inverse();
  }
  return options.fn();
});
