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

import Scheduler from 'i2web/models/scheduler';
import AppState from 'i2web/plugins/get-app-state';

// https://eyeris.atlassian.net/browse/I2-1462
export default function schedulersForIrrigation(thing, mode) {
  const subsystems = AppState().attr('subsystems');
  if (subsystems) {
    const address = thing.attr('base:address');
    const lawngarden = subsystems.findByName('sublawnngarden');
    const modes = (mode) ? [mode.toLowerCase()] : ['weekly', 'interval', 'even', 'odd'];
    return modes.map((m) => {
      const schedules = lawngarden.attr(`sublawnngarden:${m}Schedules.${address}`);
      return new Scheduler(schedules || {});
    });
  }
  return [new Scheduler({})];
}

export function irrigationScheduleStatus(device) {
  const subsystems = AppState().attr('subsystems');
  if (subsystems) {
    const lawngarden = subsystems.findByName('sublawnngarden');
    return lawngarden
      .attr('sublawnngarden:scheduleStatus')
      .attr(device.attr('base:address'));
  }
  return undefined;
}

export function hasIrrigationEvents(thing, mode) {
  const schedulers = schedulersForIrrigation(thing, mode);
  const events = (mode)
    ? schedulers[0].attr('events.length')
    : schedulers.reduce((acc, s) => acc + ((s.events && s.events.length) || 0), 0);
  return schedulers.length ? !!events : false;
}
