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
 * @module {Object} i2web/models/Color Color
 * @parent app.models.capabilities
 *
 * Model of the color setting for a device.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} color\:hue
     *
     * Reflects the current hue or for lack of a better word color. May also be used to set the hue. Range is 0-360 angular degrees.
     *
     */
    'color:hue',
    /**
     * @property {int} color\:saturation
     *
     * The saturation or intensity of the hue. Lower values result in less intensity (more gray) and higher values result in a more intense hue (less gray). May also be used to set the saturation.
     *
     */
    'color:saturation',
  ],
  methods: {},
  events: {},

};
