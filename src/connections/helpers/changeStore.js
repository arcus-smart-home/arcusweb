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
 * @module {Class} i2web/connections/helpers/changeStore changeStore
 * @parent api.connections
 *
 * Implements a store for tracking changes to an insyance.
 *
 * Changes are stored by the instance's id.
 *
 * @group i2web/connections/helpers/changeStore.properties 0 properties
 *
 * @signature new ChangeStore(behavior)
 *
 * @param {Object} options
 *   @option {can-connect.Behavior} behavior The calling behavior.
 */
export default class ChangeStore {
  constructor(behavior) {
    /**
     * @property {Number} i2web/connections/helpers/changeStore.properties.behavior behavior
     * @parent i2web/connections/helpers/changeStore.properties
     *
     * The calling can-connect behavior.
     **/
    this.behavior = behavior;
    /**
     * @property {Object} i2web/connections/helpers/changeStore.properties.entries entries
     * @parent i2web/connections/helpers/changeStore.properties
     *
     * The data store.
     **/
    this.entries = {};
  }
  /**
   * @function _getId
   * @parent i2web/connections/helpers/changeStore
   *
   * Returns the id of an instance.
   * If the instance is a clone, tie the changes to the original's ID
   * If the instance is a string, we assume it's already an id.
   *
   * @param {Object|canMap|String} instanceOrId
   * @return {String}
   */
  _getId(instanceOrId) {
    if (typeof instanceOrId === 'string') return instanceOrId;
    if (instanceOrId._original) return this.behavior.id(instanceOrId._original);
    return this.behavior.id(instanceOrId);
  }
  /**
   * @function _createEntry
   * @parent i2web/connections/helpers/changeStore
   *
   * Creates a new entry in the store.
   *
   * @param {String} id
   * @return {Array}
   */
  _createEntry(id) {
    this.entries[id] = [];
    return this.entries[id];
  }
  /**
   * @function _getEntry
   * @parent i2web/connections/helpers/changeStore
   *
   * Retrieves an entry in the store.
   * If no entry exists, one is created.
   *
   * @param {Object|canMap} instance
   * @return {Array}
   */
  _getEntry(instance) {
    const id = this._getId(instance);
    if (this.entries[id]) {
      return this.entries[id];
    }
    return this._createEntry(id);
  }
  /**
   * @function _removeEntry
   * @parent i2web/connections/helpers/changeStore
   *
   * deletes a entry in the store.
   *
   * @param {Object|canMap} instance
   */
  _removeEntry(instance) {
    const id = this._getId(instance);
    this.entries[id] = [];
  }
  /**
   * @function _getWriteable
   * @parent i2web/connections/helpers/changeStore
   *
   * Returns an array of writeable attributes.
   * Use the writeableAttributes property, if it exists
   * Use its serialized keys, if serialize is defined
   * Use all of the instance's keys
   *
   * @param {Object|canMap} instance
   */
  _getWriteable(instance) {
    const writeable = instance.attr('writeableAttributes');
    if (writeable) {
      return writeable.attr();
    }
    return Object.keys(instance.serialize ? instance.serialize() : instance);
  }
  /**
   * @function add
   * @parent i2web/connections/helpers/changeStore
   *
   * Adds an entry.
   *
   * @param {Object|canMap} instance
   * @param {String} attr the changed attribute
   */
  add(instance, attr) {
    const entry = this._getEntry(instance);
    const keys = this._getWriteable(instance);
    // Only add writeable attributes if they are defined and keep the list unique
    if (keys.indexOf(attr) !== -1 && entry.indexOf(attr) === -1) {
      entry.push(attr);
    }
  }
  /**
   * @function clear
   * @parent i2web/connections/helpers/changeStore
   *
   * Clears all entries of an instance.
   *
   * @param {Object|canMap} instance
   */
  clear(instance) {
    this._removeEntry(instance);
  }
  /**
   * @function get
   * @parent i2web/connections/helpers/changeStore
   *
   * Get all entries of an instance.
   *
   * @param {Object|canMap} instance
   */
  get(instance) {
    return this._getEntry(instance);
  }
}
