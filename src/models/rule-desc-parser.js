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
import string from 'can-util/js/string/string';
import AppState from 'i2web/plugins/get-app-state';

const RULE_CLASS = 'rule-item';
const ERROR_CLASS = 'error';
const BTN_ERROR_CLASS = 'btn-error';

/**
 * @function substituteTemplateValues
 * @parent i2web/models/rule-desc-parser
 * @param {String} template The template to perform the substitution on
 * @param {Object} values The key/value pair to substitute into the template
 */
export function substituteTemplateValues(template, values) {
  return string.sub(template.replace(/\${/g, '{'), Object.assign(...values));
}

/**
 * @function renderButton
 * @parent i2web/models/rule-desc-parser
 *
 * Return an object that contains the property we are going
 * to match, with the HTML value we are going to substitute.
 * @param {Boolean} resolved Whether the object was resolved
 * @param {String} key The property to match in the rule template
 * @param {String} value The HTML to substitude for the property
 * @return {Object} The key in the template and the HTML string to substitute
 */
export function renderButton(resolved, key, value) {
  return {
    [key]: (resolved)
      ? `<button type="button" id="${key}" class="btn selectable">${value.toUpperCase()}</button>`
      : `<button type="button" id="${key}" class="${BTN_ERROR_CLASS} selectable">${value.toUpperCase()}</button>`,
  };
}

/**
 * @function renderLink
 * @parent i2web/models/rule-desc-parser
 *
 * Return an object that contains the property we are going
 * to match, with the HTML value we are going to substitute.
 * @param {Boolean} resolved Whether the object was resolved
 * @param {String} key The property to match in the rule template
 * @param {String} value The HTML to substitude for the property
 * in the rule template
 * @return {Object} The key in the template and the HTML string to substitute
 */
export function renderLink(resolved, key, value) {
  return {
    [key]: (resolved)
      ? `<a id="${key}" class="${RULE_CLASS}">${value}</a>`
      : `<a id="${key}" class="${RULE_CLASS} ${ERROR_CLASS}">${value}</a>`,
  };
}

/**
 * @function resolveOption
 * @parent i2web/models/rule-desc-parser
 *
 * Find the address of the option in the collection of its type stored on AppState.
 * Then using the value and property provided render the appropriate HTML using the
 * provided renderer.
 * @param {String} type The type of option, used to identify which collection to look in
 * @param {String} address The address of the device
 * @param {Function} renderer How to display the substituted value
 * @param {String} key The property name that will be substituted
 * @param {String} property The property used to acquire the value to render
 * @param {String}
 */
export function resolveOption(type, address, renderer, key, property) {
  const options = AppState().attr(type);
  const option = _.find(options, opt => opt['base:address'] === address);
  return (option) ? renderer(true, key, option[property]) : renderer(false, key, key);
}

/**
 * @function resolveGeneric
 * @parent i2web/models/rule-desc-parser
 *
 * Search through the options of the resolved rule template for find a value
 * to match up to the rule.
 * @param {Object} options The options returned by resolving the rule template
 * @param {String} key The property name that will be substituted
 * @param {String} val The value to substitute
 * @param {Function} renderer How to display the substituted value
 * @return {Object} The key in the template and the HTML string to substitute
 */
export function resolveGeneric(options, key, val, renderer) {
  let rendered = renderer(false, key, key);
  _.each(options, (opt) => {
    if (opt[1] === val) {
      rendered = renderer(true, key, opt[0]);
    }
  });
  return rendered;
}

/**
 * @function resolveContext
 * @parent i2web/models/rule-desc-parser
 *
 * Given the rule.rule:context, resolve any of the object addresses/ids to see if they
 * are available.
 * @param {Object} context The object containing the properties that need to be resolved.
 * @param {Function} renderer How to display the substituted value
 * @return {Array<Object>} An array of keys in the template and the HTML string to substitute
 */
export function resolveContext(context, renderer, selectors) {
  const resolved = _.map(context, (val, key) => {
    const type = val.split(':');
    const resolve = (type.length > 1) ? type[1] : val;
    switch (resolve) {
      case 'dev':
        return resolveOption('devices', val, renderer, key, 'dev:name');
      case 'person':
        return resolveOption('people', val, renderer, key, 'person:firstName');
      case 'scene':
        return resolveOption('scenes', val, renderer, key, 'scene:name');
      default:
        return (type.slice(0, 3) === 'sub')
          ? resolveOption('subsystems', val, renderer, key, 'subs:name')
          : resolveGeneric(selectors[key].options, key, val, renderer);
    }
  });
  return _.filter(resolved);
}

/**
 * @function pickTemplateProperties
 * @parent i2web/models/rule-desc-parser
 *
 * Given a rules context, or the selectors from a rule template's resolution: extract
 * only the properties from the object that are a part of the template.
 * @param {Object} fromObject The object containing the properties in the template
 * @param {i2web/models/rule-template} template The rule template
 * @return {Object}
 */
export function pickTemplateProperties(fromObject, template) {
  const templateText = template.attr('ruletmpl:template');
  const properties = templateText.match(/\${(\w|\s)+}/g).map((match) => {
    return match.slice(2, match.length - 1);
  }) || [];
  return _.pick(fromObject, properties);
}

/**
 * @function parseForListing
 * @parent i2web/models/rule-desc-parser
 *
 * Parse the rules templates description and fill in the template objects with
 * the appropriate HTML.
 * @param {Object} context The context of the rule
 * @param {i2web/models/rule-template} template The rule template
 * @return {Promise<String>} A promise that will resolve to the substituted rule description
 */
export function parseForListing(context, template) {
  const properties = pickTemplateProperties(context, template);
  return template.Resolve(AppState().attr('placeId')).then(({ selectors }) => {
    const values = resolveContext(properties, renderLink, selectors);
    const ruleTemplate = template['ruletmpl:template'];
    return substituteTemplateValues(ruleTemplate, values);
  });
}

/**
 * @function parseForAdding
 * @parent i2web/models/rule-desc-parser
 *
 * Parse the rules templates description and fill in the template objects with
 * the appropriate HTML.
 * @param {Object} selectors The list of potential values for each template argument
 * @param {i2web/models/rule-template} template The rule template
 * @return {Promise<String>} A promise that will resolve to the substituted rule description
 */
export function parseForAdding(selectors, template) {
  const substitutions = _.map(Object.keys(selectors.serialize()), (s) => {
    const resolved = (typeof selectors[s] === 'string') ? true : selectors[s].options.length > 0;
    return renderButton(resolved, s, s);
  });
  return new Promise((resolve) => {
    resolve(substituteTemplateValues(template['ruletmpl:template'], substitutions));
  });
}

/**
 * @function parseForEditing
 * @parent i2web/models/rule-desc-parser
 *
 * Parse the rules templates description and fill in the template objects with
 * the appropriate HTML.
 * @param {Object} context The context of the rule
 * @param {i2web/models/rule-template} template The rule template
 * @return {Promise<String>} A promise that will resolve to the substituted rule description
 */
export function parseForEditing(context, template) {
  const properties = pickTemplateProperties(context, template);
  return template.Resolve(AppState().attr('placeId')).then(({ selectors }) => {
    const values = resolveContext(properties, renderButton, selectors);
    const ruleTemplate = template['ruletmpl:template'];
    return substituteTemplateValues(ruleTemplate, values);
  });
}

/**
 * @function isResolved
 * @parent i2web/models/rule-desc-parser
 *
 * Can the rule resolve all of its template objects?
 * @param {String} description The rendered rule description
 * @return {Boolean} Whether the property of the template is resolved
 */
export function isResolved(description) {
  return (description.includes('<a') && !description.includes(`${ERROR_CLASS}`))
    || (description.includes('<button') && !description.includes(`${BTN_ERROR_CLASS}`));
}

export default {
  isResolved,
  parseForAdding,
  parseForEditing,
  parseForListing,
  pickTemplateProperties,
  renderButton,
  renderLink,
  resolveContext,
  resolveGeneric,
  resolveOption,
  substituteTemplateValues,
};
