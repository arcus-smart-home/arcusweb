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
 * @module i2web/app/plugins/get-app-state AppState
 * @parent app.plugins
 * Allows the AppState to be accessed anywhere in the application.
 */
import $ from 'jquery';
import canViewModel from 'can-view-model';

/**
 * @function getAppState
 * @parent i2web/app/plugins/get-app-state
 * @description Returns a canMap representing the state of the application.
 *
 * @return {canMap}
 */
export default function getAppState() {
  return canViewModel($('html')[0]);
}
