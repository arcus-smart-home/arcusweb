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
 * @module {Class} i2web/connections/merge-data merge-data
 * @parent app.connections
 *
 * Implements a can-connect behavior that does a deep merge between the existing instance and new properties received
 * from a base:ValueChange event.
 *
 * This is really only needed when the attribute changing is an Array, but it's harmless to do it for other types since
 * this is what is eventually done by `attr`.
 *
 * The `removeAttr` attribute should be set to `true` on any Maps that need this behavior. That way a new Array value
 * will completely replace the old one.
 *
 * Without this, the new values for the array get merged with the old and can cause unpredicatable outcomes.
 * i.e
 * ```
 * instance.tags //-> [1,2,3]
 * newValue     //-> [4]
 * result       //-> [4,2,3]
 * // OR
 * instance.tags //-> ['FAVORITE']
 * newValue      //-> []
 * result        //-> ['FAVORITE']
 * ```
 */
import connect from 'can-connect';

export default connect.behavior('merge-data', function mergeData(baseConnect) { // eslint-disable-line prefer-arrow-callback
  return {
    /**
     * @function updatedData
     * @parent i2web/connections/merge-data
     *
     * Merges updated properties with the serialized instance to create an Object
     * representing the desired state of the instance.
     *
     * @param {Object} props Updated properties
     * @param {Object} serialized Serialixed version of the instance
     */
    updatedData: function updatedData(props, serialized) {
      const update = props.serialize ? props.serialize() : props;
      const mergedProps = Object.assign({}, serialized, update);
      baseConnect.updatedData.call(this, mergedProps, serialized);
    },
    /**
     * @function updatedInstance
     * @parent i2web/connections/merge-data
     *
     * Updates instance with updated values.
     * The `removeAttr` property is used in the attr call so if it's `true` a deep merge is done in the `attr` call.
     * Also sets properties on model to indicate it's undergoing a server update.
     *
     * @param {Object} props Updated properties
     * @param {Object} serialized Serialixed version of the instance
     */
    updatedInstance: function updatedInstance(instance, props) {
      const update = props.serialize ? props.serialize() : props;

      instance._updateSource = 'server';
      if (instance.constructor.removeAttr) {
        const updated = Object.assign({}, instance.serialize(), update);
        instance.attr(updated, instance.constructor.removeAttr);
      } else {
        instance.attr(update);
      }
      instance._updateSource = null;

      // Only pass the updated instance to can-map's updatedInstance so it will not attempt
      // to perform another `attr`. It will, however, emit events and everything else.
      baseConnect.updatedInstance.call(this, instance);
    },
  };
});
