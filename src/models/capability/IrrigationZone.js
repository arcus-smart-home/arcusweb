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
 * @module {Object} i2web/models/IrrigationZone IrrigationZone
 * @parent app.models.capabilities
 *
 * Model of an Irrigation Zone.
 */
export default {
  writeableAttributes: [
    /**
     * @property {int} irr\:defaultDuration
     *
     * The default duration in minutes for scheduling this zone
     *
     */
    'irr:defaultDuration',
    /**
     * @property {string} irr\:zonename
     *
     * Name of the zone on the platform. (&#x27;front yard&#x27;, &#x27;roses&#x27;, etc.)
     *
     */
    'irr:zonename',
    /**
     * @property {enum} irr\:zonecolor
     *
     * Color used to represent the zone on the UI.
     *
     */
    'irr:zonecolor',
  ],
  methods: {},
  events: {},
  ZONESTATE_WATERING: 'WATERING',
  ZONESTATE_NOT_WATERING: 'NOT_WATERING',
  WATERINGTRIGGER_MANUAL: 'MANUAL',
  WATERINGTRIGGER_SCHEDULED: 'SCHEDULED',
  ZONECOLOR_LIGHTRED: 'LIGHTRED',
  ZONECOLOR_DARKRED: 'DARKRED',
  ZONECOLOR_ORANGE: 'ORANGE',
  ZONECOLOR_YELLOW: 'YELLOW',
  ZONECOLOR_LIGHTGREEN: 'LIGHTGREEN',
  ZONECOLOR_DARKGREEN: 'DARKGREEN',
  ZONECOLOR_LIGHTBLUE: 'LIGHTBLUE',
  ZONECOLOR_DARKBLUE: 'DARKBLUE',
  ZONECOLOR_VIOLET: 'VIOLET',
  ZONECOLOR_WHITE: 'WHITE',
  ZONECOLOR_GREY: 'GREY',
  ZONECOLOR_BLACK: 'BLACK',
};
