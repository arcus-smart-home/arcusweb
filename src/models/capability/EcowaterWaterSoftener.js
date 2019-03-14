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
 * @module {Object} i2web/models/EcowaterWaterSoftener EcowaterWaterSoftener
 * @parent app.models.capabilities
 *
 * Model of an Ecowater Water Softener which monitors water usage.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} ecowater\:continuousDuration
     *
     * Number of seconds where flow must meet or exceed continuousRate before continuousUse will be marked true
     *
     */
    'ecowater:continuousDuration',
    /**
     * @property {double} ecowater\:continuousRate
     *
     * Flow threshold in gallons per minute used to determine continuousUse
     *
     */
    'ecowater:continuousRate',
    /**
     * @property {boolean} ecowater\:alertOnContinuousUse
     *
     * Indicates whether the user wants to receive continuous use notifications
     *
     */
    'ecowater:alertOnContinuousUse',
    /**
     * @property {boolean} ecowater\:alertOnExcessiveUse
     *
     * Indicates whether the user wants to receive excessive use notifications
     *
     */
    'ecowater:alertOnExcessiveUse',
  ],
  methods: {},
  events: {},

};
