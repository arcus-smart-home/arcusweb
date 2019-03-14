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

import stache from 'can-stache';
import canMap from 'can-map';

stache.registerHelper('noAvailableSelector', function noAvailableSelector(selected) {
  const property = canMap.keys(selected)[0];
  switch (property) {
    case 'scene':
      return 'no scenes configured';
    default:
      return 'no devices paired';
  }
});

stache.registerHelper('selectorFor', function selectorFor(selected, rule, chosen, options) {
  const property = canMap.keys(selected)[0];
  const value = selected[property];
  const head = value.options[0][1].split(':')[1];
  const tail = value.options[value.options.length - 1][1].split(':')[1];
  let opts = value.options;

  const template = (function findTemplate(front, back) {
    switch (`${front}-${back}`) {
      case 'dev-dev':
        return 'arcus-rules-selectors-device';
      case 'person-person':
        return 'arcus-rules-selectors-person';
      case 'dev-person':
      case 'person-dev':
        return 'arcus-rules-selectors-person-device';
      default:
        return 'arcus-rules-selectors-generic';
    }
  }(head, tail));

  // For the generic template, if the value is a list with numbers (assumed from the first value),
  // we need to convert it to numbers, sort, and convert it back to strings.
  if (template === 'arcus-rules-selectors-generic' && opts.length !== 0) {
    if (!isNaN(opts[0][1])) {
      opts = opts
        .map(option => ({ 0: option[0], 1: parseFloat(option[1]) }));
    }

    opts = opts.sort((a, b) => {
      if (head === 'scene' && tail === 'scene') {
        return a[0].toLowerCase() > b[0].toLowerCase() ? 1 : -1;
      }
      return a[1] > b[1] ? 1 : -1;
    })
    .map(option => ({ 0: `${option[0]}`, 1: `${option[1]}` }));
  }

  return stache(`<${template} {options}="options" {property}="property" {rule}="rule" {(chosen)}="chosen" />`)({
    options: opts,
    property,
    rule,
    chosen,
  }, options.helpers, options.nodeList);
});
