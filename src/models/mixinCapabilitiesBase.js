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
 * @module {canMap} i2web/models/mixincaps Mixin Capabilities Base
 * @parent app.models
 *
 * Extends Base model to mixin capabilities based in `base:caps`.
 */
import canDev from 'can-util/js/dev/';
import Base from './base';
import Capabilities from './capability/';
import 'can-map-define';
import _uniq from 'lodash/uniq';
import each from 'can-util/js/each/';

const mixinCapabilitiesBase = Base.extend({
  define: {
    /**
     * @property {Object} product
     * @parent i2web/models/mixinCapabilitiesBase
     *
     * Instance capabilities
     */
    'web:base:instanceCaps': {
      get() {
        let instanceCaps = [];
        if (this.attr('base:instances')) {
          each(this.attr('base:instances').attr(), (instCaps) => {
            instanceCaps = instanceCaps.concat(instCaps);
          });
          instanceCaps = _uniq(instanceCaps);
        }
        return instanceCaps;
      },
    },
  },
  /**
   * @function init
   *
   * Called when a new instance is created.
   * Mixes in capabilities based on the capabilities in base:caps.
   */
  init() {
    const capabilities = this.attr('base:caps') || [];
    if (capabilities.length === 0) {
      canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
    }

    capabilities.forEach((capability) => {
      if (Capabilities.hasOwnProperty(capability)) {
        this.mixin(Capabilities[capability]);
      }
    });

    const instances = this.attr('base:instances') ? this.attr('base:instances').attr() : {};

    Object.keys(instances).forEach((key) => {
      const instance = instances[key] || [];

      instance.forEach((capability) => {
        if (Capabilities.hasOwnProperty(capability)) {
          const mixinCapbility = Capabilities[capability];
          this.mixin(mixinCapbility, [], false);

          mixinCapbility.writeableAttributes.forEach((attribute) => {
            this.attr('writeableAttributes').push(`${attribute}:${key}`);
          });
        }
      });
    });
  },
  /**
   * @function hasCapability
   * @parent i2web/models/mixinCapabilitiesBase
   * @param {String} cap Capability name
   * @return {Boolean} Whether the model has the passed capability
   */
  hasCapability(cap) {
    if (this.attr('base:caps')) {
      return this.attr('base:caps').indexOf(cap) !== -1 || this.attr('web:base:instanceCaps').indexOf(cap) !== -1;
    }
    // TODO remove warning?
    canDev.warn('no base:caps found - perhaps instantiated incorrectly?');
    return false;
  },
});

export default mixinCapabilitiesBase;
