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

import connect from 'can-connect';
import dataCornea from './data-cornea';
import dataParse from 'can-connect/data/parse/';
import constructor from 'can-connect/constructor/';
import constructorStore from 'can-connect/constructor/store/';
import constructorHydrate from 'can-connect/can/constructor-hydrate/constructor-hydrate';
import canMapAddress from './can-map-address';
import canMap from 'can-connect/can/map/';
import canMapDiff from './can-map-diff';
import dataCallbacks from 'can-connect/data/callbacks/';
import realTime from 'can-connect/real-time/';
import constructorCallbacksOnce from 'can-connect/constructor/callbacks-once/';
import mergeData from './merge-data';
import strictSave from './strict-save';

/**
 * @typedef {{}} i2web/connections/superMap superMap
 * @parent app.connections

 * A connection with the required can-connect behaviors including [i2web/connections/data-cornea].
 * @option {Object} options key-value pairs to configure can-connect.
 */
const superMap = function superMap(options = {}) {
  const behaviors = [
    dataCornea,
    dataParse,
    constructor,
    constructorStore,
    canMapAddress,
    canMap,
    canMapDiff,
    constructorHydrate,
    dataCallbacks,
    // 'data-callbacks-cache',
    realTime,
    constructorCallbacksOnce,
    mergeData,
    strictSave,
  ];

  // Curtis: Disabling localstorage caching since it does not handle patch updates
  // which is exactly what the API sends in base:ValueChange events.

  // options.cacheConnection = connect(['data-localstorage-cache'], {
  //  name: options.name + 'Cache',
  //  idProp: options.idProp,
  //  algebra: options.algebra
  // });

  // behaviors.push('fall-through-cache');

  // This disables can-connect's internal sorting and give full control over the order of mixins to the user.
  // CAUTION: The order absolutely matters, so be careful when adding new behaviors.
  // Consider removing this when https://github.com/canjs/can-connect/issues/130 is fixed.
  // connect.order = [];

  return connect(behaviors, options);
};

export default superMap;
