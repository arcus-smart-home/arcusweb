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

import temperatureConverter from 'i2web/plugins/temperature-converter';

export default {
  'temperature:auto': {
    verbose() {
      const heatSetPoint = temperatureConverter(this.attr('attributes.therm:heatsetpoint'), 'F');
      const coolSetPoint = temperatureConverter(this.attr('attributes.therm:coolsetpoint'), 'F');

      return `${heatSetPoint}&deg; - ${coolSetPoint}&deg;`;
    },
    terse() {
      const heatSetPoint = temperatureConverter(this.attr('attributes.therm:heatsetpoint'), 'F');
      const coolSetPoint = temperatureConverter(this.attr('attributes.therm:coolsetpoint'), 'F');

      return `${heatSetPoint}&deg; - ${coolSetPoint}&deg;`;
    },
  },
  'temperature:heat': {
    verbose() {
      const heatSetPoint = temperatureConverter(this.attr('attributes.therm:heatsetpoint'), 'F');

      return `Heat to ${heatSetPoint}&deg;`;
    },
    terse() {
      const heatSetPoint = temperatureConverter(this.attr('attributes.therm:heatsetpoint'), 'F');

      return `${heatSetPoint}&deg;`;
    },
  },
  'temperature:cool': {
    verbose() {
      const coolSetPoint = temperatureConverter(this.attr('attributes.therm:coolsetpoint'), 'F');

      return `Cool to ${coolSetPoint}&deg;`;
    },
    terse() {
      const coolSetPoint = temperatureConverter(this.attr('attributes.therm:coolsetpoint'), 'F');

      return `${coolSetPoint}&deg;`;
    },
  },
  'climate:climate': {
    verbose() {
      if (this.attr('attributes.fan:speed') !== undefined) {
        return undefined;
      } else if (this.attr('attributes.spaceheater:setpoint') !== undefined) {
        const setPoint = temperatureConverter(this.attr('attributes.spaceheater:setpoint'), 'F');

        if (this.attr('attributes.spaceheater:heatstate') === 'OFF') {
          return 'Off';
        }

        return `${setPoint}&deg;`;
      }

      return undefined;
    },
    terse() {
      if (this.attr('attributes.fan:speed') !== undefined) {
        return undefined;
      } else if (this.attr('attributes.spaceheater:setpoint') !== undefined) {
        const setPoint = temperatureConverter(this.attr('attributes.spaceheater:setpoint'), 'F');

        if (this.attr('attributes.spaceheater:heatstate') === 'OFF') {
          return 'Off';
        }

        return `${setPoint}&deg;`;
      }

      return undefined;
    },
  },
};
