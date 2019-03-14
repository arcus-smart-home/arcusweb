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

import _isEqual from 'lodash/isEqual';
import Component from 'can-component';
import CanList from 'can-list';
import CanMap from 'can-map';
import 'can-map-define';
import Device from 'i2web/models/device';
import Subsystem from 'i2web/models/subsystem';
import { fromDeviceToPlaceTimezone } from 'i2web/components/schedule/from-to-timezones';
import { formatDuration } from 'i2web/helpers/global';
import Notifications from 'i2web/plugins/notifications';
import view from './irrigation-event.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Boolean} allZonesSelected
     * @parent i2web/components/schedule/irrigation-event
     * @description Toggle state for Select All
     */
    allZonesSelected: {
      type: 'boolean',
      get() {
        const zoneCount = this.attr('device.web:irr:zones.length');
        return this.attr('irrigationZonesScheduled.length') === zoneCount;
      },
    },
    /**
     * @property {Boolean} daysError
     * @parent i2web/components/schedule/irrigation-event
     * @description Whether there is an error in the days selected controls
     */
    daysError: {
      get() {
        return this.attr('isWeekly') && this.attr('formEvent.days.length') === 0;
      },
    },
    /**
     * @property {Model} device
     * @parent i2web/components/schedule/irrigation-event
     * @description The irrigation controller being scheduled
     */
    device: {
      Type: Device,
    },
    /**
     * @property {CanMap} event
     * @parent i2web/components/schedule/irrigation-event
     * @description Event being represented
     */
    event: {
      Type: CanMap,
      set(event) {
        if (event) {
          this.removeAttr('formError');
          this.attr('formEvent', event.attr());

          this.attr('irrigationZones').replace([]);
          this.attr('irrigationZonesOmitted').replace([]);
          this.attr('irrigationZonesScheduled').replace([]);

          const scheduled = event.attr('zoneDurations');
          const events = scheduled.map(z => z.zone).serialize();
          const zones = this.attr('device.web:irr:zones');
          zones.each((z) => {
            const zone = `z${z.zoneIndex}`;
            const duration = z.attr('defaultDuration') || 1;
            this.attr('irrigationZones').push({ zone, duration });
            if (!events.includes(zone)) {
              this.attr('irrigationZonesOmitted').push({ zone, duration });
            }
          });
          if (zones.length === 1 && !scheduled.length) {
            this.selectZone(this.attr('irrigationZones.0'));
          } else {
            this.attr('irrigationZonesScheduled', scheduled);
          }
        }
        return event;
      },
    },
    /**
     * @property {String} formError
     * @parent i2web/components/schedule/irrigation-event
     * @description Form error displayed above the bottom buttons
     */
    formError: {
      type: 'string',
    },
    /**
     * @property {CanMap} formEvent
     * @parent i2web/components/schedule/irrigation-event
     * @description Copy of the event
     */
    formEvent: {
      Type: CanMap,
    },
    /**
     * @property {Boolean} formHasChanges
     * @parent i2web/components/schedule/irrigation-event
     * @description Whether anything has changed on the form
     */
    formHasChanges: {
      get() {
        if (!this.attr('event.id')) return true;
        return !this.areEventsEqual(this.attr('event').attr(), this.attr('formEvent').attr());
      },
    },
    /**
     * @property {string} headerSubtext
     * @parent i2web/components/schedule/irrigation-event
     * @description Subtext that appears under the header for the edit panel
     */
    headerSubtext: {
      get() {
        const zoneText =
        this.attr('device.web:irr:zones.length') > 1 ? 'the same zones' : '';
        return `Add more events if you want to water ${zoneText} multiple times a day.`;
      },
    },
    /**
     * @property {string} headerText
     * @parent i2web/components/schedule/irrigation-event
     * @description Header text for the edit panel
     */
    headerText: {
      get() {
        return this.attr('device.web:irr:zones.length') > 1
          ? 'Select Zones and Adjust Durations'
          : 'Select Duration';
      },
    },
    /**
     * @property {CanList} irrigationZones
     * @parent i2web/components/schedule/irrigation-event
     * @description List of irrigation zones.
     */
    irrigationZones: {
      Value: CanList,
    },
    /**
     * @property {CanList} irrigationZonesOmitted
     * @parent i2web/components/schedule/irrigation-event
     * @description Filtered list of irrigation zones omitted from the current schedule event.
     */
    irrigationZonesOmitted: {
      Value: CanList,
    },
    /**
     * @property {CanList} irrigationZonesScheduled
     * @parent i2web/components/schedule/irrigation-event
     * @description Filtered list of irrigation zones scheduled in the current event.
     */
    irrigationZonesScheduled: {
      Value: CanList,
    },
    /**
     * @property {Boolean} isWeekly
     * @parent i2web/components/schedule/irrigation-event
     * @description Whether this is a recurring weekly event
     */
    isWeekly: {
      get() {
        return this.attr('event.mode') === 'WEEKLY';
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/schedule/irrigation-event
     * @description The subsystem for the device
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Array<Object>}
     * @parent i2web/components/schedule/irrigation-event
     * @description List of irrigation durations to be selected
     */
    wateringDurations: {
      get() {
        const times =
        this.attr('device.web:irr:zones.0').attr('possibleWateringTimes');
        return times.map((t) => {
          return {
            value: t,
            label: formatDuration(t, 'minutes'),
          };
        });
      },
    },
  },
  /**
   * @property {Boolean} saving
   * @parent i2web/components/schedule/irrigation-event
   * whether the event is being saved
   */
  saving: false,
  /**
   * @property {Boolean} deleting
   * @parent i2web/components/schedule/irrigation-event
   * whether the event is being deleted
   */
  deleting: false,
  /**
   * @property {Boolean} confirmingDeleted
   * @parent i2web/components/schedule/irrigation-event
   * whether the event is being confirmed to be deleted
   */
  confirmingDelete: false,
  /**
   * @function save
   * @parent i2web/components/schedule/irrigation-event
   * Saves the event
   */
  save(vm, el, ev) {
    ev.preventDefault();
    const event = this.attr('formEvent');

    if (!this.attr('formHasChanges') || this.attr('daysError')) {
      ev.stopPropagation();
      return;
    }

    this.attr('saving', true);
    this.removeAttr('formError');

    const eventId = event.attr('eventId');
    const subsystem = this.attr('subsystem');
    const isWeekly = this.attr('isWeekly');
    let eventMethod = null;
    if (eventId) {
      eventMethod = isWeekly
        ? subsystem.UpdateWeeklyEvent
        : subsystem.UpdateScheduleEvent;
    } else {
      eventMethod = isWeekly
        ? subsystem.CreateWeeklyEvent
        : subsystem.CreateScheduleEvent;
    }
    eventMethod = eventMethod.bind(subsystem);

    const controller = event.attr('controller');
    const mode = event.attr('mode');

    const [eventDays, eventTime] = (isWeekly)
      ? fromDeviceToPlaceTimezone(event.attr('timeOfDay'), event.attr('days').attr())
      : fromDeviceToPlaceTimezone(event.attr('timeOfDay'));

    const zoneDurations = this.attr('irrigationZonesScheduled').serialize();
    if (!zoneDurations.length) {
      vm.attr('formError', 'At least one zone must be selected.');
      this.attr('saving', false);
      return;
    }

    let params = this.attr('isWeekly')
      ? [controller, eventId, eventDays, eventTime, zoneDurations]
      : [controller, mode, eventId, eventTime, zoneDurations];

    const successCallback = function successCallback() {
      vm.attr('saving', false);
      vm.removeAttr('event');
      Notifications.success(`Your Event has been ${eventId ? 'updated' : 'created'}.`, 'icon-app-calendar-1');
    };

    const errorCallback = function errorCallback(e) {
      vm.attr('saving', false);
      if (e.code === 'lawnngarden.scheduling.has_overlaps') {
        vm.attr('formError', 'You currently have an event scheduled that overlaps with the start time you have chosen. Please select a different time.');
      } else {
        vm.attr('formError', `An error occurred ${eventId ? 'updating' : 'creating'} this event. Please try again later.`);
      }
    };

    // eventId will be undefined when creating a new event, so remove any
    // undefined params
    params = params.filter(p => !!p);
    if (mode === 'INTERVAL') {
      const interval = this.attr('formEvent.intervalDuration');
      const timestamp = +(new Date());
      subsystem.ConfigureIntervalSchedule(controller, timestamp, interval)
        .then(() => {
          eventMethod(...params).then(successCallback).catch(errorCallback);
        })
        .catch(errorCallback);
    } else {
      eventMethod(...params).then(successCallback).catch(errorCallback);
    }
  },
  /**
   * @function cancel
   * @parent i2web/components/schedule/irrigation-event
   * Cancels the save
   */
  cancel(ev) {
    ev.preventDefault();
    this.removeAttr('event');
  },
  /**
   * @function delete
   * @parent i2web/components/schedule/irrigation-event
   * Deletes the event
   */
  delete(ev) {
    ev.preventDefault();

    const vm = this;
    const successCallback = function successCallback() {
      vm.attr('deleting', false);
      vm.attr('confirmingDelete', false);
      vm.removeAttr('event');
    };

    const errorCallback = function errorCallback() {
      vm.attr('deleting', false);
      vm.attr('confirmingDelete', false);
      vm.attr('formError', 'An error occurred deleting this event. Please try again later.');
    };

    this.attr('deleting', true);

    const subsystem = this.attr('subsystem');
    const controller = this.attr('device.base:address');
    const mode = this.attr('event.mode');
    const eventId = this.attr('event.eventId');

    let removeMethod = this.attr('isWeekly')
      ? subsystem.RemoveWeeklyEvent
      : subsystem.RemoveScheduleEvent;
    removeMethod = removeMethod.bind(subsystem);

    const params = this.attr('isWeekly')
      ? [controller, eventId]
      : [controller, mode, eventId];

    const eventsCountProperty
      = `sublawnngarden:${mode.toLowerCase()}Schedules.${controller}.events.length`;
    // If we have 1 event currently, we know we will have 0 when this function
    // completes. We are checking here so that we do not have to wait for the
    // platform to update us.
    const disableSchedule = subsystem.attr(eventsCountProperty) === 1;

    removeMethod(...params)
      .then(successCallback)
      .then(() => {
        if (disableSchedule) {
          subsystem.DisableScheduling(controller);
        }
      })
      .catch(errorCallback);
  },
  /**
   * @function areEventsEqual
   * @parent i2web/components/schedule/irrigation-event
   * @description We know the form has changes by checking the values of the
   * objects used to populate the forms in the component. If they are not equal,
   * something has changed.
   */
  areEventsEqual(a, b) {
    // Since days property is an array and the order is not guaranteed we
    // sort it for comparison.
    if (a.days && b.days) {
      a.days.sort();
      b.days.sort();
    }
    return _isEqual(a, b);
  },
  /**
   * @function cancelDelete
   * @parent i2web/components/schedule/irrigation-event
   * Cancels event deletion
   */
  cancelDelete(ev) {
    ev.preventDefault();
    this.attr('confirmingDelete', false);
  },
  /**
   * @function confirmDelete
   * @parent i2web/components/schedule/irrigation-event
   * Starts the process of confirming event deletion
   */
  confirmDelete(ev) {
    ev.stopPropagation();
    this.attr('confirmingDelete', true);
  },
  /**
   * @function deselectZone
   * @parent i2web/components/schedule/irrigation-event
   * @description Move a zone from being scheduled to not being scheduled
   */
  deselectZone(index) {
    const scheduled = this.attr('irrigationZonesScheduled');
    const omitted = this.attr('irrigationZonesOmitted');
    omitted.push(...scheduled.splice(index, 1));
  },
  /**
   * @function isScheduledFirst
   * @parent i2web/components/schedule/irrigation-event
   * @description Used to determine whether we disable the arrow used to
   * move the zone up in the list of scheduled zones. If we are first, the
   * only direction to go is down.
   */
  isScheduledFirst(zone) {
    const scheduled = this.attr('irrigationZonesScheduled');
    const index = scheduled.indexOf(zone);
    return index !== -1 && index === 0;
  },
  /**
   * @function isScheduledLast
   * @parent i2web/components/schedule/irrigation-event
   * @description Used to determine whether we disable the arrow used to
   * move the zone down in the list of scheduled zones. If we are last, the
   * only direction to go is up.
   */
  isScheduledLast(zone) {
    const scheduled = this.attr('irrigationZonesScheduled');
    const count = scheduled && scheduled.attr('length');
    const index = scheduled.indexOf(zone);
    return index !== -1 && index === count - 1;
  },
  /**
   * @function moveUp
   * @parent i2web/components/schedule/irrigation-event
   * @param {CanMap} zone The item to move
   * @param {Object} ev The event object
   * @description Moves the zone up higher on the list
   */
  moveUp(zone, ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const scheduledZones = this.attr('irrigationZonesScheduled');
    const index = scheduledZones.indexOf(zone);
    scheduledZones.splice(index, 1);
    scheduledZones.splice(index - 1, 0, zone);
  },
  /**
   * @function moveDown
   * @parent i2web/components/schedule/irrigation-event
   * @param {CanMap} zone The item to move
   * @param {Object} ev The event object
   * @description Moves the zone down lower on the list
   */
  moveDown(zone, ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const scheduledZones = this.attr('irrigationZonesScheduled');
    const index = scheduledZones.indexOf(zone);
    scheduledZones.splice(index, 1);
    scheduledZones.splice(index + 1, 0, zone);
  },
  /**
   * @function selectZone
   * @parent i2web/components/schedule/irrigation-event
   * @description Move a zone from not being scheduled to being scheduled
   */
  selectZone(index) {
    const omitted = this.attr('irrigationZonesOmitted');
    const scheduled = this.attr('irrigationZonesScheduled');
    scheduled.push(...omitted.splice(index, 1));
  },
  /**
   * @function toggleAllZones
   * @parent i2web/components/schedule/irrigation-event
   * @description Schedule ALL unscheduled events, or vice-versa
   */
  toggleAllZones() {
    const omitted = this.attr('irrigationZonesOmitted');
    const scheduled = this.attr('irrigationZonesScheduled');
    if (this.attr('allZonesSelected')) {
      omitted.push(...scheduled.splice(0));
    } else {
      scheduled.push(...omitted.splice(0));
    }
  },
  /**
   * @function zoneNameOf
   * @parent i2web/components/schedule/irrigation-event
   * @description The name of the zone
   */
  zoneNameOf(zone) {
    return this.attr(`device.irr:zonename:${zone.zone}`)
      || `Zone ${zone.zone.slice(1)}`;
  },
});

export default Component.extend({
  tag: 'arcus-schedule-irrigation-event',
  viewModel: ViewModel,
  view,
});
