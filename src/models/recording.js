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
 * @module {canMap} i2web/models/recording Recording
 * @parent app.models
 *
 * Model of a video recording.
 */
import 'can-map-define';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import moment from 'moment';

const Recording = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} i2web/models/recording.static.metadata metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/recording.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'video',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  define: {
    /**
    * @property {string} web:day
    * @parent i2web/models/recording
    * @description The day timestamp of this recording
    */
    'web:day': {
      get() {
        return `${moment(this.attr('video:timestamp')).startOf('day').valueOf()}`;
      },
    },
  },
});

export const RecordingConnection = ModelConnection('video', 'base:address', Recording);
Recording.connection = RecordingConnection;

export default Recording;
