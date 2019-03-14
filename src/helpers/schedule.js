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

import stache from 'can-stache';
import moment from 'moment';
import 'moment-timezone';
import tz from 'jstz';
import isEmptyObject from 'can-util/js/is-empty-object/';
import Device from 'i2web/models/device';
import ThermostatCapability from 'i2web/models/capability/Thermostat';
import schedulersForIrrigation, { hasIrrigationEvents, irrigationScheduleStatus } from 'i2web/components/schedule/irrigation-schedulers';
import schedulersFor from 'i2web/components/schedule/device-schedulers';
import _find from 'lodash/find';

// Details see here https://eyeris.atlassian.net/browse/ITWO-9465
stache.registerHelper('scheduleIconOf', function isScheduled(thing, mode) {
  const schedulers = schedulersFor(thing);
  const scheduler = schedulers.attr('length') > 0 && schedulers.attr('0');

  // stache helpers get a 'context' argument by default, make sure we got
  // an string and not the implicit argument
  let type = (typeof mode === 'string') ? mode : undefined;

  let hasEvents = false;
  if (thing instanceof Device && thing.hasCapability('irrsched')) {
    hasEvents = hasIrrigationEvents(thing, type);
    if (!type) {
      const schedStatus = irrigationScheduleStatus(thing);
      type = (schedStatus && schedStatus.attr('enabled'))
        ? schedStatus.attr('mode')
        : undefined;
    }
  } else {
    hasEvents = scheduler
      && scheduler.attr('scheduler:commands')
      && !isEmptyObject(scheduler.attr('scheduler:commands').attr());
  }

  // when mode is passed in, return the filled-in calendar if the mode
  // has scheduled events, return the hollow calendar otherwise
  if (type) {
    return hasEvents ? 'icon-app-calendar-1' : 'icon-app-calendar-2';
  }

  const isFollowed = scheduler && scheduler.attr('isFollowed');
  if (isFollowed && hasEvents) return 'icon-app-calendar-1';
  // has events but not following the schedule
  return hasEvents ? 'icon-app-calendar-3' : 'icon-app-calendar-2';
});

stache.registerHelper('schedulerModeDescription', function schedulerMode(thing, mode) {
  if (thing instanceof Device && thing.hasCapability('therm') && mode === ThermostatCapability.HVACMODE_AUTO) {
    return thing.attr('web:therm:autoDescription');
  }
  return mode;
});

stache.registerHelper('nextScheduledEvent', function nextScheduledEvent(thing, options) {
  let schedulers = schedulersFor(thing);
  const scheduleCount = schedulers.attr('length');

  if (thing instanceof Device && thing.hasCapability('irrsched')) {
    const component = 'arcus-device-panel-status-irrigationController';
    const renderer = stache(`<${component} {device}="thing" />`);
    schedulers = schedulersForIrrigation(thing);
    return (schedulers && schedulers.length)
      ? renderer({ thing }, options.helpers, options.nodeList)
      : '';
  }

  const scheduler = scheduleCount > 0 && schedulers.attr('0');
  const isFollowed = scheduler && scheduler.attr('isFollowed');
  let hasEvents = scheduler && scheduler.attr('scheduler:commands') && !isEmptyObject(scheduler.attr('scheduler:commands').attr());
  const scheduledTime = scheduler && scheduler.attr('scheduler:nextFireTime');

  if (!isFollowed && !hasEvents) {
    return '';
  }

  if (!isFollowed) {
    return 'Schedule is off';
  }

  // We are not able to accurately predict the next scheduled item for thermostat devices turned OFF, because
  // we don't know what state the user will put it in, so we prompt the user to turn the thermostat
  // on to get around that. Furthermore, scheduler:nextFireTime will not be accurate if thermostat is
  // set in a mode that lacks any scheduled events.
  if (thing instanceof Device && thing.hasCapability('therm')) {
    if (thing.attr('therm:hvacmode') === 'OFF') {
      return 'Next Event: Turn on Thermostat to view';
    } else if (scheduler && hasEvents) {
      hasEvents = _find(scheduler.attr('scheduler:commands'), (cmd) => {
        return cmd.scheduleId === thing.attr('therm:hvacmode');
      });
    }
  }

  if (hasEvents && scheduledTime) {
    const scheduledTimeMoment = moment.tz(scheduledTime, tz.determine().name());

    // Jan 4 5:00 PM
    let formattedTime = scheduledTimeMoment.format('MMM D h:mm A');
    let scheduleDescription = '';
    const today = moment();
    const tomorrow = moment().add(1, 'day');
    const nextWeek = moment().add(1, 'week');

    if (scheduledTimeMoment.isSame(today, 'day')) {
      // Today 2:30 AM
      formattedTime = `Today ${scheduledTimeMoment.format('h:mm A')}`;
    } else if (scheduledTimeMoment.isSame(tomorrow, 'day')) {
      // Tomorrow 6:23 PM
      formattedTime = `Tomorrow ${scheduledTimeMoment.format('h:mm A')}`;
    } else if (!scheduledTimeMoment.isAfter(nextWeek)) {
      // Within the next week - Thu 6:50 PM
      formattedTime = scheduledTimeMoment.format('ddd h:mm A');
    }

    scheduleDescription = scheduler.attr('nextCommandDescriptionTerse');

    return `Next Event: ${scheduleDescription ? `${scheduleDescription} ` : ''}${formattedTime}`;
  }
  return '';
});
