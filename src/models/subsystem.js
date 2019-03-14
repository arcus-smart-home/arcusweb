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
 * @module {canMap} i2web/models/subsystem Subsystem
 * @parent app.models
 *
 * @group i2web/models/subsystem.properties 0 properties
 *
 * Base subsystem capabilities shared by all subsystems.
 *
 */
import _ from 'lodash';
import canMap from 'can-map';
import 'can-construct-super';
import canList from 'can-list';
import canDev from 'can-util/js/dev/';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import 'can-map-define';
import subsystemConfig from 'config/subsystem.json';
import deepAssign from 'deep-assign';
import Device from 'i2web/models/device';
import SubsystemCapability from 'i2web/models/capability/Subsystem';
import AppState from 'i2web/plugins/get-app-state';
import { deviceNameSorter } from 'i2web/plugins/sorters';
import makeCloneable from 'i2web/connections/cloneable';
import VideoService from 'i2web/models/service/VideoService';
import RecordingCapability from 'i2web/models/capability/Recording';
import Errors from 'i2web/plugins/errors';

function generateSubsystemDeviceGetter(deviceAttr) {
  return function get(lastSetVal = new Device.List()) {
    if (this.attr(deviceAttr)) {
      const allDevices = AppState().attr('devices');
      const subsystemDevices = this.attr(deviceAttr).attr();

      if (allDevices && subsystemDevices.length) {
        return lastSetVal.replace(allDevices
          .filter(device => subsystemDevices.includes(device.attr('base:address')))
          .sort(deviceNameSorter));
      }

      return lastSetVal.replace([]);
    }
    canDev.warn(`device source ${deviceAttr} not found on subsystem - perhaps subsystem instantiated incorrectly?`);
    return lastSetVal.replace([]);
  };
}

const Subsystem = mixinCapabilitiesBase.extend('Subsystem', {
  /**
   * @property {Object} i2web/models/subsystem.static.metadata metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/subsystem.static
   *
   * Cornea connection metadata.
   * Note that the base id for a subsystem contains a namespace, for example:
   *
   * sublightsnswitches:3d496bfc-1098-493e-afd4-7f56c12dbef6
   */
  metadata: {
    namespace: '',
    destination: 'SERV:{base:id}',
  },
}, {
  setup(attrs) {
    let subsystemName = '';

    if (attrs['base:id'] !== undefined) {
      subsystemName = attrs['base:id'].split(':')[0];
    } else if (attrs['base:address'] !== undefined) {
      subsystemName = attrs['base:address'].split(':')[1];
    } else {
      canDev.warn(`subsystem not instantiated with either a base:id or base:address - perhaps subsystem instantiated incorrectly?`);
    }

    const config = deepAssign({
      slug: '',
      icon: 'icon-platform-unknown-2',
      customComponent: '',
      allDevices: [],
      visible: false,
      ordinal: 999,
      preferenceName: '',
      tutorialLinkKey: '',
      productsLinkKey: '',
    }, subsystemConfig[subsystemName]);

    config.allDevices.forEach((devices) => {
      /**
       * @property {Device.List} i2web/models/subsystem.properties.web:{Subsystem}:{DeviceList} icon
       * @parent i2web/models/subsystem.properties
       *
       * A list of devices of a specific type related to the subsystem. Different subsystems will have
       * different sublists of devices that are associated with the subsystem.
       */
      this.define[`web:${subsystemName}:${devices}`] = {
        Value: Device.List,
        get: generateSubsystemDeviceGetter(`${subsystemName}:${devices}`),
      };
    });

    attrs._config = config;

    return this._super(attrs);
  },
  define: {
    /**
     * @property {String} i2web/models/subsystem.properties.name name
     * @parent i2web/models/subsystem.properties
     *
     * The name of a subsystem. For example:
     *
     * sublightsnswitches:3d496bfc-1098-493e-afd4-7f56c12dbef6
     * ^^^^^^^^^^^^^^^^^^
     */
    name: {
      get() {
        return this.attr('base:id').split(':')[0];
      },
    },
    /**
     * @property {canMap} i2web/models/subsystem.properties._config _config
     * @parent i2web/models/subsystem.properties
     *
     * The configuration used throughout the user interface. For example,
     * display prettified names and routes, and determining whether to show
     * or hide the subsystem on the dashboard.
     */
    _config: {
      Type: canMap,
      value: {},
    },
    /**
     * @property {String} i2web/models/subsystem.properties.analyticsTag analyticsTag
     * @parent i2web/models/subsystem.properties
     *
     * Tag name for analytics purposes. This gives us the oppurtunity to use
     * something other than the slug.
     */
    analyticsTag: {
      get() {
        const slugAltered = this.attr('slug').replace(/-/g, '');
        return this.attr('_config').attr('tag') || slugAltered;
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.displayName displayName
     * @parent i2web/models/subsystem.properties
     *
     * Subsystem human-readable name.
     */
    displayName: {
      get() {
        return this.attr('_config').attr('name') || this.attr('subs:name');
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.icon icon
     * @parent i2web/models/subsystem.properties
     *
     * Subsystem icon.
     */
    icon: {
      get() {
        return {
          type: 'icon',
          value: this.attr('_config').attr('icon'),
        };
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.customComponent customComponent
     * @parent i2web/models/subsystem.properties
     *
     * The name of the custom component used by the subsystem, if just a device list, the name is
     * an empty string.
     */
    customComponent: {
      get() {
        return this.attr('_config').attr('customComponent');
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.customCard customCard
     * @parent i2web/models/subsystem.properties
     *
     * The name of the custom card used by the subsystem, if just a device list, the name is
     * an empty string.
     */
    customCard: {
      get() {
        return this.attr('_config').attr('customCard');
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.preferenceName preferenceName
     * @parent i2web/models/subsystem.properties
     *
     * The name that relates this subsystem do the preference collection
     */
    preferenceName: {
      get() {
        return this.attr('_config').attr('preferenceName');
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.slug slug
     * @parent i2web/models/subsystem.properties
     *
     * Subsystem slug, used for URLs.
     */
    slug: {
      get() {
        return this.attr('_config').attr('slug');
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.tutorialLinkKey tutorialLinkKey
     * @parent i2web/models/subsystem.properties
     *
     * The tutorial key for the particular subsystem.
     */
    tutorialLinkKey: {
      get() {
        return this.attr('_config').attr('tutorialLinkKey');
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.productsLinkKey productsLinkKey
     * @parent i2web/models/subsystem.properties
     *
     * The products link key for the devices appropriate for a particular subsystem.
     */
    productsLinkKey: {
      get() {
        return this.attr('_config').attr('productsLinkKey');
      },
    },
    /**
     * @property {String} i2web/models/subsystem.properties.visible visible
     * @parent i2web/models/subsystem.properties
     *
     * Subsystem visibility
     */
    visible: {
      get() {
        return this.attr('_config').attr('visible');
      },
    },
    /**
     * @property {Object} i2web/models/subsystem.properties.supported supported
     * @parent i2web/models/subsystem.properties
     *
     * Whether the subsystem is fully supported in current release.
     */
    supported: {
      get() {
        return this.attr('_config').attr('supported');
      },
    },
    /**
     * @property {Object} i2web/models/subsystem.properties.ordinal ordinal
     * @parent i2web/models/subsystem.properties
     *
     * Indicates default ordering of subsystem in dashboard listing.
     */
    ordinal: {
      get() {
        return this.attr('_config').attr('ordinal');
      },
    },
    /**
     * @property {Object} i2web/models/subsystem.properties.available available
     * @parent i2web/models/subsystem.properties
     *
     * Whether the subsystem is available at the current place and visible. If this
     * subsystem is the alarm subsystem, available will be false but only because it
     * is currently suspended.
     */
    available: {
      get(lastSetVal, setAttr) {
        if (this.attr('slug') === 'alarms') {
          const suspended = this.attr('subs:state') === SubsystemCapability.STATE_SUSPENDED;
          return this.attr('visible') && (suspended || this.attr('subs:available'));
          // Additional check to see if there are recordings available even if there are no cameras,
          // if there is at least 1 recording then it will show the camera card on the dashboard.
        } else if (this.attr('slug') === 'cameras' && this.attr('visible')) {
          if (this.attr('subs:available')) {
            return true;
          }
          const place = AppState().attr('place');
          if (place && !place.attr('isBasic')) {
            VideoService.PageRecordings(AppState().attr('place.base:id'), 1, null, false, true, RecordingCapability.TYPE_RECORDING, null, null, [], []).then(({ recordings }) => {
              setAttr(recordings && recordings.length);
            }).catch((e) => {
              Errors.log(e);
            });
          }
          return false;
        }
        return this.attr('visible') && this.attr('subs:available');
      },
    },
    /**
     * @property {Object} i2web/models/subsystem.properties.unavailable unavailable
     * @parent i2web/models/subsystem.properties
     *
     * Whether the subsystem is unavailable at the current place but visible
     */
    unavailable: {
      get() {
        return this.attr('visible') && !this.attr('available');
      },
    },
    /**
     * @property {Object} i2web/models/subsystem.properties.allDevices allDevices
     * @parent i2web/models/subsystem.properties
     *
     * A list of all devices tied to this subsystem.
     */
    allDevices: {
      get(lastSetVal = new Device.List()) {
        let allDevices = new Device.List([]);
        const sources = this.attr('_config').attr('allDevices');
        if (sources) {
          sources.forEach((source) => {
            const sourceDevices = this.attr(`web:${this.attr('name')}:${source}`);
            if (sourceDevices && sourceDevices.length) {
              allDevices = allDevices.concat(sourceDevices);
            }
          });
          return lastSetVal.replace(allDevices.sort(deviceNameSorter));
        }
        return lastSetVal.replace([]);
      },
    },
    /**
     * @property {string} subalarm:recordingDurationDescription
     * @parent i2web/models/subsystem.properties
     * @description The recording duration in minutes, should default to `5 minute` if
     * subalarm:recordingDurationSec is undefined
     */
    'subalarm:recordingDurationDescription': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('subalarm')) {
            const duration = this.attr('subalarm:recordingDurationSec');

            if (duration) {
              const minutes = Math.floor(duration / 60);
              const seconds = duration - (minutes * 60);
              return `${minutes} minute${seconds !== 0 ? ` ${seconds} second` : ''}`;
            }

            return `${(300 / 60)} minute`;
          }
          // TODO remove warning?
          canDev.warn('calling subalarm:recordingDurationDescription when subsystem has no capability that implements subalarm - perhaps subalarm instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on subsystem - perhaps subsystem instantiated incorrectly?');
        return null;
      },
    },
  },
});

const SubsystemList = canList.extend('subList', {
  Map: Subsystem,
}, {
  /**
   * @function findByName
   * @parent i2web/models/subsystem
   * @description Finds a subsystem by name from the list
   */
  findByName(name) {
    return _.find(this, (subsystem) => {
      const parts = subsystem.attr('base:id').split(':');
      return parts[0] === name;
    });
  },
  /**
   * @function findBySlug
   * @parent i2web/models/subsystem
   * @description Finds a subsystem by slug from the list
   */
  findBySlug(slug) {
    return _.find(this, subsystem => subsystem.attr('slug') === slug);
  },
});
Subsystem.List = SubsystemList;

export const SubsystemConnection = ModelConnection('sub', 'base:address', Subsystem, SubsystemList);
Subsystem.connection = SubsystemConnection;
makeCloneable(Subsystem);

export default Subsystem;
