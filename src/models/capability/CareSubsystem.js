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

import Bridge from 'i2web/cornea/bridge';

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/CareSubsystem CareSubsystem
 * @parent app.models.capabilities
 *
 * Care subsystem.
 */
export default {
  writeableAttributes: [
    /**
     * @property {set<string>} subcare\:careDevices
     *
     * This addresses of all the current care devices in this place.
     *
     */
    'subcare:careDevices',
    /**
     * @property {enum} subcare\:alarmMode
     *
     * Whether the care alarm is currently turned on or in visit mode.  During visit mode behaviors will not trigger the care alarm, but the care pendant may still generate a panic.
     *
     */
    'subcare:alarmMode',
    /**
     * @property {list<CallTreeEntry>} subcare\:callTree
     *
     * The call tree of users to notify when an alarm is triggered.  This list includes all the persons associated with the current place, whether or not they are alerted is determined by the boolean flag.  Order is determined by the order of the list.
     *
     */
    'subcare:callTree',
    /**
     * @property {boolean} subcare\:silent
     *
     * When true only notifications will be sent, alert devices will not be triggered.
     *
     */
    'subcare:silent',
  ],
  methods: {
    /**
     * @function Panic
     *
     * @return {Promise}
     */
    Panic() {
      return Bridge.request('subcare:Panic', this.GetDestination(), {});
    },
    /**
     * @function Acknowledge
     *
     * @return {Promise}
     */
    Acknowledge() {
      return Bridge.request('subcare:Acknowledge', this.GetDestination(), {});
    },
    /**
     * @function Clear
     *
     * @return {Promise}
     */
    Clear() {
      return Bridge.request('subcare:Clear', this.GetDestination(), {});
    },
    /**
     * @function ListActivity
     *
     * Creates a list of time buckets and indicates which care devices, optionally filtered, are triggered during that bucket.
     *
     * @param {timestamp} start The start time of the interval
     * @param {timestamp} end The end time of the interval
     * @param {int} bucket The number of seconds in each bucket
     * @param {set<string>} [devices] The devices to show activity for
     * @return {Promise}
     */
    ListActivity(start, end, bucket, devices) {
      return Bridge.request('subcare:ListActivity', this.GetDestination(), {
        start,
        end,
        bucket,
        devices,
      });
    },
    /**
     * @function ListDetailedActivity
     *
     * Returns a list of all the history log entries associated with this subsystem.
     *
     * @param {int} [limit] The maximum number of events to return (defaults to 10)
     * @param {string} [token] The token from a previous query to use for retrieving the next set of results. Note an exact time may be jumped to by specifying token as a timestamp in epoch milliseconds.
     * @param {set<string>} [devices] The devices to show activity for. If none are specified the value of careDevices will be used.
     * @return {Promise}
     */
    ListDetailedActivity(limit, token, devices) {
      return Bridge.request('subcare:ListDetailedActivity', this.GetDestination(), {
        limit,
        token,
        devices,
      });
    },
    /**
     * @function ListBehaviors
     *
     * @return {Promise}
     */
    ListBehaviors() {
      return Bridge.request('subcare:ListBehaviors', this.GetDestination(), {});
    },
    /**
     * @function ListBehaviorTemplates
     *
     * @return {Promise}
     */
    ListBehaviorTemplates() {
      return Bridge.request('subcare:ListBehaviorTemplates', this.GetDestination(), {});
    },
    /**
     * @function AddBehavior
     *
     * @param {CareBehavior} behavior Behavior to add.
     * @return {Promise}
     */
    AddBehavior(behavior) {
      return Bridge.request('subcare:AddBehavior', this.GetDestination(), {
        behavior,
      });
    },
    /**
     * @function UpdateBehavior
     *
     * Updates the requested attributes on the specified behavior.
     *
     * @param {CareBehavior} behavior Behavior to add.
     * @return {Promise}
     */
    UpdateBehavior(behavior) {
      return Bridge.request('subcare:UpdateBehavior', this.GetDestination(), {
        behavior,
      });
    },
    /**
     * @function RemoveBehavior
     *
     * Updates the requested attributes on the specified behavior.
     *
     * @param {String} id Id of the behavior to remove.
     * @return {Promise}
     */
    RemoveBehavior(id) {
      return Bridge.request('subcare:RemoveBehavior', this.GetDestination(), {
        id,
      });
    },
  },
  events: {
    /**
     * @function onBehaviorAlert
     *
     * Alerts the system that a behaviors has triggered an alert.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onBehaviorAlert(callback) {
      Cornea.on('subcare subcare:BehaviorAlert', callback);
    },
    /**
     * @function onBehaviorAlertCleared
     *
     * The care alert has been cleared.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onBehaviorAlertCleared(callback) {
      Cornea.on('subcare subcare:BehaviorAlertCleared', callback);
    },
    /**
     * @function onBehaviorAlertAcknowledged
     *
     * The care alert has been ackknowledged.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onBehaviorAlertAcknowledged(callback) {
      Cornea.on('subcare subcare:BehaviorAlertAcknowledged', callback);
    },
    /**
     * @function onBehaviorAction
     *
     * Alerts the system that a behaviors has triggered an alert.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onBehaviorAction(callback) {
      Cornea.on('subcare subcare:BehaviorAction', callback);
    },
  },
  ALARMMODE_ON: 'ON',
  ALARMMODE_VISIT: 'VISIT',
  ALARMSTATE_READY: 'READY',
  ALARMSTATE_ALERT: 'ALERT',
  LASTACKNOWLEDGEMENT_PENDING: 'PENDING',
  LASTACKNOWLEDGEMENT_ACKNOWLEDGED: 'ACKNOWLEDGED',
  LASTACKNOWLEDGEMENT_FAILED: 'FAILED',
};
