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
 * @module {Object} i2web/models/SessionService SessionService
 * @parent app.models.services
 *
 * Enables interactions with the current session.
 */
export default {
  /**
   * @function onActivePlaceCleared
   *
   * Emitted when the client bridge clears the current active place for a session
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onActivePlaceCleared(callback) {
    Cornea.on('sess sess:ActivePlaceCleared', callback);
  },
  /**
   * @function onSessionExpired
   *
   * Emitted when the user is manually or automatically logged out and the shiro session is destroyed
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onSessionExpired(callback) {
    Cornea.on('sess sess:SessionExpired', callback);
  },
  /**
   * @function onPreferencesChanged
   *
   * Emitted when the preferences for this user have changed at the current place
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onPreferencesChanged(callback) {
    Cornea.on('sess sess:PreferencesChanged', callback);
  },
  /**
   * @function onTagged
   *
   * Emitted when a UI analytics tag has been processed
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onTagged(callback) {
    Cornea.on('sess sess:Tagged', callback);
  },
  /**
   * @function SetActivePlace
   *
   * Sets the place that this session is associated with, the session will begin receiving broadcasts for the requested place
   *
   * @param {string} placeId The id of the place to activate
   * @return {Promise}
   */
  SetActivePlace(placeId) {
    return Bridge.request('sess:SetActivePlace', 'SERV:sess:', {
      placeId,
    });
  },
  /**
   * @function Log
   *
   * Logs an event to the server
   *
   * @param {string} category The category for the log message
   * @param {string} code A unique code for the event that happened
   * @param {string} [message] An optional message to include
   * @return {Promise}
   */
  Log(category, code, message) {
    return Bridge.request('sess:Log', 'SERV:sess:', {
      category,
      code,
      message,
    });
  },
  /**
   * @function Tag
   *
   * Persists a UI analytics tag on the server
   *
   * @param {string} name The name of the analytic event
   * @param {map<string>} [context] Additional data associated with the event
   * @return {Promise}
   */
  Tag(name, context) {
    return Bridge.request('sess:Tag', 'SERV:sess:', {
      name,
      context,
    });
  },
  /**
   * @function ListAvailablePlaces
   *
   * Lists the available places for the currently logged in user
   *
   * @return {Promise}
   */
  ListAvailablePlaces() {
    return Bridge.request('sess:ListAvailablePlaces', 'SERV:sess:', {});
  },
  /**
   * @function GetPreferences
   *
   * Returns the preferences for the currently logged in user at their active place or empty if no preferences have been set or active place has not been set
   *
   * @return {Promise}
   */
  GetPreferences() {
    return Bridge.request('sess:GetPreferences', 'SERV:sess:', {});
  },
  /**
   * @function SetPreferences
   *
   * Sets the one or more preferences for the currently logged in user at their active place.  If a key is defined in their preferences but not specified here, it will not be cleared by this set.
   *
   * @param {Preferences} prefs Preferences to set for the the currently logged in user at their active place
   * @return {Promise}
   */
  SetPreferences(prefs) {
    return Bridge.request('sess:SetPreferences', 'SERV:sess:', {
      prefs,
    });
  },
  /**
   * @function ResetPreference
   *
   * Resets the preference with the given key for the currently logged in user at their active place.  This will remove the preference and return this preference to default.
   *
   * @param {string} prefKey Key of the preference to reset
   * @return {Promise}
   */
  ResetPreference(prefKey) {
    return Bridge.request('sess:ResetPreference', 'SERV:sess:', {
      prefKey,
    });
  },
  /**
   * @function LockDevice
   *
   * Lock the device by removing the mobile device record and logout the current session.
   *
   * @param {string} deviceIdentifier mobile device identifier
   * @param {enum} reason reason for the lock device call
   * @return {Promise}
   */
  LockDevice(deviceIdentifier, reason) {
    return Bridge.restfulRequest('sess:LockDevice', 'SERV:sess:', {
      deviceIdentifier,
      reason,
    });
  },
};
