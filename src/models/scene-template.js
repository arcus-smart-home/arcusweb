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
 * @module {canMap} i2web/models/scene-template Scene Template
 * @parent app.models
 *
 * @group i2web/models/scene-template.properties 0 properties
 *
 * Model of a scene template.
 */
import 'can-map-define';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';

const SceneTemplate = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} metadata i2web/models/scene-template.static.metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/scene-template.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'scenetmpl',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {});

export const SceneTemplateConnection = ModelConnection('scenetmpl', 'base:address', SceneTemplate);

export default SceneTemplate;
