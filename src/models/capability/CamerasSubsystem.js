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
 * @module {Object} i2web/models/CamerasSubsystem CamerasSubsystem
 * @parent app.models.capabilities
 *
 * Cameras Subsystem
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} subcameras\:maxSimultaneousStreams
     *
     * An estimate of how many simultaneous streams can be supported.  NOTE: While this is currently r/w for testing purposes, it will likely be made read-only in the future and should not be directly exposed as a writable attribute to the end-user.
     *
     */
    'subcameras:maxSimultaneousStreams',
  ],
  methods: {},
  events: {},

};
