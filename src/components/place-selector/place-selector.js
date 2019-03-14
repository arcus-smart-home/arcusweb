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

import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import Person from 'i2web/models/person';
import PlaceManager from 'i2web/models/place-manager';
import SessionService from 'i2web/models/service/SessionService';
import SidePanel from 'i2web/plugins/side-panel';
import Errors from 'i2web/plugins/errors';
import view from './place-selector.stache';
import { placeNameSorter } from 'i2web/plugins/sorters';

export const ViewModel = canMap.extend({
  define: {
    /**
     * All the available places available to the logged-in User.
     *
     * @property {Array<Object>}
     * @parent i2web/components/place-selector
     */
    places: {
      get(currentVal, setValue) {
        SessionService.ListAvailablePlaces().then(({ places }) => {
          setValue(places.sort(placeNameSorter));
        }).catch((e) => {
          setValue([]);
          Errors.log(e, true);
        });
      },
    },
    /**
     * The User's currently selected place.
     *
     * @property {String}
     * @parent i2web/components/place-selector
     */
    currentPlaceId: {
      type: 'string',
    },
    /**
     * The current User
     *
     * @property {Person} person
     * @parent i2web/components/place-selector
     */
    person: {
      Type: Person,
    },
  },
  /**
   * @function isCurrentPlace
   * @parent i2web/components/place-selector
   * Is the placeId of the place argument the same as the CurrentActivePlace's placeId.
   *
   * @param {Place} A place returned from SessionService.ListAvailablePlaces()
   * @return {Boolean} The id of the CurrentActivePlace matches the id of
   */
  isCurrentPlace(place) {
    return place.placeId === this.attr('currentPlaceId');
  },
  /**
   * @function selectPlace
   * @parent i2web/components/place-selector
   * Update the appstates's placeId when the User selects a new place.
   *
   * @param {Place} A place returned from SessionService.ListAvailablePlaces()
   */
  selectPlace(place) {
    const tagName = `dashboard.place.select`;
    Analytics.tag(tagName);

    PlaceManager.setActivePlace(place.placeId, this.attr('person.base:id')).then((activePlaceId) => {
      this.attr('currentPlaceId', activePlaceId);
      SidePanel.closeRight();
    }).catch(e => Errors.log(e, true));
  },
});

export default Component.extend({
  tag: 'arcus-place-selector',
  viewModel: ViewModel,
  view,
});
