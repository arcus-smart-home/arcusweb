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
 * @module {Class} i2web/connections/data-cornea data-cornea
 * @parent app.connections
 *
 * @group i2web/connections/data-cornea.can-map 0 Map Instance Methods
 *
 * Implements a can-connect behavior that knows how to speak to the Arcus 2 platform via Cornea.
 * It implements methods similar to the `data-url` behavior.
 *
 * The only implemented methods are `getData` and `updateData` which perform a `base:GetAttributes` and
 * `base:SetAttributes` call respectively.
 *
 * getListData, createData and destroyData will not be implemented since there
 * is no general request for retrieving lists, creating or destroying Objects
 * in the platform. Methods for these are Object specific and encapsulated in other methods.
 */
import Bridge from 'i2web/cornea/bridge';
import connect from 'can-connect';
import canMap from 'can-map';

export default connect.behavior('data-cornea', function dataCornea(baseConnect) { // eslint-disable-line prefer-arrow-callback
  return {
    init: function init(...args) {
      this.Map = this.Map || canMap.extend({});
      // Overwrite this.Map.prototype with the functions in mapOverwrites
      baseConnect.init.apply(this, args);
    },

    /**
     * @function getChanges
     *
     * Build an Object of only changed key-value pairs.
     * List of changed keys are provided by the [i2web/connections/can-map-diff]'s changeStore.
     * @param {Object} [params] The key-value pairs of parameters that have changed.
     * @return {Object}
     */
    getChanges: function getChanges(params) {
      const changes = this.changeStore.get(params);
      const changed = {};
      changes.forEach((prop) => {
        // Mark: Removed the conditional because a 0 or null was not updating the changes
        // collection.
        // TODO: need a test to ensure that falsey values are changed, and those changes
        // are sent to the platform
        changed[prop] = params[prop];
      });
      return changed;
    },

    /**
     * @function getData
     *
     * Uses the cornea bridge to make a `base:GetAttributes` request.
     * @param {Object} [params] The key-value pairs of parameters to send.
     * @return {Promise}
     */
    getData: function getData(params) {
      return Bridge.request('base:GetAttributes', this.Map.GetDestination(params), {});
    },

    /**
     * @function updateData
     *
     * Uses the cornea bridge to make a `base:SetAttributes` request.
     * @param {Object} [params] The key-value pairs of parameters to send.
     * @return {Promise}
     */
    updateData: function updateData(params) {
      const changed = this.getChanges(params);
      if (Object.keys(changed).length === 0) {
        return Promise.reject('no changes to save');
      }
      return Bridge.request('base:SetAttributes', this.Map.GetDestination(params), changed).then(() => {
        // A successful SetAttributes call returns an EmptyMessage, so we return the serialized version
        // of the instance so caching works properly.
        const instance = this.instanceStore.get(this.id(params));
        return instance.serialize();
      });
    },
  };
});
