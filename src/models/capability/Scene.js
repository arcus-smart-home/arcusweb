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
 * @module {Object} i2web/models/Scene Scene
 * @parent app.models.capabilities
 *
 * Model of a scene, which is a specific instance of a SceneTemplate with context necessary for evaluation
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} scene\:name
     *
     * The name of the scene
     *
     */
    'scene:name',
    /**
     * @property {boolean} scene\:notification
     *
     * Whether or not a notification should be fired when this scene is executed.
     *
     */
    'scene:notification',
    /**
     * @property {list<Action>} scene\:actions
     *
     * The actions associated with this scene.
     *
     */
    'scene:actions',
  ],
  methods: {
    /**
     * @function Fire
     *
     * Executes the scene
     *
     * @return {Promise}
     */
    Fire() {
      return Bridge.request('scene:Fire', this.GetDestination(), {});
    },
    /**
     * @function Delete
     *
     * Deletes the scene
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('scene:Delete', this.GetDestination(), {});
    },
  },
  events: {},
  LASTFIRESTATUS_NOTRUN: 'NOTRUN',
  LASTFIRESTATUS_SUCCESS: 'SUCCESS',
  LASTFIRESTATUS_FAILURE: 'FAILURE',
  LASTFIRESTATUS_PARTIAL: 'PARTIAL',
};
