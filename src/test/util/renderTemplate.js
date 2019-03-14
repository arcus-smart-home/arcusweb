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
import canMap from 'can-map';
import stache from 'can-stache';
import uniqueId from 'i2web/plugins/unique-id';

export default function makeRender(container, template, scope) {
  const expando = uniqueId('fixture');
  let templateString = template;
  let toRender = template;
  let templateScope = scope;

  if (typeof template === 'string') {
    // Grab template from DOM Element if we have a selector
    if (template[0] === '#') {
      templateString = $(template)[0].innerHTML;
    }
  }

  // Make sure the template is a stache template
  // If we fail this check, templateString === template and template is a stache template already
  if (!templateString.render) {
    toRender = stache(templateString);
  }

  // Make sure the scope is a canMap
  if (!(scope instanceof canMap)) {
    templateScope = new canMap(scope);
  }

  return {
    render() {
      const frag = toRender(templateScope);
      const renderTo = $(`<div id="${expando}"></div>`).appendTo(container);
      renderTo.html(frag);
    },
    cleanupRender() {
      $(`#${expando}`).remove();
    },
  };
}
