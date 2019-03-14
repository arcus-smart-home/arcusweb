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
 * @module {Object} i2web/cornea/property-aliases Property aliases
 * @parent app.cornea
 *
 * Aliasing/Unaliasing of property names for objects that are sent
 * and received from the Arcus platform.
 *
 * These were needed because rules contains properties that are reserved
 * by CanJS (like 'on'). So the alias an unalias properties have
 * properties that are the names of messages, the value of which is a
 * 'transform' function that takes the objects and preforms a
 * transformation on it.
 */
export default {
  alias: {
    'rule base:Added': function ruleBaseAdded(o) {
      if (o['rule:context'].on) {
        o['rule:context'].ON = o['rule:context'].on;
        delete o['rule:context'].on;
      }
    },
    'rule base:ValueChange': function ruleBaseValueChange(o) {
      if (o['rule:context'] && o['rule:context'].on) {
        o['rule:context'].ON = o['rule:context'].on;
        delete o['rule:context'].on;
      }
    },
    'rule:ListRuleTemplates': function ruleListRuleTemplates(obj) {
      obj.ruleTemplates.forEach((o) => {
        o['ruletmpl:template'] =
          o['ruletmpl:template'].replace(/(\${on})/g, '${ON}'); // eslint-disable-line no-template-curly-in-string
      });
    },
    'rule:ListRules': function ruleListRules(obj) {
      obj.rules.forEach((o) => {
        if (o['rule:context'].on) {
          o['rule:context'].ON = o['rule:context'].on;
          delete o['rule:context'].on;
        }
      });
    },
    'ruletmpl:Resolve': function ruletmplResolve(obj) {
      if (obj.selectors.on) {
        obj.selectors.ON = obj.selectors.on;
        delete obj.selectors.on;
      }
    },
  },
  unalias: {
    'rule:UpdateContext': function ruleUpdateContext(obj) {
      if (obj.ON) {
        obj.on = obj.ON;
        delete obj.ON;
      }
    },
    'ruletmpl:CreateRule': function ruletmplCreateRule(obj) {
      if (obj.ON) {
        obj.on = obj.ON;
        delete obj.ON;
      }
    },
  },
};
