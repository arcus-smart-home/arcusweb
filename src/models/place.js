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
 * @module {canMap} i2web/models/place Place
 * @parent app.models
 *
 * @group i2web/models/place.properties 0 properties
 *
 * Model of a place.
 *
 */
import 'can-construct-super';
import 'can-map-define';
import canList from 'can-list';
import Errors from 'i2web/plugins/errors';
import { personNameSorter } from 'i2web/plugins/sorters';
import Base, { ModelConnection } from './base';
import Person from 'i2web/models/person';
import PlaceCapability from 'i2web/models/capability/Place';
import makeCloneable from 'i2web/connections/cloneable';

const Place = Base.extend({
  /**
   * @property {Object} metadata i2web/models/place.static.metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/place.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'place',
    destination: 'SERV:{namespace}:{base:id}',
  },
  /**
   * @property {Boolean} isMonthlyPremium i2web/models/place.static.isMonthlyPremium
   * @parent i2web/models/place.static
   *
   * Determine whether the Place is on a Premium MONTHLY service plan.
   */
  isMonthlyPremium(serviceLevel) {
    return [
      PlaceCapability.SERVICELEVEL_PREMIUM,
      PlaceCapability.SERVICELEVEL_PREMIUM_FREE,
    ].includes(serviceLevel);
  },
  /**
   * @property {Boolean} isMonthlyPromon i2web/models/place.static.isMonthlyPromon
   * @parent i2web/models/place.static
   *
   * Determine whether the Place is on a Promon MONTHLY service plan.
   */
  isMonthlyPromon(serviceLevel) {
    return false;
  },
  /**
   * @property {Boolean} isPremiumPlan i2web/models/place.static.isPremiumPlan
   * @parent i2web/models/place.static
   *
   * Determine whether the Place is on a Premium service plan.
   */
  isPremiumPlan(serviceLevel) {
    return [
      PlaceCapability.SERVICELEVEL_PREMIUM,
      PlaceCapability.SERVICELEVEL_PREMIUM_ANNUAL,
      PlaceCapability.SERVICELEVEL_PREMIUM_FREE,
    ].includes(serviceLevel);
  },
  /**
   * @property {boolean} isPremium i2web/models/place.static.isPremium
   * @parent i2web/models/place.static
   *
   * Is the Place on a 'non-basic' service plan? Determine whether the Place
   * has access to Premium features (which includes premium and promonitoring
   * features).
   */
  isPremium(serviceLevel) {
    return Place.isPremiumPlan(serviceLevel) || Place.isPromon(serviceLevel);
  },
  /**
   * @property {boolean} isPromon i2web/models/place.static.isPromon
   * @parent i2web/models/place.static
   *
   * Helper to check whether a service level is pro monitoring or not
   */
  isPromon(serviceLevel) {
    return [
      PlaceCapability.SERVICELEVEL_PREMIUM_PROMON,
      PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_ANNUAL,
      PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_FREE,
      PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_MYPARTNER_DISCOUNT,
    ].includes(serviceLevel);
  },
  /**
   * @property {boolean} isBasic i2web/models/place.static.isBasic
   * @parent i2web/models/place.static
   *
   * Helper to check whether a service level is basic or not
   */
  isBasic(serviceLevel) {
    return [PlaceCapability.SERVICELEVEL_BASIC].includes(serviceLevel);
  },
  /**
   * @property {boolean} isFreePlan i2web/models/place.static.isFreePlan
   * @parent i2web/models/place.static
   *
   * Helper to check whether a service level is free
   */
  isFreePlan(serviceLevel) {
    return [PlaceCapability.SERVICELEVEL_BASIC, PlaceCapability.SERVICELEVEL_PREMIUM_FREE, PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_FREE].includes(serviceLevel);
  },
  /**
   * @property {boolean} isAnnualPlan i2web/models/place.static.isAnnualPlan
   * @parent i2web/models/place.static
   *
   * Helper to check whether a service level is annual
   */
  isAnnualPlan(serviceLevel) {
    return [PlaceCapability.SERVICELEVEL_PREMIUM_ANNUAL, PlaceCapability.SERVICELEVEL_PREMIUM_PROMON_ANNUAL].includes(serviceLevel);
  },
  /**
   * @function GetPlaces
   *
   * Lists all places with the given addresses.
   * Custom method (not defined in capability)
   * @param {Array<String>} addresses Array of place addresses to retrieve.
   * @return {Promise}
   */
  GetPlaces(addresses = []) {
    if (addresses.length === 0) {
      return new Promise.resolve(new this.List([]));
    }
    const promises = [];
    addresses.forEach((address) => {
      promises.push(this.get({ 'base:address': address }));
    });

    return Promise.all(promises).then((places) => {
      return new this.List(places);
    });
  },
}, {
  init() {
    this._super(arguments);
    this.mixin(PlaceCapability);
  },
  define: {
    /**
     * @property {Boolean} isPremium i2web/models/place.properties.isPremium
     * @parent i2web/models/place.properties
     *
     * Whether the place has a premium service level.
     */
    isPremium: {
      get() {
        return this.attr('isPromon') || Place.isPremium(this.attr('place:serviceLevel'));
      },
    },
    /**
     * @property {Boolean} isPromon i2web/models/place.properties.isPromon
     * @parent i2web/models/place.properties
     *
     * Whether the place has a pro monitoring service level.
     */
    isPromon: {
      get() {
        return Place.isPromon(this.attr('place:serviceLevel'));
      },
    },
    /**
     * @property {Boolean} isBasic i2web/models/place.properties.isBasic
     * @parent i2web/models/place.properties
     *
     * Whether the place has a basic service level.
     */
    isBasic: {
      get() {
        return Place.isBasic(this.attr('place:serviceLevel'));
      },
    },
    /**
     * @property {Person} web:owner
     * @parent i2web/models/place.properties
     * The Person object that is the owner of this place
     */
    'web:owner': {
      Type: Person,
    },
    /**
     * @property {Boolean} isPremium i2web/models/place.properties.web:userOwnsPlace
     * @parent i2web/models/place.properties
     *
     * Whether the current user owns the place
     */
    'web:userOwnsPlace': {
      type: 'boolean',
    },
  },
  /**
   * @function {Array<Person>} invitedToAccess
   * @parent i2web/models/place
   * @description An array of Persons that have pending invites to access this Place
   */
  invitedToAccess() {
    return this.PendingInvitations().then(({ invitations }) => {
      return new canList(invitations.sort((a, b) => {
        return (a.inviteeFirstName.toLowerCase() > b.inviteeFirstName.toLowerCase()) ? 1 : -1;
      }));
    }).catch((e) => {
      Errors.log(e);
      return [];
    });
  },
  /**
   * @function {Array<Person>} peopleWithAccess
   * @parent i2web/models/place
   * @description An array of Persons sorted by full access followed by partial access
   */
  peopleWithAccess() {
    const placeID = this.attr('base:id');
    return this.ListPersonsWithAccess().then(({ persons }) => {
      const people = persons.map((person) => {
        person.person[`web:role:${placeID}`] = person.role;
        if (person.role === 'OWNER') {
          this.attr('web:owner', person.person);
        }
        return person.person;
      });

      return people.sort(personNameSorter);
    }).catch((e) => {
      Errors.log(e);
      return [];
    });
  },
});

export const PlaceConnection = ModelConnection('place', 'base:address', Place);
Place.connection = PlaceConnection;
makeCloneable(Place);

export default Place;
