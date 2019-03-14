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
 * @module {canMap} i2web/models/base Base Capability
 * @parent app.models
 *
 * A [canMap](https://canjs.com/docs/canMap.html) that implements
 * [Base Capability](https://eyeris.atlassian.net/wiki/display/I2D/Base+Capability).
 */
import _ from 'lodash';
import canMap from 'can-map';
import canList from 'can-list';
import canEvent from 'can-event';
import 'can-list-sort';
import stringUtils from 'can-util/js/string/';
import 'can-map-define';
import Bridge from 'i2web/cornea/bridge';
import PropertyAliases from 'i2web/cornea/property-aliases';
import Cornea from 'i2web/cornea/';
import superMap from 'i2web/connections/superMap';
import observation from 'can-observation';

const Base = canMap.extend({
  removeAttr: true,

  /**
   * @function GetDestination
   *
   * Generates a destination using the provided template and props.
   * @param {Object} props values to populate the template with.
   * @return {String}
   */
  GetDestination(props) {
    // Add namespace prop
    props.namespace = this.metadata.namespace;
    // Add base:id if all we have is base:address
    // This allows requests with base:id or base:address to work
    if (props['base:address'] && !props['base:id'] && !props['base:address'].includes('SERV:sub')) {
      props['base:id'] = props['base:address'].split(':')[2];
    }
    if (props['base:address'] && props['base:address'].includes('SERV:sub')) {
      props['base:id'] = props['base:address'].split(':').slice(1).join(':');
    }
    return stringUtils.sub(this.metadata.destination, props);
  },
}, {
  define: {
    /**
     * @property {Array} writeableAttributes
     * @parent i2web/models/base
     */
    writeableAttributes: {
      value: [],
    },
    /**
     * @property {Boolean} isFavorite
     * @parent i2web/models/base
     *
     * Determines if the model instance has been marked as a favorite thing.
     */
    isFavorite: {
      get() {
        const tags = this.attr('base:tags');
        return (tags && tags.indexOf('FAVORITE') > -1);
      },
    },
  },

  /**
   * @function mixin
   * @param {Object} model The capability being mixed in
   */
  mixin(model, exclude = [], includeWriteableAttributes = true) {
    Object.keys(model.methods).forEach((name) => {
      if (exclude.indexOf(name) === -1) {
        this[name] = model.methods[name];
      }
    });
    if (includeWriteableAttributes) {
      this.attr('writeableAttributes', this.attr('writeableAttributes').concat((model.writeableAttributes || [])));
    }
  },

  /**
   * @function GetDestination
   *
   * Generates a destination using the model's instance properties.
   * @return {String}
   */
  GetDestination() {
    let ret;

    observation.ignore(() => { // don't create observation dependencies while calling this.attr()
      ret = this.constructor.GetDestination(this.attr());
    })();

    return ret;
  },

  /**
   * @function GetAttributes
   *
   * Retrieves all the attributes from the listed namespaces.
   * If no namespaces are provided all attributes are returned.
   * @param {String} namespaces
   * @return {Promise}
   */
  GetAttributes(namespaces) {
    const ns = (namespaces) ? { namespaces } : {};
    return Bridge.request('base:GetAttributes', this.GetDestination, ns);
  },

  /**
   * @function SetAttributes
   *
   * Sets the given attributes associated with the request.
   * There is no guarantee of atomicity for this request, in the case of an error
   * none, some, or all of the changes may have taken affect.
   * @param {Object} attributes
   * @return {Promise}
   */
  SetAttributes(attributes) {
    return Bridge.request('base:SetAttributes', this.GetDestination(), { attributes });
  },

  /**
   * @function AddTags
   *
   * Adds the given tags to the object.
   * @param {Set<String>} tags
   * @return {Promise}
   */
  AddTags(tags) {
    const list = typeof tags === 'string' ? [tags] : tags;
    return Bridge.request('base:AddTags', this.GetDestination(), { tags: _.uniq(list) });
  },

  /**
   * @function RemoveTags
   *
   * Removes the given tags from the object.
   * @param {Set<String>} tags
   * @return {Promise}
   */
  RemoveTags(tags) {
    const list = typeof tags === 'string' ? [tags] : tags;
    return Bridge.request('base:RemoveTags', this.GetDestination(), { tags: _.uniq(list) });
  },
});

/**
 * @constructor {canList} i2web/models/base.static.List List
 * @parent i2web/models/base.static
 */
Base.List = canList.extend({
  Map: Base,
}, {});

/**
 * @function {canList} i2web/models/base.ModelConnection ModelConnection
 * @parent i2web/models/base
 *
 * Creates a [can-connect](https://connect.canjs.com/) connection using a common
 * set of behviors.
 *
 * @param {String} name namespace of the model
 * @param {String} idProp property that identifies the model
 * @param {canMap} Map model constructor
 * @return {i2web/connections/superMap}
 */
export const ModelConnection = (name, idProp, MapConstructor, ListConstructor) => {
  if (!ListConstructor) {
    ListConstructor = canList.extend(`${name}List`, {  // eslint-disable-line no-param-reassign
      Map: MapConstructor,
    }, {});
  }
  MapConstructor.List = ListConstructor;
  const connection = superMap({
    idProp,
    Map: MapConstructor,
    List: ListConstructor,
    name,
  });

  function aliasProperties(event, obj) {
    const alias = PropertyAliases.alias[event];
    if (alias) { alias(obj); }
  }

  Cornea.on(`${name} base:ValueChange`, (obj) => {
    aliasProperties(`${name} base:ValueChange`, obj);

    const instance = connection.instanceStore.get(obj['base:address']);
    if (instance) {
      // let models know about any 'base:ValueChange' message they receive
      // some models need to be notified they've received an update from the server even if that update doesn't produce
      // a value change event during the model update
      // eg. some thermostat models need to know if their last change was "accepted" by the platform and that's
      //     communicated by a base:ValueChange which sets the VM to the same value that was just sent to the platform
      //     (this doesn't produce a value change event since it's the same value)
      canEvent.trigger.call(instance, 'base:ValueChange', [obj]);

      // update state of the model
      connection.updateInstance(obj);
    }
  });

  Cornea.on(`${name} base:Added`, (obj) => {
    aliasProperties(`${name} base:Added`, obj);
    connection.createInstance(obj);
  });

  Cornea.on(`${name} base:Deleted`, (obj) => {
    const instance = connection.instanceStore.get(obj['base:address']);

    // let models know about any 'base:Deleted' message they receive
    // some models need to be notified they've been deleted so they can null out observables that reference them
    // eg. a hub is deleted, but the model instance is still referenced by the app state, set it to null
    if (instance) {
      canEvent.trigger.call(instance, 'base:Deleted', [obj]);
      instance.stopTrackingChanges(); // TODO: might want to call this elsewhere to make sure we release models for garbage collection
    }

    connection.destroyInstance(obj);
  });

  return connection;
};

export default Base;
