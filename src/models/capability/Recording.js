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
 * @module {Object} i2web/models/Recording Recording
 * @parent app.models.capabilities
 *
 * Base attributes and methods for recordings
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} video\:name
     *
     * Human readable name for the device
     *
     */
    'video:name',
  ],
  methods: {
    /**
     * @function View
     *
     * Used to retrieve URLs that can be used for viewing this recording.
     *
     * @return {Promise}
     */
    View() {
      return Bridge.request('video:View', this.GetDestination(), {});
    },
    /**
     * @function Download
     *
     * Used to retrieve URLs that can be used for viewing this recording.
     *
     * @return {Promise}
     */
    Download() {
      return Bridge.request('video:Download', this.GetDestination(), {});
    },
    /**
     * @function Delete
     *
     * Marks this recording for deletion.
     *
     * @return {Promise}
     */
    Delete() {
      return Bridge.request('video:Delete', this.GetDestination(), {});
    },
    /**
     * @function Resurrect
     *
     * Deprecated since 2018.07: Resurrects this recording if possible.
     *
     * @return {Promise}
     */
    Resurrect() {
      return Bridge.request('video:Resurrect', this.GetDestination(), {});
    },
  },
  events: {},
  TYPE_STREAM: 'STREAM',
  TYPE_RECORDING: 'RECORDING',
};
