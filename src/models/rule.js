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
 * @module {canMap} i2web/models/rule Rule
 * @parent app.models
 *
 * @group i2web/models/rule.properties 0 properties
 *
 * Model of a rule.
 */
import 'can-map-define';
import { ModelConnection } from './base';
import RuleTemplate from 'i2web/models/rule-template';
import { isResolved, parseForListing } from './rule-desc-parser';
import RuleCapability from 'i2web/models/capability/Rule';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import Errors from 'i2web/plugins/errors';

const Rule = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} metadata i2web/models/rule.static.metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/rule.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'rule',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  define: {
    /**
     * @property {Boolean} isActive
     * @parent i2web/models/rule
     *
     * Is the rule active?
     */
    isActive: {
      type: 'boolean',
      get() {
        return this.attr('rule:state') === RuleCapability.STATE_ENABLED;
      },
    },
    /**
     * @property {Boolean} isResolved
     * @parent i2web/models/rule
     *
     * Is the associated rule template able to resolve?
     */
    isResolved: {
      type: 'boolean',
      get() {
        const description = this.attr('ruleDescription');
        return (description) ? isResolved(description) : false;
      },
    },
    /**
     * @property {canMap} rule:context
     * @parent i2web/models/rule
     *
     * Adding this get (a compute) sets up the bindings so that ruleDescription is recalculated
     * when rule:context changes. For some reason (need to ask Justin), the getter for ruleDescription
     * is wrapped by Observation.ignore.
     *
     * TODO: Talk to Justin about the correct way to do this pattern, or rather the pattern for
     * ruleDescription so that we don't have to add a compute for a dependant property.
     */
    'rule:context': {
      get(context) { return context; },
    },
    /**
     * @property {String} ruleDescription
     * @parent i2web/models/rule
     *
     * Can the rule resolve all of its template objects?
     */
    ruleDescription: {
      type: 'string',
      value: '',
      get(_, setValueTo) {
        // Bind to 'rule:state' changes so that when a device is removed, the state will be changed,
        // and the description will be rerended.
        this.attr('rule:state');
        const template = this.attr('ruleTemplate');
        const context = this.attr('rule:context');
        if (!template) {
          setValueTo(this.attr('rule:description'));
        } else {
          parseForListing(context, template)
            .then(desc => setValueTo(desc))
            .catch(e => Errors.log(e, true));
        }
      },
    },
    /**
     * @property {i2web/models/rule-template} ruleTemplate
     * @parent i2web/models/rule
     *
     * The template associated with this rule
     */
    ruleTemplate: {
      Type: RuleTemplate,
    },
  },
  /**
   * @function toggleActive
   *
   * Based on the state of the rule, toggles the rule active or inactive.
   */
  toggleActive() {
    if (this.attr('isActive')) {
      this.Disable().catch(e => Errors.log(e, true));
    } else {
      this.Enable().catch((e) => {
        this.attr('rule:state', RuleCapability.STATE_ENABLED);
        this.attr('rule:state', RuleCapability.STATE_DISABLED);
        if (e.code === 'request.invalid') {
          e.message = 'This rule may only be enabled for premium accounts';
        }
        Errors.log(e, true);
      });
    }
  },
});

export const RuleConnection = ModelConnection('rule', 'base:address', Rule);

export default Rule;
