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

import Account from 'i2web/models/account';
import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import Errors from 'i2web/plugins/errors';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import view from './add-place.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Account} account
     * @parent i2web/components/settings/places/add-place
     * @description The account associated with the place
     */
    account: {
      Type: Account,
    },
    /**
     * @property {String} activeDisplay
     * @parent i2web/components/settings/places/add-place
     * @description The active display of the add place side panel
     */
    activeDisplay: {
      type: 'string',
      get() {
        if (!this.attr('isOwner')) {
          return 'guestMsg';
        } else if (this.attr('newPlaceId')) {
          return 'pin';
        }
        return 'address';
      },
    },
    /**
     * @property {Boolean} isAnOwner
     * @parent i2web/components/settings/places/add-place
     * @description Whether the currently logged in person owns any places
     */
    isAnOwner: {
      get() {
        return !!this.attr('person.web:person:primaryPlaceId');
      },
    },
    /**
     * @property {Boolean} isOwner
     * @parent i2web/components/settings/places/add-place
     * @description Whether the currently logged in person is the current place's account owner
     */
    isOwner: {
      type: 'boolean',
      get() {
        return this.attr('person.base:id') === this.attr('account.account:owner');
      },
    },
    /**
     * @property {String} newPlaceId
     * @parent i2web/components/settings/places/add-place
     * @description The base id of the new place; only defined after a place is successfully added
     */
    newPlaceId: {
      type: 'string',
    },
    /**
     * @property {Person} person
     * @parent i2web/components/settings/places/add-place
     * @description The person currently logged in
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Place} place
     * @parent i2web/components/settings/places/add-place
     * @description A placeholder object provided to the edit-address component
     */
    place: {
      Type: Place,
      get() {
        return new Place({
          'place:name': '',
          'place:streetAddress1': '',
          'place:streetAddress2': '',
          'place:city': '',
          'place:state': '',
          'place:zipCode': '',
        });
      },
    },
    /**
     * @property {String} serviceLevel
     * @parent i2web/components/settings/places/add-place
     * @description The service level to use when adding a new place
     */
    serviceLevel: {
      type: 'string',
    },
  },
  /**
   * @function onCreatePlaceFromAddress
   * @parent i2web/components/settings/places/add-place
   * @description Callback invoked from the child edit-address component to create the new place.
   */
  onCreatePlaceFromAddress(formPlace) {
    const account = this.attr('account');
    account.AddPlace(formPlace, null, this.attr('serviceLevel'), null).then(({ place }) => {
      this.attr('newPlaceId', place['base:id']);
    }).catch((e) => {
      Errors.log(e);
    });
  },
});

export default Component.extend({
  tag: 'arcus-settings-add-place',
  viewModel: ViewModel,
  view,
});
