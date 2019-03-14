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
import canMap from 'can-map';
import stache from 'can-stache';
import 'can-map-define';
import SchedulerService from 'i2web/models/service/SchedulerService';
import { fromDeviceToPlaceTimezone } from 'i2web/components/schedule/from-to-timezones';
import Notifications from 'i2web/plugins/notifications';
import _pick from 'lodash/pick';
import view from './event.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Object} configuration
     * @parent i2web/components/schedule/edit-panel
     * @description The scheduler configuration object specific to the type of 'thing'
     */
    configuration: {
      type: '*',
    },
    /**
     * @property {Model} thing
     * @parent i2web/components/schedule/event
     * @description The "thing" (scene, rule, device) being scheduled
     */
    thing: {
      type: '*',
    },
    /**
     * @property {canMap} formEvent
     * @parent i2web/components/schedule/event
     * @description Copy of the event
     */
    formEvent: {
      Type: canMap,
      set(event) {
        // handle negative/positive time offsets
        event.bind('offsetMinutes', () => {
          this.validateOffsetMinutes();
        });
        return event;
      },
    },
    /**
     * @property {canMap} event
     * @parent i2web/components/schedule/event
     * @description Event being represented
     */
    event: {
      Type: canMap,
      set(event) {
        if (event) {
          // reset errors:
          this.removeAttr('formError');
          // copy the event to formEvent (to separate changes for saving/canceling)
          this.attr('formEvent', event.attr());
        }
        return event;
      },
    },
    /**
     * @property {Boolean} daysError
     * @parent i2web/components/schedule/event
     * @description Whether there is an error in the days selected
     */
    daysError: {
      get() {
        return this.attr('formEvent.days.length') === 0;
      },
    },
    /**
     * @property {String} formError
     * @parent i2web/components/schedule/event
     * @description Form error
     */
    formError: {
      type: 'string',
    },
    /**
     * @property {Boolean} formHasChanges
     * @parent i2web/components/schedule/event
     * @description Whether anything has changed on the form
     */
    formHasChanges: {
      get() {
        if (!this.attr('event.id')) return true;
        return !this.areEventsEqual(this.attr('event').attr(), this.attr('formEvent').attr());
      },
    },
  },
  /**
   * @function renderConfigurator
   * @description Render a template specific for the device/subsystem passed in
   * @return {DocumentFragment}
   */
  renderConfigurator() {
    const mode = this.attr('mode');
    let configurators = this.attr('configuration') && this.attr('configuration').configurators;
    if (configurators !== undefined || mode) {
      configurators = (configurators !== undefined) ?
        configurators.map(config => config.toLowerCase()) :
        [mode.toLowerCase()];

      const template = configurators.map((configurator) => {
        const configuratorTagName = `arcus-schedule-device-configurators-${configurator}`;
        return `<${configuratorTagName} {(attributes)}="attributes" {thing}="thing" />`;
      }).join('');

      const rendered = stache(template)({
        attributes: this.attr('formEvent.attributes'),
        thing: this.attr('thing'),
      });
      return rendered;
    }
    return stache('')({}, {});
  },
  /**
   * @property {Boolean} saving
   * @parent i2web/components/schedule/event
   * whether the event is being saved
   */
  saving: false,
  /**
   * @property {Boolean} deleting
   * @parent i2web/components/schedule/event
   * whether the event is being deleted
   */
  deleting: false,
  /**
   * @property {Boolean} confirmingDeleted
   * @parent i2web/components/schedule/event
   * whether the event is being confirmed to be deleted
   */
  confirmingDelete: false,
  /**
   * @function validateOffsetMinutes
   * @parent i2web/components/schedule/event
   * Converts offset minutes to the correct value depending on the selected offset
   */
  validateOffsetMinutes() {
    // see if we need to toggle the offsetMinutes value as well
    const offsetBefore = this.attr('offsetBefore');
    const offsetMinutes = this.attr('offsetMinutes');
    if ((offsetBefore && offsetMinutes > 0) || (!offsetBefore && offsetMinutes < 0)) {
      this.attr('formEvent').attr('offsetMinutes', -1 * offsetMinutes);
    }
  },
  /**
   * @function toggleMode
   * @parent i2web/components/schedule/event
   * Toggles the mode and makes any related changes
   */
  toggleMode(ev, value) {
    ev.preventDefault();
    if (value === this.attr('formEvent.mode')) return;
    this.attr('formEvent.mode', value);

    // when changing modes, reset the other mode times to the original value
    if (value === 'ABSOLUTE') {
      this.attr('formEvent.offsetMinutes', this.attr('event.offsetMinutes'));
    } else {
      // TODO this should be removed and use a null->int converter
      this.attr('formEvent.offsetMinutes', 0);
      this.attr('formEvent.time', this.attr('event.time'));
    }
  },
  /**
   * @function toggleRule
   * @parent i2web/components/schedule/event
   * Toggles event's messageType for rules.
   */
  toggleRule(ev, enabled) {
    ev.preventDefault();
    this.attr('formEvent.messageType', enabled ? 'rule:Enable' : 'rule:Disable');
  },
  /**
   * @function save
   * @parent i2web/components/schedule/event
   * Saves the event
   */
  save(vm, el, ev) {
    ev.preventDefault();

    if (!this.attr('formHasChanges') || this.attr('daysError')) {
      ev.stopPropagation();
      return;
    }

    const successCallback = function successCallback() {
      vm.attr('saving', false);
      vm.removeAttr('event');
      Notifications.success('Your Event has been created.', 'icon-app-calendar-1');
    };

    const errorCallback = function errorCallback() {
      vm.attr('saving', false);
      vm.attr('formError', `An error occurred ${(vm.attr('formEvent.id') ? 'updating' : 'creating')} this event. Please try again later.`);
    };

    const [eventDays, eventTime] =
      fromDeviceToPlaceTimezone(this.attr('formEvent.time'), this.attr('formEvent.days').attr());

    let attributes = this.attr('formEvent.attributes').attr();

    // Pass attributes that are writable, if available
    if (this.attr('configuration').attributes) {
      attributes = _pick(attributes, this.attr('configuration').attributes);
    }

    this.attr('saving', true);
    this.removeAttr('formError');
    if (this.attr('event.id')) {
      const params = [
        this.attr('thing.base:address'),
        this.attr('event.scheduleId'),
        this.attr('event.id'),
        eventDays,
        this.attr('formEvent.mode'),
        this.attr('formEvent.mode') === 'ABSOLUTE' ? eventTime : null,
        this.attr('formEvent.offsetMinutes'),
        this.attr('formEvent.messageType'),
        attributes,
      ];
      SchedulerService.UpdateWeeklyCommand(...params)
      .then(successCallback)
      .catch(errorCallback);
    } else {
      const params = [
        this.attr('thing.base:address'),
        this.attr('event.scheduleId'),
        eventDays,
        this.attr('formEvent.mode'),
        this.attr('formEvent.mode') === 'ABSOLUTE' ? eventTime : null,
        this.attr('formEvent.offsetMinutes'),
        this.attr('formEvent.messageType'),
        attributes,
      ];
      SchedulerService.ScheduleWeeklyCommand(...params)
      .then(successCallback)
      .catch(errorCallback);
    }
  },
  /**
   * @function cancel
   * @parent i2web/components/schedule/event
   * Cancels the save
   */
  cancel(ev) {
    ev.preventDefault();
    this.removeAttr('event');
  },
  /**
   * @function delete
   * @parent i2web/components/schedule/event
   * Deletes the event
   */
  delete(ev) {
    ev.preventDefault();

    this.attr('deleting', true);
    const params = [
      this.attr('thing.base:address'),
      this.attr('event.scheduleId'),
      this.attr('event.id'),
    ];
    SchedulerService.DeleteCommand(...params).then(() => {
      this.attr('deleting', false);
      this.attr('confirmingDelete', false);
      this.removeAttr('event');
    })
    .catch(() => {
      this.attr('deleting', false);
      this.attr('confirmingDelete', false);
      this.attr('formError', 'An error occurred deleting this event. Please try again later.');
    });
  },
  /**
   * @function cancelDelete
   * @parent i2web/components/schedule/event
   * Cancels event deletion
   */
  cancelDelete(ev) {
    ev.preventDefault();
    this.attr('confirmingDelete', false);
  },
  /**
   * @function confirmDelete
   * @parent i2web/components/schedule/event
   * Starts the process of confirming event deletion
   */
  confirmDelete(ev) {
    ev.stopPropagation();
    this.attr('confirmingDelete', true);
  },
  areEventsEqual(a, b) {
    if (a.days && b.days) {
      // Since days property is an array and the order is not guaranteed we sort it for comparison.
      a.days.sort();
      b.days.sort();
      return _isEqual(a, b);
    }
    return false;
  },
});

export default Component.extend({
  tag: 'arcus-schedule-event',
  viewModel: ViewModel,
  view,
});
