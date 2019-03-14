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
 * @module {Class} i2web/connections/can-map-address can-map-address
 * @parent api.connections
 *
 * @group i2web/connections/can-map-address.can-map 0 Map Instance Methods
 *
 * Implements a can-connect behavior that adds a `base:address` param to each call to `get`.
 */
import connect from 'can-connect';
import overwrite from './helpers/overwrite';
import canMap from 'can-map';

const mapStaticOverwrites = {
  get: function get(base, connection) {
    /**
     * @function i2web/connections/can-map-address.can-map.get get
     * @parent i2web/connections/can-map-address.can-map
     *
     * Adds base:address to the params Object before using the original `get`.
     * This allows lookups by idProp (base:address) to succeed in things like
     * instanceStore and localStorage caching.
     */
    return function newGet(params) {
      // Add base:address if all we have is base:id
      if (params['base:id'] && !params['base:address']) {
        params['base:address'] = connection.getAddress.call(this, params);
      }
      return base.call(this, params);
    };
  },
};

export default connect.behavior('can-map-address', function canMapAddress(baseConnect) { // eslint-disable-line prefer-arrow-callback
  return {
    init: function init(...args) {
      this.Map = this.Map || canMap.extend({});
      // Overwrite this.Map with the functions in mapOverwrites
      overwrite(this, this.Map, {}, mapStaticOverwrites);
      baseConnect.init.apply(this, args);
    },

    /**
     * @function getAddress
     *
     * Generates the address of an instance.
     * @param {Object} props values to populate the template with.
     * @return {String}
     */
    getAddress: this.Map.GetDestination,
  };
});
