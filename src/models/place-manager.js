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

import AppState from 'i2web/plugins/get-app-state';
import isUUID from 'i2web/plugins/is-uuid';
import SessionService from 'i2web/models/service/SessionService';
import canDev from 'can-util/js/dev/';
import { placeNameSorter } from 'i2web/plugins/sorters';
import _find from 'lodash/find';

let LOCAL_STORAGE_KEY = '';

/**
 * @function clearActivePlace
 * @description Remove the default place from localStorage
 */
function clearActivePlace() {
  if (window.localStorage.getItem(LOCAL_STORAGE_KEY)) {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    return true;
  }
  return false;
}

/**
 * @function defaultPlace
 *
 * @description Returns the persons default place when logging in.
 * The logic for determing the default location is as follows:
 *   1. check to see if place resides in local storage "/preferences/user/<user-id>/place"
 *   2. if no, filter for place where place.role = OWNER
 *   3. if none, sort place alphabetically by placeName, and pick 0th option
 * Required by: https://eyeris.atlassian.net/browse/ITWO-6927
 * @param {Object} session Session created after a successful login
 * @return {String}
 */
function getDefaultPlace(session) {
  if (!session) return '';

  const places = session.places;
  LOCAL_STORAGE_KEY = `preference/user/${session.personId}/place`;
  const inStorage = window.localStorage.getItem(LOCAL_STORAGE_KEY);

  // check that the previous place still exists in the current list of places
  if (inStorage && isUUID(inStorage) && _find(places, (place) => {
    return place.attr('placeId') === inStorage;
  })) {
    return inStorage;
  }

  places.sort(placeNameSorter);
  const ownedPlaces = places.filter((place) => {
    return place.role === 'OWNER';
  });

  if (ownedPlaces.length) {
    return ownedPlaces.attr('0.placeId');
  }
  return places.attr('0.placeId');
}

/**
 * @function setActivePlace
 *
 * @description Set the active place of the logged in User, add it to local storage, and
 * return the placeId to be set on the application state.
 * @param {Object} session Session created after a successful login
 * @return {Promise}
 */
function setActivePlace(place, personId) {
  return SessionService.SetActivePlace(place).then(({ placeId }) => {
    try {
      window.localStorage.setItem(`preference/user/${personId}/place`, placeId);
    } catch (e) {
      canDev.warn(e);
    }
    return placeId;
  });
}

/**
 * @function activePlaceFromSession
 *
 * @description Set the active place with regards to the session Object. This is called
 * from Application State.
 * @param {Object} session The session Object
 * @return {Promise}
 */
function activePlaceFromSession(session) {
  const place = getDefaultPlace(session);
  if (!place) {
    return Promise.reject(`You'll need to login again to continue using Arcus.`);
  }

  const promise = setActivePlace(place, session.personId);
  promise.catch(() => {
    if (clearActivePlace()) {
      return activePlaceFromSession(session);
    }
    return null;
  });
  return promise;
}

function resetActivePlace() {
  this.clearActivePlace();

  // try and pull an updated list of places
  const session = AppState().attr('session');
  return new Promise((resolve, reject) => {
    SessionService.ListAvailablePlaces().then(({ places }) => {
      session.attr('places', places);
      this.activePlaceFromSession(session).then(resolve).catch(reject);
    }).catch(() => {
      if (session) {
        // if that doesn't work, then manually remove the place from the session list
        session.attr('places', session.attr('places').filter((place) => {
          return AppState().attr('placeId') !== place.attr('placeId');
        }));
      }
      this.activePlaceFromSession(session).then(resolve).catch(reject);
    });
  });
}

export default {
  activePlaceFromSession,
  clearActivePlace,
  setActivePlace,
  resetActivePlace,
};
