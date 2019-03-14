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

import IncidentCapability from 'i2web/models/capability/AlarmIncident';
import _map from 'lodash/map';

/**
 * @module i2web/app/plugins/notification Notification
 * @parent app.plugins
 * @description Helper methods to set up and access browser
 * Notifications API, which supports display of system notifications
 */

/**
 * @function getAlertString
 * @parent i2web/app/plugins/notification
 * @param incidentAlertType String
 * @description Builds alert string for current incident
 */
function getAlertString(incidentAlertType) {
  switch (incidentAlertType) {
    case IncidentCapability.ALERT_SECURITY:
      return 'Security';
    case IncidentCapability.ALERT_PANIC:
      return 'Panic';
    case IncidentCapability.ALERT_CO:
      return 'CO';
    case IncidentCapability.ALERT_SMOKE:
      return 'Smoke';
    case IncidentCapability.ALERT_WATER:
      return 'Water Leak';
    default:
      return incidentAlertType;
  }
}

/**
 * @function requestNotificationPermission
 * @parent i2web/app/plugins/notification
 * @description Request permission for the Web UI to show notification windows
 * based on operating system support for end user alerts
 */
export function requestNotificationPermission() {
  if (!('Notification' in window)) return;

  const permission = Notification.permission;
  if (permission === 'default') {
    Notification.requestPermission(function onResponse(response) {
      // Whatever the user answers, we make sure Chrome stores the information
      if (!('permission' in Notification)) {
        Notification.permission = response;
      }
    });
  }
}
/**
 * @function createNotification
 * @parent i2web/app/plugins/notification
 * @description Create a new system notification with the Arcus logo
 */
export function createNotification(titleString, bodyString, tag) {
  if (!('Notification' in window)) return undefined;

  return new Notification(
    titleString,
    { body: bodyString,
      requireInteraction: false,
      tag,
      icon: '/src/images/notification-logo.png' },
  );
}

/**
 * @function showAlarmNotification
 * @parent i2web/app/plugins/notification
 * @param place Place
 * @param incident Incident
 * @description Shows notification for current incident
 */
export function showAlarmNotification(place, incident) {
  if (!('Notification' in window)) return;

  if (incident) {
    let alertString = getAlertString(incident.attr('incident:alert'));
    if (incident.attr('incident:additionalAlerts.length')) {
      const addlAlerts = _map(incident.attr('incident:additionalAlerts'), (a) => {
        return getAlertString(a);
      });
      alertString = `${alertString},${addlAlerts.join(',')}`;
    }

    const bodyString = place ? `at ${place.attr('place:name')}` : '';
    const notification =
      createNotification(`${alertString} Alarm`, bodyString, 'alarmStatus');

    if (notification) {
      setTimeout(notification.close.bind(notification), 4000);
    }
  }
}
/**
 * @function showCareNotification
 * @parent i2web/app/plugins/notification
 * @param place Place
 * @param careAlert String representing care alert triggered
 * @description Shows notification for current careAlert
 */
export function showCareNotification(place, careAlert) {
  if (!('Notification' in window)) return;

  if (careAlert) {
    const bodyString = place ? `at ${place.attr('place:name')}` : '';

    const notification =
      createNotification(careAlert, bodyString, 'careStatus');
    if (notification) {
      setTimeout(notification.close.bind(notification), 4000);
    }
  }
}

/**
 * @function showHubNotification
 * @parent i2web/app/plugins/notification
 * @param place Place
 * @param isOffline Boolean representing offline state
 * @description Shows notification for hub state change
 */
export function showHubNotification(place, isOffline) {
  if (!('Notification' in window)) return;

  const notification =
    createNotification(
      `${isOffline ? 'Hub lost connection to Arcus cloud platform' : 'Hub reconnected to Arcus cloud platform'}`,
      place ? `at ${place.attr('place:name')}` : '',
      'hubStatus');
  if (notification) {
    setTimeout(notification.close.bind(notification), 4000);
  }
}

export default {
  requestNotificationPermission,
  createNotification,
  showAlarmNotification,
  showCareNotification,
  showHubNotification,
};
