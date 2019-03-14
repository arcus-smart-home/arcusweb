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
 * @module {canMap} i2web/models/rule-template Rule Template
 * @parent app.models
 *
 * @group i2web/models/rule-template.properties 0 properties
 *
 * Model of a rule template.
 */
import 'can-map-define';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import _ from 'lodash';

const BUTTON_RULE_DESCRIPTIONS = {
  'arm-on': {
    description: 'Set Security Alarm To On',
    hint: 'Alarm On',
    weight: 0,
  },
  disarm: {
    description: 'Set Security Alarm To Off',
    hint: 'Alarm Off',
    weight: 1,
  },
  'arm-partial': {
    description: 'Set Security Alarm To Partial',
    hint: 'Alarm Partial',
    weight: 2,
  },
  panic: {
    description: 'Trigger Panic Alarm',
    hint: 'Trigger Panic',
    weight: -1,
  },
  chime: {
    description: 'Play Chime',
    hint: 'Chime',
    weight: 3,
  },
  'activate-rule': {
    description: 'Activate A Rule',
    hint: 'Activate A Rule',
    weight: 4,
  },
};

const RuleTemplate = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} metadata i2web/models/rule-template.static.metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/rule-template.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'ruletmpl',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  define: {
    /**
     * @property {String} web:button:description
     * @parent i2web/models/rule-template.properties
     *
     * Description to be used for button rule templates.
     * Note this is not persisted to the model - read only
     */
    'web:button:description': {
      type: 'string',
      get() {
        const baseId = this.attr('base:id');
        let description = '';

        _.forEach(BUTTON_RULE_DESCRIPTIONS, (rule, name) => {
          if (baseId.indexOf(name) !== -1) {
            description = rule.description;
          }
        });

        return description;
      },
    },
    /**
     * @property {String} web:button:hint
     * @parent i2web/models/rule-template.properties
     *
     * Hint to be used for button rule templates.
     * Note this is not persisted to the model - read only
     */
    'web:button:hint': {
      type: 'string',
      get() {
        const baseId = this.attr('base:id');
        let hint = '';

        _.forEach(BUTTON_RULE_DESCRIPTIONS, (rule, name) => {
          if (baseId.indexOf(name) !== -1) {
            hint = rule.hint;
          }
        });

        return hint;
      },
    },
    /**
     * @property {Number} web:button:weight
     * @parent i2web/models/rule-template.properties
     *
     * Weight to sort the button rule templates by.
     * Note this is not persisted to the model - read only
     */
    'web:button:weight': {
      type: 'number',
      get() {
        const baseId = this.attr('base:id');
        let weight = 0;

        _.forEach(BUTTON_RULE_DESCRIPTIONS, (rule, name) => {
          if (baseId.indexOf(name) !== -1) {
            weight = rule.weight;
          }
        });

        return weight;
      },
    },
  },
});

export const RuleTemplateConnection = ModelConnection('ruletmpl', 'base:address', RuleTemplate);

export default RuleTemplate;
