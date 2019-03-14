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
import 'can-map-define';
import getAppState from 'i2web/plugins/get-app-state';
import Place from 'i2web/models/place';
import view from './places.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Place.List} places
     * @parent i2web/components/settings/places
     * @description A list of the person's available places, when set, it will separate them into
     * two lists, one that the person's owned places, and the other that is the places the person
     * is a guest at.
     */
    places: {
      Type: Place.List,
    },
    /**
     * @property {Place.List} ownerPlaces
     * @parent i2web/components/settings/places
     * @description A list of the person's places where they are owners
     */
    ownerPlaces: {
      get() {
        const ownerPlaces = this.attr('places').filter((place) => {
          return place.attr('web:userOwnsPlace');
        });
        ownerPlaces.attr('comparator', 'place:name');
        return ownerPlaces;
      },
    },
    /**
     * @property {Place.List} guestPlaces
     * @parent i2web/components/settings/places
     * @description A list of the person's places where they are guests
     */
    guestPlaces: {
      get() {
        const guestPlaces = this.attr('places').filter((place) => {
          return !place.attr('web:userOwnsPlace');
        });
        guestPlaces.attr('comparator', 'place:name');
        return guestPlaces;
      },
    },
    /**
     * @property {string} primaryPlaceId
     * @parent i2web/components/settings/places
     * @description Currently logged-in user's primary placeId, which cannot be deleted
     */
    primaryPlaceId: {
      get() {
        const person = getAppState().attr('person');
        return person ? person.attr('web:person:primaryPlaceId') : undefined;
      },
    },
  },
  /**
   * @function allowRemoveAccess
   * @return {Boolean}
   * @description Whether the logged-in user's access to the place can be removed
   */
  allowRemoveAccess() {
    return this.attr('places.length') > 1;
  },
  /**
   * @function allowRemovePlace
   * @param {Place} place
   * @return {Boolean}
   * @description Whether the place can be removed during Edit operations; do NOT
   * allow primary place to be removed
   */
  allowRemovePlace(place) {
    return this.attr('primaryPlaceId') !== place.attr('base:id');
  },
});

export default Component.extend({
  tag: 'arcus-settings-places',
  viewModel: ViewModel,
  view,
});
