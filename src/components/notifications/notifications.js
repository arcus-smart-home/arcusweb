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

import Component from 'can-component';
import canMap from 'can-map';
import canList from 'can-list';
import 'can-map-define';
import view from './notifications.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * The amount of time a notification stays on the screen
     *
     * @property {Number} intervalTime
     * @parent i2web/components/notifications
     */
    intervalTime: {
      value: 3000,
    },
    /**
     * The current notification displayed on the screen
     *
     * @property {object} currentNotification
     * @parent i2web/components/notifications
     */
    currentNotification: {
      set(val) {
        this.attr('currentNotificationType', val.type);
        this.attr('currentNotificationMessage', val.message);
        this.attr('currentNotificationIcon', val.icon);
        this.attr('state', 'open');
        return val;
      },
      remove() {
        this.attr('state', 'closing');
        setTimeout(() => {
          this.attr('currentNotificationType', '');
          this.attr('currentNotificationMessage', '');
          this.attr('currentNotificationIcon', '');
          this.attr('state', 'closed');
        }, 400);
      },
    },
    /**
     * The current notification message icon
     *
     * @property {String} currentNotificationIcon
     * @parent i2web/components/notifications
     */
    currentNotificationIcon: {
      value: '',
    },
    /**
     * The current notification message text
     *
     * @property {String} currentNotificationMessage
     * @parent i2web/components/notifications
     */
    currentNotificationMessage: {
      value: '',
    },
    /**
     * The current notification type ('success', info', 'warning' or 'error')
     *
     * @property {String} currentNotificationType
     * @parent i2web/components/notifications
     */
    currentNotificationType: {
      value: '',
    },
    /**
     * The entire event queue
     *
     * @property {canList} events
     * @parent i2web/components/notifications
     */
    events: {
      Value: canList,
      set(newVal, setVal) {
        setVal(newVal);
        this.dequeueEvents();
      },
    },
    /**
     * The state of the notification window (either 'open', 'closing', or 'closed')
     *
     * @property {String} state
     * @parent i2web/components/notifications
     */
    state: {
      value: 'closed',
    },
    /**
     * The current setInterval for determining which notification is displayed
     *
     * @property {*} currentNotificationInterval
     * @parent i2web/components/notifications
     */
    currentNotificationInterval: {},
  },
  /**
   * @function dequeueEvents
   * @parent i2web/components/notifications
   * Immediately sets the first item in the events list as the current notification
   * and displays it for 5 seconds before switching the current notification to the next
   * in the events list.
   */
  dequeueEvents() {
    if (this.attr('events').attr('length')) {
      this.attr('currentNotification', this.attr('events').pop());
      this.attr('currentNotificationInterval', setInterval(() => {
        if (this.attr('events').length > 0) {
          this.attr('currentNotification', this.attr('events').pop());
        } else {
          this.removeAttr('currentNotification');
          clearInterval(this.attr('currentNotificationInterval'));
          this.removeAttr('currentNotificationInterval');
        }
      }, this.attr('intervalTime')));
    } else {
      this.removeAttr('currentNotification');
      clearInterval(this.attr('currentNotificationInterval'));
      this.removeAttr('currentNotificationInterval');
    }
  },
});

export default Component.extend({
  tag: 'arcus-notifications',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel.events} add': function addEventsToDequeue() {
      if (!this.viewModel.currentNotificationInterval) {
        this.viewModel.dequeueEvents();
      }
    },
    '{element} click': function removeNotification() {
      if (this.viewModel.currentNotificationInterval) {
        clearInterval(this.viewModel.attr('currentNotificationInterval'));
      }
      this.viewModel.dequeueEvents();
    },
  },
});
