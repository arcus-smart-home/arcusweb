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

// import _cloneDeep from 'lodash/cloneDeep';
// import scheduleData from 'i2web/models/fixtures/data/schedule.json';
export default {
  init() {
    return {
      address: 'SERV:scheduler',
      'scheduler:ScheduleWeeklyCommand': function schedulerScheduleWeeklyCommand() {
        return {
          messageType: 'scheduler:ScheduleWeeklyCommandResponse',
          attributes: {
            commandId: 'b4224d81-eac3-4b06-8f28-288ebc5b1ea3',
            schedulerAddress: 'SERV:scheduler:e463de37-8f3e-4ac5-9163-2099396af377',
          },
        };
      },
      'scheduler:UpdateWeeklyCommand': function schedulerScheduleWeeklyCommand() {
        return {
          messageType: 'EmptyMessage',
          attributes: {},
        };
      },
      'scheduler:DeleteCommand': function schedulerScheduleWeeklyCommand() {
        return {
          messageType: 'EmptyMessage',
          attributes: {},
        };
      },
    };
  },
};
