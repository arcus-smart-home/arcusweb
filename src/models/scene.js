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
 * @module {canMap} i2web/models/scene Scene
 * @parent app.models
 *
 * @group i2web/models/scene.properties 0 properties
 *
 * Model of a scene.
 */
import 'can-map-define';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import makeCloneable from 'i2web/connections/cloneable';

const Scene = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} metadata i2web/models/scene.static.metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/scene.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'scene',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  define: {
    /**
     * @property {Object} icon
     * @parent i2web/models/scene
     *
     * The icon of the scene and whether it is a class or a URL
     */
    icon: {
      get() {
        const icon = (function determineIcon(template) {
          switch (template) {
            case 'away' : return 'icon-app-door-2';
            case 'custom' : return 'icon-app-scene-2';
            case 'home' : return 'icon-platform-home-2';
            case 'morning' : return 'icon-app-sun-2';
            case 'night' : return 'icon-app-night-2';
            case 'switches' : return 'icon-platform-light-2';
            case 'vacation' : return 'icon-app-work-2';
            default : return 'icon-app-scene-2';
          }
        }(this.attr('scene:template')));

        return {
          type: 'icon',
          value: icon,
        };
      },
    },
  },
});

export const SceneConnection = ModelConnection('scene', 'base:address', Scene);
Scene.connection = SceneConnection;
makeCloneable(Scene);

export default Scene;
