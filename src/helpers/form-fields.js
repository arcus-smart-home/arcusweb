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

import 'can-stache-bindings';
import stache from 'can-stache';
import Observation from 'can-observation';
import uniqueId from 'i2web/plugins/unique-id';

const formatValidationError = (fieldName, key, message) => {
  // If the fieldName is already prepended to the messsage, just return the message as is
  if (fieldName && message.toLowerCase().indexOf(fieldName.toLowerCase()) === 0) return message;

  // special case for equality
  if (message.toLowerCase().indexOf('do not match') !== -1) return message;

  // If the key name is prepended, strip that off and prepend the field name instead
  // TODO change __ to dot once fields are updated
  const keyAsFieldName = key.replace(/__/g, ' ').replace(/([A-Z])/g, ' $1');
  if (message.toLowerCase().indexOf(keyAsFieldName.toLowerCase()) === 0) {
    message = message.slice((keyAsFieldName.length + 1)); // eslint-disable-line no-param-reassign
  }

  return `${fieldName} ${message}`.trim();
};

// TODO temporarily disabiling until we can fix attributes binding
// const textInputTemplate = stache(`
//   <div class="input-wrapper {{class}} {{#if _validationErrors[key]}} is-invalid{{/if}}">
//     <input type="{{type}}" id="{{id}}" data-key="{{key}}" class="{{key}}" {($value)}="{{key}}" {{attributes}} />
//     <label for="{{id}}">{{title}}</label>
//     {{#if _validationErrors[key][0]}}
//       <p class="error">{{formatValidationError(title, _validationErrors[key][0])}}</p>
//     {{/if}}
//   </div>
// `);
// ***NOTE: long term this helper should be replaced with a proper component.
stache.registerHelper('textInput', Observation.ignore(function textInput(key, title, optionalParams, options) {
  if (arguments.length < 4) {
    options = optionalParams; // eslint-disable-line no-param-reassign
    optionalParams = {};      // eslint-disable-line no-param-reassign
  }

  // TODO replace __ with . when supported and remove replacement
  const objectDelimiter = '__';
  key = key.replace(/\./g, objectDelimiter); // eslint-disable-line no-param-reassign

  const boundKey = key;
  // evalue context compute if it is one
  const context = typeof options.context === 'function' ? options.context() : options.context;
  const scope = Object.assign({
    title,
    key,
    boundKey,
    type: 'text',
    attributes: null,
    class: null,
    id: uniqueId(key),
    _validationErrors: context.compute('_validationErrors'),
    formatValidationError,
  }, optionalParams);
  scope[key] = context.compute(key);

  // handle keys written like 'objKey.subKey'
  if (boundKey.includes(objectDelimiter)) {
    const parts = boundKey.split(objectDelimiter);
    const baseObject = parts.shift();
    scope.boundKey = `${baseObject}`;
    parts.forEach((part) => {
      const isNumeric = !isNaN(part);
      scope.boundKey += (isNumeric ? `[${part}]` : `['${part}']`);
    });
    scope[baseObject] = context.compute(baseObject);
  } else { // non-nested keys should still be scoped to the current context to allow for handling of characters like ':' in keys
    scope.boundKey = `['${scope.boundKey}']`;
  }

  const attrs = scope.attributes;
  return stache(`
    <div class="input-wrapper{{#if _validationErrors[key]}} is-invalid{{/if}}">
      <input type="{{type}}" id="{{id}}" data-key="{{key}}" class="{{key}} {{class}}" {($value)}="{{boundKey}}" ${attrs || ''} />
      <label for="{{id}}">{{title}}</label>
      {{#if _validationErrors[key][0]}}
        <p class="error">{{formatValidationError(title, key, _validationErrors[key][0])}}</p>
      {{/if}}
    </div>
  `)(scope);
}));

// TODO temporarily disabiling until we can fix attributes binding
// const textAreaTemplate = stache(`
//   <div class="input-wrapper {{class}} {{#if _validationErrors[key]}} is-invalid{{/if}}">
//     <textarea id="{{id}}" data-key="{{key}}" class="{{key}}" {($value)}="{{key}}" {{attributes}}  />
//     <label for="{{id}}">{{title}}</label>
//     {{#if _validationErrors[key][0]}}
//       <p class="error">{{formatValidationError(title, _validationErrors[key][0])}}</p>
//     {{/if}}
//   </div>
// `);
stache.registerHelper('textArea', Observation.ignore(function textArea(key, title, optionalParams, options) {
  if (arguments.length < 4) {
    options = optionalParams; // eslint-disable-line no-param-reassign
    optionalParams = {};      // eslint-disable-line no-param-reassign
  }

  // TODO replace __ with . when supported and remove replacement
  const objectDelimiter = '__';
  key = key.replace(/\./g, objectDelimiter); // eslint-disable-line no-param-reassign

  const boundKey = key;
  const scope = Object.assign({
    title,
    key,
    boundKey,
    attributes: null,
    class: null,
    id: uniqueId(key),
    _validationErrors: options.context.compute('_validationErrors'),
    formatValidationError,
  }, optionalParams);
  scope[key] = options.context.compute(key);

  if (boundKey.includes(objectDelimiter)) {
    const parts = boundKey.split(objectDelimiter);
    const baseObject = parts.shift();
    scope.boundKey = `${baseObject}`;
    parts.forEach((part) => {
      const isNumeric = !isNaN(part);
      scope.boundKey += (isNumeric ? `[${part}]` : `['${part}']`);
    });
    scope[baseObject] = options.context.compute(baseObject);
  }

  return stache(`
    <div class="input-wrapper{{#if _validationErrors[key]}} is-invalid{{/if}}{{#if class}} {{class}}{{/if}}">
      <textarea id="{{id}}" data-key="{{key}}" class="{{key}}" {($value)}="{{boundKey}}" ${scope.attributes}  />
      <label for="{{id}}">{{title}}</label>
      {{#if _validationErrors[key][0]}}
        <p class="error">{{formatValidationError(title, key, _validationErrors[key][0])}}</p>
      {{/if}}
    </div>
  `)(scope);
}));

// TODO replace these helpers with components
stache.registerHelper('selectInput', Observation.ignore(function selectInput(key, title, optionalParams, options) {
  if (arguments.length < 4) {
    options = optionalParams; // eslint-disable-line no-param-reassign
    optionalParams = {};      // eslint-disable-line no-param-reassign
  }

  // TODO replace __ with . when supported and remove replacement
  const objectDelimiter = '__';
  key = key.replace(/\./g, objectDelimiter); // eslint-disable-line no-param-reassign

  const boundKey = key;
  const context = typeof options.context === 'function' ? options.context() : options.context;
  const scope = Object.assign({
    title,
    key,
    boundKey,
    allowSearch: false,
    attributes: null,
    class: null,
    placeholder: null,
    id: uniqueId(key),
    _validationErrors: context.compute('_validationErrors'),
    formatValidationError,
    optionsRenderer: () => options.fn({}),
  }, optionalParams);
  scope[key] = context.compute(key);

  if (boundKey.includes(objectDelimiter)) {
    const parts = boundKey.split(objectDelimiter);
    const baseObject = parts.shift();
    scope.boundKey = `${baseObject}`;
    parts.forEach((part) => {
      const isNumeric = !isNaN(part);
      scope.boundKey += (isNumeric ? `[${part}]` : `['${part}']`);
    });
    scope[baseObject] = context.compute(baseObject);
  }

  return stache(`
    <div class="dropdown-wrapper{{#if _validationErrors[key]}} is-invalid{{/if}}">
      <label for="{{id}}">{{title}}</label>
      {{#if _validationErrors[key][0]}}
        <p class="error">{{formatValidationError(title, key, _validationErrors[key][0])}}</p>
      {{/if}}
      <select id="{{id}}" data-key="{{key}}" {($value)}="{{boundKey}}" class="dropdown{{#if allowSearch}} search{{/if}} {{class}}" ${scope.attributes} semantic-dropdown {{#if allowSearch}}full-text-search="exact"{{/if}}>
        {{#if placeholder}}<option value="">{{placeholder}}</option>{{/if}}
        {{>optionsRenderer}}
      </select>
    </div>
  `)(scope);
}));
