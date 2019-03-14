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

import Bridge from 'i2web/cornea/bridge';

/**
 * @module {Object} i2web/models/RuleTemplate RuleTemplate
 * @parent app.models.capabilities
 *
 * Model of a rule template
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function CreateRule
     *
     * Creates a rule instance from a given rule template
     *
     * @param {string} placeId The platform-owned identifier for the place at which the rule is being created
     * @param {string} name The name assigned to the rule
     * @param {string} [description] The user provided description of the rule
     * @param {Object} context The context (user selections) for the rule
     * @return {Promise}
     */
    CreateRule(placeId, name, description, context) {
      return Bridge.request('ruletmpl:CreateRule', this.GetDestination(), {
        placeId,
        name,
        description,
        context,
      });
    },
    /**
     * @function Resolve
     *
     * Resolves the parameters for the template at a given place
     *
     * @param {string} placeId The platform-owned identifier for the place at which to resovle the template parameters
     * @return {Promise}
     */
    Resolve(placeId) {
      return Bridge.request('ruletmpl:Resolve', this.GetDestination(), {
        placeId,
      });
    },
  },
  events: {},

};
