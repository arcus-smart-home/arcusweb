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
 * @module i2web/app/plugins/errors Errors
 * @parent app.plugins
 * @description Errors get proccessed in several ways throughout the app
 */

import canDev from 'can-util/js/dev/';
import SessionService from 'i2web/models/service/SessionService';
import AppState from 'i2web/plugins/get-app-state';
import Notifications from 'i2web/plugins/notifications';

export default {
  log(error, showNotification = false, category = 'web', code = 'log.error') {
    canDev.warn(error);

    let message = error.message || error;

    if (message) {
      message = typeof message === 'string' ? message : 'Hmm... There seems to be a problem. Please try again.';
    }


    // We only want to log or notify of errors when we have an active session
    if (AppState().attr('session')) {
      SessionService.Log(category, code, message).catch(e => canDev.warn(e));
      if (showNotification) {
        Notifications.error(message);
      }
    }
  },
};
