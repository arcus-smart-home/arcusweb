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
 * @module {Class} i2web/connections/can-map-diff can-map-diff
 * @parent app.connections
 * @module {can-connect.Behavior} i2web/connections/can-map-diff can-map-diff
 * @parent api.connections
 *
 * @group i2web/connections/can-map-diff.properties 0 Properties
 * @group i2web/connections/can-map-diff.can-map 0 Map Instance Methods
 *
 * Implements a can-connect behavior that stores the difference in a Map between calls to save().
 * Ignores changes made to a map during a server-initiated update.
 *
 * Used to determine what changes should be sent to the server as part of the next save().
 *
 * A data structure containing all top-level attributes that have changed since the last save is maintained by
 * this behavior.
 *
 * After a successful save, the changes are cleared out.
 */
import connect from 'can-connect';
import canMap from 'can-map';
import ChangeStore from './helpers/changeStore';
import overwrite from './helpers/overwrite';

const mapOverwrites = {
  init: function init(base, connection) { // eslint-disable-line no-unused-vars
    /**
     * @function i2web/connections/can-map-diff.can-map.init init
     * @parent i2web/connections/can-map-diff.can-map
     *
     * @description Called when an instance of the Map is created.
     * Starts tracking all changes on the instance via the [i2web/connections/can-map-diff.properties.changeStore changeStore].
     */
    return function newInit() {
      this.startTrackingChanges();
      base.apply(this, arguments);
    };
  },
  save: function save(base, connection) {
    /**
     * @function i2web/connections/can-map-diff.can-map.save save
     * @parent i2web/connections/can-map-diff.can-map
     *
     * Persists the map's data to the connection.
     * Augments the implementation provided by can-connect's can-map.
     */
    return function newSave(success, error) {
      const promise = connection.save(this);

      return promise.then(success, error);
    };
  },
  _changeTrackingHandler: function createChangeTrackingHandler(base, connection) {
    /**
     * @function _changeTrackingHandler
     * @parent i2web/connections/can-map-diff.can-map
     *
     * Handler for model change events, tracking what properties are modified.
     * Only tracks top-level property changes. For example an attr of `config.color.hue` would only track the `config`
     * property. The entire `config` Object is dirty so storing the exact property is unneeded.
     *
     * @param {Event} ev
     * @param {String} attr
     */
    return function _changeTrackingHandler(ev, attr) {
      // don't track changes made by server pushed model modifications
      if (this._updateSource !== 'server') {
        const parts = attr.split('.');
        let changedAttr;
        // If we are dealing with a deep change, extract the top-level attributes
        // name and use that.
        if (parts.length > 1) {
          changedAttr = parts[0];
        } else {
          changedAttr = attr;
        }
        connection.trackChange(this, changedAttr);
      }
    };
  },
  startTrackingChanges: function createStartTrackingChanges() {
    /**
     * @function startTrackingChanges
     * @parent i2web/connections/can-map-diff.can-map
     *
     * Start tracking changes via the [i2web/connections/can-map-diff.can-map/_changeTrackingHandler changeTrackingHandler]
     */
    return function startTrackingChanges() {
      if (!this._trackingChanges) {
        this.bind('change', this._changeTrackingHandler);
        this._trackingChanges = true;
      }
    };
  },
  stopTrackingChanges: function createStopTrackingChanges() {
    /**
     * @function stopTrackingChanges
     * @parent i2web/connections/can-map-diff.can-map
     *
     * Stop tracking changes via the [i2web/connections/can-map-diff.can-map/_changeTrackingHandler changeTrackingHandler]
     */
    return function stopTrackingChanges() {
      this.unbind('change', this._changeTrackingHandler);
      this._trackingChanges = false;
    };
  },
};

export default connect.behavior('can-map-diff', (baseConnect) => {
  const behavior = {
    init: function init() {
      /**
       * @property {i2web/connections/helpers/changeStore} i2web/connections/can-map-diff.properties.changeStore
       * @parent i2web/connections/can-map-diff.properties
       *
       * A store of changes made to instances between saves.
       *
       * Stores changes by their instance's id.
       *
       * ```js
       * connection.trackChange(instance, 'color');
       * connection.changeStore.get(instance); //-> ['color']
       * ```
       */
      this.changeStore = new ChangeStore(this);
      this.Map = this.Map || canMap.extend({});

      // Overwrite this.Map.prototype with the functions in mapOverwrites
      overwrite(this, this.Map, mapOverwrites, {});
      baseConnect.init.apply(this, arguments);
    },
    /**
     * @function save
     * @parent i2web/connections/can-map-diff
     *
     * Removes tracked changes after a successful save.
     *
     * @param {Object|canMap} instance
     * @return {Promise}
     */
    save: function save(instance) {
      const base = baseConnect.save.apply(this, arguments);
      // Only clear out the tracked changes on a successful change
      return base.then(() => {
        this.afterSave(instance);
      });
    },
    /**
     * @function trackChange
     * @parent i2web/connections/can-map-diff
     *
     * Tracks a change to an instance in the [i2web/connections/can-map-diff/changeStore].
     *
     * @param {Object|canMap} instance
     * @param {String} attr
     */
    trackChange(instance, attr) {
      this.changeStore.add(instance, attr);
    },
    /**
     * @function removeChanges
     * @parent i2web/connections/can-map-diff
     *
     * Clears all tracked changes for an instance.
     * Called after a successful save.
     *
     * @param {Object|canMap} instance
     * @param {String} attr
     */
    removeChanges(instance) {
      this.changeStore.clear(instance);
    },
    /**
     * @function afterSave
     * @parent i2web/connections/can-map-diff
     *
     * Callback invoked after a successful save.
     *
     * @param {Object|canMap} instance
     */
    afterSave: function afterSave(instance) {
      this.removeChanges(instance);
    },
  };
  return behavior;
});
