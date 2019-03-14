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
 * @module {Object} i2web/models/SceneTemplate SceneTemplate
 * @parent app.models.capabilities
 *
 * Model of a scene template
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Create
     *
     * Creates a scene instance from a given scene template
     *
     * @param {string} placeId The platform-owned identifier for the place at which the scene is being created
     * @param {string} [name] Default: Name of the scene template.  The name assigned to the scene, defaults to the template name.
     * @param {list<Action>} [actions] Default: Empty list.  A list of Actions for the scene to execute
     * @return {Promise}
     */
    Create(placeId, name, actions) {
      return Bridge.request('scenetmpl:Create', this.GetDestination(), {
        placeId,
        name,
        actions,
      });
    },
    /**
     * @function ResolveActions
     *
     * Resolves the actions that are applicable to a scene template.
     *
     * @param {string} placeId The place id of the scene to resolve.
     * @return {Promise}
     */
    ResolveActions(placeId) {
      return Bridge.request('scenetmpl:ResolveActions', this.GetDestination(), {
        placeId,
      });
    },
  },
  events: {},

};
