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

stache.registerHelper('subsystem-status', function subsystemCounts(subsystem, options) {
  // We may not have a subsystem because when changing places the placeId updated before
  // the subsystems are requested. And since we filter the subsystem by the base:id
  // which includes the placeId, we have to wait till the new places subsystems are
  // loaded to retrieve the correct subsystem.
  if (!subsystem) { return ''; }

  const componentName = `arcus-subsystem-status-${subsystem.attr('slug')}`;
  const attributes = '{subsystem}="subsystem"';
  const template = `<${componentName} ${attributes}/>`;

  return stache(template)({ subsystem }, options.helpers, options.nodeList);
});

stache.registerHelper('subsystem-component', function subsystemComponent(subsystem, options) {
  if (!subsystem) { return ''; }

  const componentName = subsystem.attr('customComponent');
  const attributes = '{subsystem}="subsystem"';
  const template = `<${componentName} ${attributes} />`;
  return stache(template)({ subsystem }, options.helpers, options.nodeList);
});

stache.registerHelper('subsystem-card', function subsystemCard(subsystem, options) {
  if (!subsystem) { return ''; }

  const componentName = subsystem.attr('customCard');
  const attributes = '{subsystem}="subsystem"';
  const template = `<${componentName} ${attributes} />`;
  return stache(template)({ subsystem }, options.helpers, options.nodeList);
});
