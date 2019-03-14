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
 * @module {Object} i2web/models/Indicator Indicator
 * @parent app.models.capabilities
 *
 * This capability is used by devices that have an indicator on them, like switches with an LED.  Often devices which have the Indicator capability will also have the Identify capability and blink the LED or something of that nature to identify the device.  Some devices allow the indicator to be disabled independent of the state of the device.  Often this is to remove unwanted light sources, when this is supported the
 */
export default {
  writeableAttributes: [
    /**
     * @property {boolean} indicator\:enabled
     *
     * Allows the indicator to be enabled or disabled.  Not all devices will support this attribute.
     *
     */
    'indicator:enabled',
    /**
     * @property {boolean} indicator\:inverted
     *
     * Indicates whether operation of the indicator should be inverted, if supported by the device. For example, turn indicator OFF when switch is ON, etc.
     *
     */
    'indicator:inverted',
  ],
  methods: {},
  events: {},
  INDICATOR_ON: 'ON',
  INDICATOR_OFF: 'OFF',
  INDICATOR_DISABLED: 'DISABLED',
};
