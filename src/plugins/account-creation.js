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
 * @module i2web/app/plugins/account-creation Account Creation Plug-ins
 * @parent app.plugins
 * @description Helper methods for account creation process
 */
import _ from 'lodash';
import canDev from 'can-util/js/dev/';
import PlaceCapability from 'i2web/models/capability/Place';
import Analytics from 'i2web/plugins/analytics';

const STATE_LOCATION = 'arcus/account/creation/state';
const STAGES_LOCATION = 'arcus/account/creation/stages';

/**
 * @function clearAllProgress
 * @parent i2web/app/plugins/account-creation
 * @description Clear all locally stored progress indicators (stages, and state)
 */
export function clearAllProgress() {
  try {
    if (window.localStorage.getItem(STAGES_LOCATION)) {
      window.localStorage.removeItem(STAGES_LOCATION);
    }
    if (window.localStorage.getItem(STATE_LOCATION)) {
      window.localStorage.removeItem(STATE_LOCATION);
    }
  } catch (e) {
    canDev.warn(e);
  }
}

/**
 * @function extractSelectedPlan
 * @parent i2web/app/plugins/account-creation
 * @description Returns the first string that includes 'PREF_PLAN:'
 */
export function extractSelectedPlan(place) {
  const tags = place.attr('base:tags').filter(t => t.includes('PREF_PLAN:'));
  // for example PREF_PLAN:PREMIUM
  const plan = tags.length > 0 && tags[0].split(':')[1];
  return plan;
}

/**
 * @function extractSelectedUse
 * @parent i2web/app/plugins/account-creation
 * @description Returns the first string that includes 'PREF_USE:'
 */
export function extractSelectedUse(place) {
  const tags = place.attr('base:tags').filter(t => t.includes('PREF_USE:'));
  // for example PREF_USE:security
  return tags.length > 0 ? tags[0].split(':')[1] : undefined;
}

/**
 * @function generateStages
 * @parent i2web/app/plugins/account-creation
 * @description Returns an array of stages that have been completed by the user.
 */
export function generateStages(steps) {
  const stages = [];
  steps.forEach((step) => {
    if (step.attr('hasCompleteState')) {
      stages.push(step.attr('stageName'));
    }
  });
  return _.uniq(stages);
}

/**
 * @function tagForAnalytics
 * @parent i2web/app/plugins/account-creation
 * @description Tag the advancement from a stage for analysis.
 */
export function tagForAnalytics(place, stage) {
  const plan = extractSelectedPlan(place);
  if (plan && stage) {
    // remove 'web:' from the stage name
    const step = stage.split(':')[1];
    let tag = `account.create.${step}`;
    // remove all hyphens in the stage name
    tag = tag.split('-').join('');
    Analytics.tag(tag);
  }
}

export default {
  clearAllProgress,
  extractSelectedPlan,
  extractSelectedUse,
  generateStages,
  tagForAnalytics,
};
