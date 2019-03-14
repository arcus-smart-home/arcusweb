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

export default {
  scene: {
    instructions: 'Scenes can be scheduled to run at a set time. Start by clicking \'Add Event\' below, then set the time when this scene should run and the days it should occur.',
    messageType: 'scene:Fire',
    scheduleId: 'FIRE'
  },
  rule: {
    inactiveWhen: {
      messageType: 'rule:Disable'
    },
    instructions: 'Rules can be scheduled to run between certain time windows. Start by clicking \'Add Event\' below, then choose when you would like the rule to be active or inactive.',
    messageType: ['rule:Enable', 'rule:Disable'],
    scheduleId: 'RULES'
  },
  dev: {
    lightsnswitches: {
      attributes: ['dim:brightness', 'swit:state'],
      inactiveWhen: {
        'attributes.swit:state': 'OFF'
      },
      instructions: 'Automating Lights & Switches could lower your energy usage and save you money on monthly energy bills. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      messageType: 'base:SetAttributes',
      configurators: ['light'],
      scheduleId: 'LIGHT'
    },
    fan: {
      messageType: 'base:SetAttributes',
      attributes: ['swit:state', 'fan:speed'],
      instructions: 'Automating Fans could lower your energy usage and save you money on monthly energy bills. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      inactiveWhen: {
        'attributes.swit:state': 'OFF'
      },
      configurators: ['climate-fan'],
      scheduleId: 'CLIMATE'
    },
    vent: {
      messageType: 'base:SetAttributes',
      attributes: ['swit:state', 'vent:level'],
      instructions: 'Automating Vents could lower your energy usage and save you money on monthly energy bills. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      configurators: ['climate'],
      scheduleId: 'CLIMATE'
    },
    spaceheater: {
      messageType: 'base:SetAttributes',
      readOnlyAttributes: ['base:caps'],
      attributes: ['spaceheater:heatstate', 'spaceheater:setpoint'],
      instructions: 'Automating Space Heaters could lower your energy usage and save you money on monthly energy bills. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      inactiveWhen: {
        'attributes.spaceheater:heatstate': 'OFF'
      },
      configurators: ['climate-spaceheater'],
      scheduleId: 'CLIMATE'
    },
    garagedoor: {
      messageType: 'base:SetAttributes',
      attributes: ['motdoor:doorstate'],
      instructions: 'View and manage the Schedule for your garage door below. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      configurators: ['doors-garagedoor'],
      scheduleId: 'DOORS'
    },
    petdoor: {
      messageType: 'base:SetAttributes',
      attributes: ['petdoor:lockstate'],
      instructions: 'View and manage the Schedule for your pet door below. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      configurators: ['doors-petdoor'],
      scheduleId: 'DOORS'
    },
    waterheater: {
      messageType: 'base:SetAttributes',
      readOnlyAttributes: [],
      attributes: ['waterheater:setpoint'],
      instructions: 'View and manage the Schedule for your water heater below. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      configurators: ['waterheater'],
      scheduleId: 'WATER'
    },
    watervalve: {
      messageType: 'base:SetAttributes',
      attributes: ['valv:valvestate'],
      instructions: 'View and manage the Schedule for your water valve below. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      configurators: ['watervalve'],
      scheduleId: 'WATER'
    },
    thermostat: {
      messageType: 'base:SetAttributes',
      attributes: ['therm:coolsetpoint', 'therm:heatsetpoint'],
      instructions: 'Automating Thermostats could lower your energy usage and save you money on monthly energy bills. Get started by clicking \'Add Event\', then choose a state, time, and day(s) you would like this event to occur.',
      modes: {
        attribute: 'thing.therm:hvacmode',
        subheader: 'Toggle between each mode to view its events.',
        options: ['HEAT', 'COOL', 'AUTO']
      },
      scheduleId: ['HEAT', 'HEAT', 'AUTO']
    },
    irrigation: {
      instructions: 'View and manage the Schedule for your irrigation timer below. Get started by clicking \'Add Event\', then choose watering durations and a start time for your irrigation schedule.',
      subsystem: 'sublawnngarden',
      configurators: ['irrigation'],
      modes: {
        header: 'Watering Modes',
        subheader: 'Toggle between each mode to view its events.',
        attribute: function modeIrrigation() {
          const address = this.attr('thing.base:address');
          const attribute = `subsystem.sublawnngarden:scheduleStatus.${address}`;
          const enabled = this.attr(`${attribute}.enabled`);
          return (enabled) ? this.attr(`${attribute}.mode`) : 'WEEKLY';
        },
        options: ['WEEKLY', 'INTERVAL', 'EVEN', 'ODD'],
        help: {
          WEEKLY: 'Each day can have a different schedule.',
          INTERVAL: 'Set a custom length of time between waterings.',
          EVEN: 'Only water on even days of the month.',
          ODD: 'Only water on odd days of the month.',
          MANUAL: 'No watering schedule. Initiate watering manually.'
        }
      },
      scheduleId: ['WEEKLY', 'INTERVAL', 'EVEN', 'ODD'],
    }
  }
}