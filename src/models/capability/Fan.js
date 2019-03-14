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
 * @module {Object} i2web/models/Fan Fan
 * @parent app.models.capabilities
 *
 * Model of a fan control.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} fan\:speed
     *
     * Reflects the speed of the device. Also used to set the speed of the device.
     *
     */
    'fan:speed',
    /**
     * @property {enum} fan\:direction
     *
     * Reflects the direction of air flow through the fan.
     *
     */
    'fan:direction',
  ],
  methods: {},
  events: {},
  DIRECTION_UP: 'UP',
  DIRECTION_DOWN: 'DOWN',
};
