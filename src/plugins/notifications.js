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

/**
 * @module i2web/app/plugins/notifications Notifications
 * @parent app.plugins
 * @description Notifications get added to the app state as an info or error
 */
import AppState from './get-app-state';

/**
 * @function addNotification
 * @parent i2web/app/plugins/notifications
 * @description Add a new notification object to the application state's list of
 * notications. The application state notifications property is consumed
 * by the arcus-notifications component.
 */
function addNotification(type, message, icon) {
  AppState().attr('notifications').unshift({
    type,
    message,
    icon,
  });
}

const types = ['error', 'info', 'success', 'warning'];
const Notifications = {};

types.forEach(function forEachType(type) {
  Notifications[type] = function notificationTypeFn(message, icon = '') {
    addNotification(type, message, icon);
  };
});

export default Notifications;
