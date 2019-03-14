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
 * @module {Object} i2web/models/SoilMoisture SoilMoisture
 * @parent app.models.capabilities
 *
 * Model of water content within soil.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} soilmoisture\:soiltype
     *
     * Reflects the type of soil in which the water content is being measured. Defaults to NORMAL.
     *
     */
    'soilmoisture:soiltype',
  ],
  methods: {},
  events: {},
  SOILTYPE_NORMAL: 'NORMAL',
  SOILTYPE_SANDY: 'SANDY',
  SOILTYPE_CLAY: 'CLAY',
};
