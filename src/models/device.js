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
 * @module {canMap} i2web/models/device Device
 * @parent app.models
 *
 * Base device capabilities shared by all devices.
 */
import 'can-map-define';
import 'can-construct-super';
import isFunction from 'can-util/js/is-function/';
import each from 'can-util/js/each/';
import Errors from 'i2web/plugins/errors';
import canDev from 'can-util/js/dev/';
import deepAssign from 'deep-assign';
import colorConvert from 'color-convert';
import { capabilityPlugins, productConfig, deviceTypeConfig, defaultConfig } from 'config/device';
import AppState from 'i2web/plugins/get-app-state';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import moment from 'moment';
import _find from 'lodash/find';
import _flatten from 'lodash/flattenDeep';
import _isEmpty from 'lodash/isEmpty';
import _map from 'lodash/map';
import _pickBy from 'lodash/pickBy';
import _size from 'lodash/size';
import _startCase from 'lodash/startCase';
import _uniq from 'lodash/uniq';
import schedulersFor from 'i2web/components/schedule/device-schedulers';
import temperatureConverter from 'i2web/plugins/temperature-converter';
import makeCloneable from 'i2web/connections/cloneable';
import { ZoneList } from './irrigation-zone';
import { PetTokenList } from './pettoken';

// capabilities
import ContactCapability from 'i2web/models/capability/Contact';
import DeviceConnectionCapability from 'i2web/models/capability/DeviceConnection';
import DeviceOtaCapability from 'i2web/models/capability/DeviceOta';
import DevicePowerCapability from 'i2web/models/capability/DevicePower';
import DoorLockCapability from 'i2web/models/capability/DoorLock';
import HaloCapability from 'i2web/models/capability/Halo';
import HoneywellTCCCapability from 'i2web/models/capability/HoneywellTCC';
import IrrigationControllerCapability from 'i2web/models/capability/IrrigationController';
import MotorizedDoorCapability from 'i2web/models/capability/MotorizedDoor';
import PresenceCapability from 'i2web/models/capability/Presence';
import ProductCatalogService from 'i2web/models/service/ProductCatalogService';
import ShadeCapability from 'i2web/models/capability/Shade';
import SpaceHeaterCapability from 'i2web/models/capability/SpaceHeater';
import SwitchCapability from 'i2web/models/capability/Switch';
import ThermostatCapability from 'i2web/models/capability/Thermostat';
import TiltCapability from 'i2web/models/capability/Tilt';
import TwinStarCapability from 'i2web/models/capability/TwinStar';
import ValveCapability from 'i2web/models/capability/Valve';
import WaterHeaterCapability from 'i2web/models/capability/WaterHeater';
import WifiCapability from 'i2web/models/capability/WiFi';

const Device = mixinCapabilitiesBase.extend('Device', {
  /**
   * @property {Object} i2web/models/device.static.metadata metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/device.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'dev',
    destination: 'DRIV:{namespace}:{base:id}',
  },
  /*
   * @property {number} THERMOSTAT_MIN_TEMPERATURE
   * @parent i2web/models/device
   *
   * Minimum temperature separation allowed on auto thermostats; 3 degrees Farenheit (1.67 C)
   */
  THERMOSTAT_MIN_SEPARATION: 3,
  /*
   * @property {number} THERMOSTAT_MIN_TEMPERATURE
   * @parent i2web/models/device
   *
   * Minimum temperature settings allowed on thermostats; 45 degrees Farenheit (7.22222222 C)
   */
  THERMOSTAT_MIN_TEMPERATURE: 45,
  /*
   * @property {number} THERMOSTAT_MAX_TEMPERATURE
   * @parent i2web/models/device
   *
   * Maximum temperature settings allowed on thermostats; 95 degrees Farenheit (35 C)
   */
  THERMOSTAT_MAX_TEMPERATURE: 95,
}, {
  init() {
    this._super(arguments);

    // device config options are mixed-in in the following order:
    // 1. Product config
    // 2. Device Type config
    // 3. Default config
    const mixins = [];

    // mix-in options based on product type
    if (this.attr('dev:productId') && productConfig.hasOwnProperty(this.attr('dev:productId'))) {
      mixins.push(productConfig[this.attr('dev:productId')]);
    }

    // mix-in options based on device type hint
    const deviceType = this.attr('dev:devtypehint') ? this.attr('dev:devtypehint').replace(/\W/g, '').toLowerCase() : '';
    if (deviceTypeConfig.hasOwnProperty(deviceType)) {
      mixins.push(deviceTypeConfig[deviceType]);
    } else {
      canDev.warn(`Invalid device type "${deviceType}" found. Reverting to default`);
    }

    // mix-in default options
    mixins.push(defaultConfig);

    const deviceConfig = deepAssign({}, ...mixins.reverse());
    each(deviceConfig, (value, option) => {
      this.attr(option, value);
    });

    // load badges and configurators
    const plugins = Object.keys(capabilityPlugins).filter((key) => {
      const capability = key.split(':')[0];
      return this.hasCapability(capability);
    });
    this.attr('_capabilityPlugins', plugins.map((p) => {
      return { attribute: p, capability: capabilityPlugins[p] };
    }));
  },
  define: {
    /**
     * @property {CanList<Object>} _capabilityPlugins
     * @parent i2web/models/device
     * @description The plugins matched from 'config/device.js' based on the capabilites of the device
     */
    _capabilityPlugins: {
      type: '*',
    },
    /**
     * @property {canList} badges
     * @parent i2web/models/device
     *
     * Badges that apply to this device. These are pulled in based on the capabilities
     * and devicetypehint of the device
     */
    badges: {
      get() {
        const plugins = this.attr('_capabilityPlugins');
        // to create a binding for each property
        plugins.forEach(p => this.attr(p.attribute));
        const filtered = plugins
          .filter((p) => {
            const value = this.attr(p.attribute);
            return p.capability.hasOwnProperty('badges')
              && (value !== null || value !== undefined);
          })
          .map((p) => {
            const _badges = p.capability.badges;
            return isFunction(_badges) ? _badges.call(this) : _badges;
          });
        return _uniq(_flatten(filtered));
      },
    },
    /**
     * @property {canList} configurators
     * @parent i2web/models/device
     *
     * Configurators that apply to this device. These are pulled in based on the capabilities
     * and devicetypehint of the device
     */
    configurators: {
      get() {
        const plugins = this.attr('_capabilityPlugins');
        // to create a binding for each property
        plugins.forEach(p => this.attr(p.attribute));
        const filtered = plugins
          .filter((p) => {
            const value = this.attr(p.attribute);
            return p.capability.hasOwnProperty('configurators')
              && (value !== null || value !== undefined);
          })
          .map((plugin) => {
            const _configurators = plugin.capability.configurators;
            return isFunction(_configurators) ? _configurators.call(this) : _configurators;
          });
        return _uniq(_flatten(filtered));
      },
    },
    'devadv:errors': {
      set(val) {
        if (_isEmpty(val.attr())) {
          return undefined;
        }

        return val;
      },
    },
    /**
    * @property {Object} product
    * @parent i2web/models/device
    *
    * The product catalog item associated with this device and place
    */
    product: {
      get(lastSetVal, setAttr) {
        const productId = this.attr('dev:productId');
        if (productId) {
          const products = AppState().attr('products');
          const placeAddress = AppState().attr('place.base:address');
          if (products && products.hasOwnProperty(productId)) {
            return products.attr(productId);
          }
          ProductCatalogService.GetProduct(placeAddress, productId)
            .then(({ product }) => {
              if (!_isEmpty(product)) {
                if (products) {
                  products.attr(product['product:id'], product);
                }
                setAttr(product);
              }
            })
            .catch(Errors.log);
        }
        // TODO remove warning?
        canDev.warn('no dev:productId found on device - perhaps device instantiated incorrectly?');
        return undefined;
      },
    },
    /**
     * @property {Object} icon
     * @parent i2web/models/device
     *
     * The icon of the device and whether it is a class or a URL
     */
    icon: {
      get() {
        return {
          type: 'icon',
          value: this.attr('web:icon:off'),
        };
      },
    },
    name: {
      get() {
        return this.attr('dev:name');
      },
    },
    /**
    * @property {String} productName
    * @parent i2web/models/device
    *
    * The product name to be used on the site
    */
    productName: {
      get() {
        if (this.attr('product')) {
          return `${this.attr('product.product:vendor') || ''} ${this.attr('product.product:shortName') || this.attr('product.product:name') || ''}`;
        }
        return null;
      },
    },
    /**
    * @property {Boolean} isFirmwareUpdateInProgress
    * @parent i2web/models/device
    *
    * Whether this device is in the process of a firmware update
    */
    isFirmwareUpdateInProgress: {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('devota')) {
            return this.attr('devota:status') === DeviceOtaCapability.STATUS_INPROGRESS;
          }
        }
        return false;
      },
    },
    /**
    * @property {Boolean} isOffline
    * @parent i2web/models/device
    *
    * Determines whether this device is offline or not
    */
    isOffline: {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('devconn')) {
            return this.attr('devconn:state') === DeviceConnectionCapability.STATE_OFFLINE;
          }
          // TODO remove warning?
          canDev.warn('calling isOffline when device has no devconn capability - perhaps device instantiated incorrectly?');
          return true;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return true;
      },
    },
    /**
    * @property {Boolean} isBlocked
    * @parent i2web/models/device
    *
    * Indicates special cases when a device is blocked from user interactions and should be shown in a disabled state (e.g. Nest)
    */
    isBlocked: {
      get() {
        const errors = this.attr('errors');
        if (errors) {
          return (this.attr('web:dev:devtypehint') === 'nestthermostat' && errors.hasOwnProperty('ERR_RATELIMIT')) ||
            (this.hasCapability('irrcont') && errors.hasOwnProperty('ERR_TURN_TO_AUTO'));
        }
        return false;
      },
    },
    /**
    * @property {Boolean} isOn
    * @parent i2web/models/device
    *
    * Determines whether this device is "on" or not (different devices interpret "on" differently)
    */
    isOn: {
      get() {
        if (this.attr('isOffline')) { return false; }

        if (this.attr('base:caps')) {
          if (this.hasCapability('swit')) {
            return this.attr('swit:state') === SwitchCapability.STATE_ON;
          }
          if (this.attr('web:isOnUnlessOffline')) {
            return true;
          }
          if (this.hasCapability('cont')) {
            return this.attr('cont:contact') === ContactCapability.CONTACT_OPENED;
          }
          if (this.attr('devconn:state') === DeviceConnectionCapability.STATE_ONLINE) {
            return true;
          }
          // TODO remove warning?
          canDev.warn('calling isOn when device has no capability that implements isOn - perhaps device instantiated incorrectly?');
          return false;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return false;
      },
    },

    /**
    * @property {String} alertedState
    * @parent i2web/models/device
    *
    * Returns an alerted state should one exist.
    */
    alertedState: {
      get() {
        const smokeDetected = this.attr('smoke:smoke');
        const coDetected = this.attr('co:co');
        const leakDetected = this.attr('leakh2o:state');
        const glassBreak = this.attr('glass:break');

        // For release 1.0, devices with alert:state of ALERTING will NOT be flagged in red
        // Only those listed below will be flagged
        if (smokeDetected === 'DETECTED' && coDetected === 'DETECTED') {
          return 'Smoke & CO Detected';
        } else if (smokeDetected === 'DETECTED') {
          return 'Smoke Detected';
        } else if (coDetected === 'DETECTED') {
          return 'CO Detected';
        } else if (leakDetected === 'LEAK') {
          return 'Leak Detected';
        } else if (glassBreak === 'DETECTED') {
          return 'Break Detected';
        }

        return undefined;
      },
    },

    /**
     * @property {Object} warnings
     * @parent i2web/models/device
     *
     * An object containing only WARN_ properties from devadv:errors, as well as
     * warnings derived from other device-specific attributes
     */
    warnings: {
      get() {
        let warns;
        const devadvErrors = this.attr('devadv:errors');

        if (devadvErrors) {
          // Pick WARN_ properties from devadv:errors
          warns = _pickBy(devadvErrors.attr(), (errorStr, errorKey) => { return errorKey.indexOf('WARN') === 0; });
        }
        // Add in device-specific warnings
        if (this.attr('web:dev:devtypehint') === 'halo') {
          if (this.attr('halo:devicestate') === HaloCapability.DEVICESTATE_PRE_SMOKE) {
            // Add Halo presmoke alerts if there are any
            return Object.assign({}, warns, { WARN_PRESMOKE: 'Early Smoke Warning Detected' });
          } else if (this.attr('halo:devicestate') === HaloCapability.DEVICESTATE_WEATHER) {
            // Add Halo weather alerts if there are any
            return Object.assign({}, warns, { WARN_WEATHER: 'Weather Alert' });
          }
        } else if (this.attr('web:watersoftener:lowOnSalt')) {
          return Object.assign({}, warns, { WARN_LOWSALT: 'Low Salt Level' });
        }

        if (!_isEmpty(warns)) {
          return warns;
        }
        return undefined;
      },
    },
    /**
     * @property {Object} errors
     * @parent i2web/models/device
     *
     * An object that omits any WARN_ properties from devadv:errors
     */
    errors: {
      get() {
        const devadvErrors = this.attr('devadv:errors');
        let otherErrors;
        let errs;

        if (devadvErrors) {
          // Omit WARN_ properties from devadv:errors
          errs = _pickBy(devadvErrors.attr(), (errorStr, errorKey) => {
            return errorKey.indexOf('WARN') !== 0;
          });
        }
        if (this.hasCapability('aosmithwaterheatercontroller')) {
          // Add Water Heater errors
          otherErrors = _pickBy(this.attr('aosmithwaterheatercontroller:errors').attr(), (errorStr, errorKey) => {
            return errorKey.indexOf('E') === 0;
          });
        } else if (this.hasCapability('honeywelltcc')) {
          // Add Honeywell TCC errors
          if (this.attr('honeywelltcc:requiresLogin')) {
            otherErrors = Object.assign({ ERR_UNAUTHED_HONEYWELL: 'Honeywell login information needs attention.' });
          } else if (this.attr('honeywelltcc:authorizationState') === HoneywellTCCCapability.AUTHORIZATIONSTATE_DEAUTHORIZED) {
            otherErrors = Object.assign({ ERR_DELETED_HONEYWELL: 'Honeywell account information revoked.' });
          }
        } else if (this.attr('web:dev:devtypehint') === 'huefallback') {
          // Add Hue fallback errors
          otherErrors = Object.assign({ ERR_HUE_FALLBACK: 'Pairing to Hue Bridge required.' });
        } else if (this.hasCapability('irrcont')) {
          // Add Irrigation Controller errors
          if (this.attr('irrcont:controllerState') === IrrigationControllerCapability.CONTROLLERSTATE_OFF) {
            otherErrors = Object.assign({ ERR_TURN_TO_AUTO: 'Manually set dial to "Auto" to work with Arcus.' });
          }
        } else if (this.attr('isObstructed') && (!devadvErrors || !devadvErrors.hasOwnProperty('ERR_OBSTRUCTION'))) {
          // Add traditional obstruction errors
          otherErrors = Object.assign({ ERR_OBSTRUCTION: 'Obstruction Detected.' });
        }
        errs = Object.assign({}, errs, otherErrors);

        if (!_isEmpty(errs)) {
          return errs;
        }
        return undefined;
      },
    },
    /**
    * @property {Object} erroredState
    * @parent i2web/models/device
    *
    * An object with a short and long description of what the errored state is.
    * `short` is used for places like device cards where space is minimal to reflect information
    * where as `long` is more descriptive and used in places such as device panels.
    */
    erroredState: {
      get() {
        const errors = this.attr('errors');
        const isOffline = this.attr('isOffline');
        const isNest = this.attr('web:dev:devtypehint') === 'nestthermostat';
        const isWaterHeater = this.hasCapability('aosmithwaterheatercontroller');

        // First priority is to show Offline
        if (isOffline) {
          return {
            short: 'No Connection',
            long: 'This device is not connected.',
          };
        }
        // Second priority is device-specific errors
        if (errors) {
          if (_size(this.attr('errors')) > 1) {
            return {
              complexErrors: true,
              short: 'Multiple Errors',
              long: 'There are multiple errors.',
            };
          }
          if (isNest) {
            if (errors.hasOwnProperty('ERR_UNAUTHED')) {
              return {
                complexErrors: true,
                action: 'UNAUTHED',
                short: 'Acct Info Revoked',
                long: 'Nest Account Information Revoked.',
              };
            } else if (errors.hasOwnProperty('ERR_DELETED')) {
              return {
                complexErrors: true,
                short: 'Removed in Nest',
                long: 'Device Removed in Nest.',
              };
            } else if (errors.hasOwnProperty('ERR_RATELIMIT')) {
              return {
                short: 'Temp Timeout',
                long: 'Temporary Timeout.',
              };
            }
          } else if (isWaterHeater) {
            if (errors.hasOwnProperty('E01')) {
              return {
                short: 'Insufficient Water',
                long: 'Dry fire risk as there is an insufficient amount of water in tank.',
              };
            } else if (errors.hasOwnProperty('E02')) {
              return {
                short: 'Excessive Temperature',
                long: 'The water temperature in the tank has exceeded 170°F. ',
              };
            } else if (errors.hasOwnProperty('E03')) {
              return {
                short: 'Upper Sensor Failure',
                long: 'The upper temperature sensor in your hot water heater has failed.',
              };
            } else if (errors.hasOwnProperty('E04')) {
              return {
                short: 'Upper Element Failure',
                long: 'The upper heating element in your hot water heater has failed.',
              };
            } else if (errors.hasOwnProperty('E05')) {
              return {
                short: 'Lower Element Failure',
                long: 'The lower heating element in your hot water heater has failed.',
              };
            } else if (errors.hasOwnProperty('E06')) {
              return {
                short: 'Thermostat Failure',
                long: 'The electronic thermostat in your hot water heater has failed.',
              };
            } else if (errors.hasOwnProperty('E07')) {
              return {
                short: 'Lower Sensor Failure',
                long: 'The lower temperature sensor in your hot water heater has failed.',
              };
            } else if (errors.hasOwnProperty('E08')) {
              return {
                short: 'Test Failure',
                long: 'Energy Smart Module (ESM) periodic test has failed.',
              };
            } else if (Object.keys(errors).length > 0) {
              return {
                short: 'Failure',
                long: errors[Object.keys(errors)[0]],
              };
            }
          } else if (errors.hasOwnProperty('ERR_UNAUTHED_HONEYWELL')) {
            return {
              complexErrors: true,
              action: 'UNAUTHED',
              short: 'Requires Login',
              long: 'Honeywell Account Information Revoked.',
            };
          } else if (errors.hasOwnProperty('ERR_DELETED_HONEYWELL')) {
            return {
              complexErrors: true,
              short: 'Requires Pairing',
              long: 'Device Removed in Honeywell.',
            };
          } else if (errors.hasOwnProperty('ERR_UNAUTHED_LUTRON')) {
            return {
              complexErrors: true,
              action: 'UNAUTHED',
              short: 'Acct Info Revoked',
              long: 'Lutron Account Information Revoked.',
            };
          } else if (errors.hasOwnProperty('ERR_DELETED_LUTRON')) {
            return {
              complexErrors: true,
              short: 'Removed in Lutron',
              long: 'Device Removed in Lutron.',
            };
          } else if (errors.hasOwnProperty('ERR_BRIDGE_LUTRON')) {
            return {
              short: 'Bridge Error',
              long: 'Lutron Bridge has an error.',
            };
          } else if (errors.hasOwnProperty('ERR_OBSTRUCTION')) {
            return {
              short: 'Obstructed',
              long: 'Obstruction Detected.',
            };
          } else if (errors.hasOwnProperty('ERR_HUE_FALLBACK')) {
            return {
              short: '',
              long: 'Pairing to Hue Bridge required.',
            };
          }
        }
        // Final priority is any other non-warning items from devadv:errors
        if (errors) {
          const errorObjects = _map(errors, (errorStr, errorKey) => {
            const errKey = errorKey.indexOf('ERR_') === 0 ? errorKey.substring(4) : errorKey;
            return {
              short: _startCase(errKey.toLowerCase()),
              long: errorStr,
            };
          });
          return errorObjects[0];
        }

        return undefined;
      },
    },
    /**
     * @property {Boolean} isObstructed
     * @parent i2web/models/device
     *
     * Determines whether this device is "obstructed" or not
     */
    isObstructed: {
      get() {
        const motdoorObstructed = this.attr('motdoor:doorstate');
        const shadeObstructed = this.attr('shade:shadestate');
        const valveObstructed = this.attr('valv:valvestate');
        const errors = this.attr('devadv:errors');
        return motdoorObstructed === MotorizedDoorCapability.DOORSTATE_OBSTRUCTION
          || shadeObstructed === ShadeCapability.SHADESTATE_OBSTRUCTION
          || valveObstructed === ValveCapability.VALVESTATE_OBSTRUCTION
          || (errors && errors.hasOwnProperty('ERR_OBSTRUCTION'));
      },
    },
    /**
    * @property {Boolean} isOpen
    * @parent i2web/models/device
    *
    * Determines whether this device is "open" or not
    */
    isOpen: {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('cont')) {
            return this.attr('cont:contact') === ContactCapability.CONTACT_OPENED;
          } else if (this.hasCapability('tilt')) {
            const IS_HORIZONTAL = this.attr('base:tags').indexOf('closedOnUpright') !== -1;
            switch (this.attr('tilt:tiltstate')) {
              case TiltCapability.TILTSTATE_FLAT:
                return IS_HORIZONTAL;
              case TiltCapability.TILTSTATE_UPRIGHT:
                return !IS_HORIZONTAL;
              default:
                return false;
            }
          } else if (this.hasCapability('doorlock')) {
            switch (this.attr('doorlock:lockstate')) {
              case DoorLockCapability.LOCKSTATE_UNLOCKED:
              case DoorLockCapability.LOCKSTATE_UNLOCKING:
                return true;
              case DoorLockCapability.LOCKSTATE_LOCKED:
              case DoorLockCapability.LOCKSTATE_LOCKING:
              default:
                return false;
            }
          } else if (this.hasCapability('motdoor')) {
            switch (this.attr('motdoor:doorstate')) {
              case MotorizedDoorCapability.DOORSTATE_OPEN:
              case MotorizedDoorCapability.DOORSTATE_OPENING:
                return true;
              case MotorizedDoorCapability.DOORSTATE_CLOSED:
              case MotorizedDoorCapability.DOORSTATE_CLOSING:
                return false;
              default:
                return false;
            }
          } else if (this.hasCapability('valv')) {
            switch (this.attr('valv:valvestate')) {
              case ValveCapability.VALVESTATE_OPEN:
              case ValveCapability.VALVESTATE_OPENING:
                return true;
              case ValveCapability.VALVESTATE_CLOSED:
              case ValveCapability.VALVESTATE_CLOSING:
                return false;
              default:
                return false;
            }
          }
          // TODO remove warning?
          canDev.warn('calling isOpen when device has no capability that implements isOpen - perhaps device instantiated incorrectly?');
          return false;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return false;
      },
    },

    /**
    * @property {Boolean} isAway
    * @parent i2web/models/device
    *
    * Determines whether this device is away or not
    */
    isAway: {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('pres')) {
            return this.attr('pres:presence') === PresenceCapability.PRESENCE_ABSENT;
          }
          // TODO remove warning?
          canDev.warn('calling isAway when device has no capability that implements isAway - perhaps device instantiated incorrectly?');
          return false;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return false;
      },
    },
    /**
     * @property {Boolean} onBattery
     * @parent i2web/models/device
     *
     * Whether the device is running on battery power
     */
    onBattery: {
      get() {
        const powerSource = this.attr('devpow:source');
        if (powerSource === DevicePowerCapability.SOURCE_BATTERY
          || powerSource === DevicePowerCapability.SOURCE_BACKUPBATTERY) {
          return true;
        }
        return false;
      },
    },
    /**
     * @property {Boolean} isPluggedIn
     * @parent i2web/models/device
     *
     * Whether the device is plugged in, versus running on batteries.
     */
    isPluggedIn: {
      get() {
        return this.attr('devpow:source') === DevicePowerCapability.SOURCE_LINE;
      },
    },
    /**
    * @property {String} colortemp:description
    * @parent i2web/models/device
    *
    * Color temperature description
    * Note this is not persisted to the model - read only
    */
    'colortemp:description': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('colortemp')) {
            const colortemp = this.attr('colortemp:colortemp');
            if (colortemp < 2700) return 'Warm';
            else if (colortemp < 3000) return 'Warm White';
            else if (colortemp < 3500) return 'Neutral';
            else if (colortemp < 4700) return 'Cool White';
            else if (colortemp < 6500) return 'Day Light';
            return 'More Blue Sky';
          }
          // TODO remove warning?
          canDev.warn('calling colortemp:description when device has no capability that implements colortemp - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    /**
    * @property {String} colortemp:iconhex
    * @parent i2web/models/device
    *
    * Icon color hex code
    * Note this is not persisted to the model - read only
    */
    'color:iconhex': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('color')) {
            // the icon color is not the actual color:rgb value, but an HSV approximation using the device's hue and saturation and a fixed 75% brightness
            // this is because HSL with brightness 0 or 100 gives us black or white, and we want the icon to still show the chosen hue/intensity
            return colorConvert.hsv.hex(this.attr('color:hue'), this.attr('color:saturation'), 75);
          }
          // TODO remove warning?
          canDev.warn('calling color:iconhex when device has no capability that implements color - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    /**
    * @property {Boolean} devpow:batteryLow
    * @parent i2web/models/device
    *
    * Whether the battery is low or not
    * Note this is not persisted to the model - read only
    */
    'devpow:batteryLow': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('devpow')) {
            return (this.attr('devpow:source') === DevicePowerCapability.SOURCE_BATTERY && this.attr('devpow:battery') <= 30);
          }
          // TODO remove warning?
          canDev.warn('calling devpow:batteryLow when device has no capability that implements devpow - perhaps device instantiated incorrectly?');
          return false;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return false;
      },
    },
    /**
    * @property {Boolean} spaceheater:setpointDescription
    * @parent i2web/models/device
    *
    * Description of the thermometer setpoints based off of it's state and eco mode if available
    * Note this is not persisted to the model - read only
    */
    'spaceheater:setpointDescription': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('spaceheater')) {
            const state = this.attr('spaceheater:heatstate');
            const setPoint = temperatureConverter(this.attr('spaceheater:setpoint'), 'F');
            const ecoMode = this.attr('twinstar:ecomode');
            let description = '';

            const schedulers = schedulersFor(this);
            const scheduler = schedulers.attr('length') > 0 && schedulers.attr('0');
            if (scheduler && scheduler.attr('isFollowed') && scheduler.attr('nextCommandDescriptionVerbose')) {
              const nextFireTime = moment(scheduler.attr('scheduler:nextFireTime')); // eslint-disable-line no-unused-vars
              const timeFormat = nextFireTime.isSame(new Date(), 'day') ? 'h:mm A' : 'ddd h:mm A';

              return `<i class="icon-app-calendar-1"></i> ${scheduler.attr('nextCommandDescriptionVerbose')} at ${nextFireTime.format(timeFormat)}`;
            }

            if (state === SpaceHeaterCapability.HEATSTATE_OFF) {
              description = `Off`;
            } else if (ecoMode === TwinStarCapability.ECOMODE_ENABLED) {
              description = `Eco Mode`;
            } else {
              description = `Set to ${setPoint}&deg;`;
            }

            return description;
          }
          // TODO remove warning?
          canDev.warn('calling spaceheater:setpointDescription when device has no capability that implements spaceheater - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    /**
    * @property {Boolean} therm:setpointDescription
    * @parent i2web/models/device
    *
    * Description of the thermometer setpints based off of set HVAC mode
    * Note this is not persisted to the model - read only
    */
    'therm:setpointDescription': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('therm')) {
            const hvacMode = this.attr('therm:hvacmode');
            const coolSetpoint = temperatureConverter(this.attr('therm:coolsetpoint'), 'F');
            const heatSetpoint = temperatureConverter(this.attr('therm:heatsetpoint'), 'F');
            let description = '';

            const schedulers = schedulersFor(this);
            const scheduler = schedulers.attr('length') > 0 && schedulers.attr('0');

            if (scheduler && scheduler.attr('isFollowed')
              && scheduler.attr('nextCommandDescriptionVerbose')
              && scheduler.attr('scheduler:commands')
              && _find(scheduler.attr('scheduler:commands'), (cmd) => {
                return cmd.scheduleId === hvacMode;
              })) {
              const nextFireTime = scheduler.attr('scheduler:nextFireTime'); // eslint-disable-line no-unused-vars

              return `<i class="icon-app-calendar-1"></i> ${scheduler.attr('nextCommandDescriptionVerbose')}`;
            }
            switch (hvacMode) {
              case ThermostatCapability.HVACMODE_AUTO:
                description = `${heatSetpoint}&deg; - ${coolSetpoint}&deg;`;
                break;
              case ThermostatCapability.HVACMODE_COOL:
                description = `Cool to ${coolSetpoint}&deg;`;
                break;
              case ThermostatCapability.HVACMODE_HEAT:
                description = `Heat to ${heatSetpoint}&deg;`;
                break;
              case ThermostatCapability.HVACMODE_ECO:
                description = `ECO`;
                break;
              case ThermostatCapability.HVACMODE_OFF:
                description = 'Off';
                break;
              default:
                description = null;
                break;
            }

            return description;
          }
          // TODO remove warning?
          canDev.warn('calling therm:setpointDescription when device has no capability that implements therm - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    /**
    * @property {String} web:waterheater:hotwaterlevelDescription
    * @parent i2web/models/device
    *
    * Hot water level description
    * Note this is not persisted to the model - read only
    */
    'web:waterheater:hotwaterlevelDescription': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('waterheater')) {
            switch (this.attr('waterheater:hotwaterlevel')) {
              case WaterHeaterCapability.HOTWATERLEVEL_HIGH:
                return 'Available';
              case WaterHeaterCapability.HOTWATERLEVEL_MEDIUM:
                return 'Limited';
              case WaterHeaterCapability.HOTWATERLEVEL_LOW:
                return 'No Hot Water';
              default:
                return null;
            }
          }
          // TODO remove warning?
          canDev.warn('calling waterheater:hotwaterlevel when device has no capability that implements waterheater - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    /**
    * @property {String} web:waterheater:lowHeatTargetDescription
    * @parent i2web/models/device
    *
    * Low heat target if setpoint is less than 60 F
    * Note this is not persisted to the model - read only
    */
    'web:waterheater:lowHeatTargetDescription': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('waterheater')) {
            return (this.attr('waterheater:setpoint') < 15.555556) ? 'Low Target' : null;
          }
          canDev.warn('calling waterheater:setpoint when device has no capability that implements waterheater - perhaps device instantiated incorrectly?');
          return null;
        }
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    'fan:speedDescriptions': {
      get() {
        return {
          2: {
            0: 'Off',
            1: 'Low',
            2: 'High',
          },
          3: {
            0: 'Off',
            1: 'Low',
            2: 'Medium',
            3: 'High',
          },
        };
      },
    },
    /**
    * @property {String} fan:speedDescription
    * @parent i2web/models/device
    *
    * Fan speed description
    * Note this is not persisted to the model - read only
    */
    'fan:speedDescription': {
      type: 'string',
      get() {
        const speed = this.attr('fan:speed');
        const maxSpeed = this.attr('fan:maxSpeed');
        if (this.attr('base:caps')) {
          if (this.hasCapability('fan')) {
            const SPEED_FORMATS = this.attr('fan:speedDescriptions');

            return (SPEED_FORMATS[maxSpeed] ? SPEED_FORMATS[maxSpeed][speed] : speed);
          }
          // TODO remove warning?
          canDev.warn('calling fan:speedDescription when device has no capability that implements fan - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },

    'motdoor:doorDescription': {
      type: 'string',
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('motdoor')) {
            const lockState = this.attr('motdoor:doorstate');

            switch (lockState) {
              case MotorizedDoorCapability.DOORSTATE_OPEN:
              case MotorizedDoorCapability.DOORSTATE_CLOSING:
                return 'Open';
              case MotorizedDoorCapability.DOORSTATE_CLOSED:
              case MotorizedDoorCapability.DOORSTATE_OPENING:
                return 'Closed';
              case MotorizedDoorCapability.DOORSTATE_OBSTRUCTION:
                return 'Obstructed';
              default:
                return 'Unknown';
            }
          }
          // TODO remove warning?
          canDev.warn('calling motdoor:doorDescription when device has no capability that implements motdoor - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    'petdoor:lockDescription': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('petdoor')) {
            const lockState = this.attr('petdoor:lockstate');
            // change from all caps to capitalized
            return _startCase(lockState.toLowerCase());
          }
          // TODO remove warning?
          canDev.warn('calling petdoor:lockstate when device has no capability that implements petdoor - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    'doorlock:lockDescription': {
      get() {
        if (this.attr('base:caps')) {
          if (this.hasCapability('doorlock')) {
            const lockState = this.attr('doorlock:lockstate');
            return (lockState) ? _startCase(lockState.toLowerCase()) : null;
          }
          // TODO remove warning?
          canDev.warn('calling doorlock:lockDescription when device has no capability that implements doorlock - perhaps device instantiated incorrectly?');
          return null;
        }
        // TODO remove warning?
        canDev.warn('no base:caps found on device - perhaps device instantiated incorrectly?');
        return null;
      },
    },
    /**
    * @property {String} schedule:nextCommandTerse
    * @parent i2web/models/device
    *
    * A shortened description of the next scheduled event. This does not include dates or times and
    * is used primarily for device cards.
    * Note this is not persisted to the model - read only
    */
    'schedule:nextCommandTerse': {
      get() {
        const schedulers = schedulersFor(this);
        const scheduler = schedulers.attr('length') > 0 && schedulers.attr('0');

        if (scheduler.attr('nextCommandDescriptionTerse')) {
          return `${scheduler.attr('nextCommandDescriptionTerse')}`;
        }

        return undefined;
      },
    },
    /**
    * @property {String} schedule:nextCommandVerbose
    * @parent i2web/models/device
    *
    * A shortened description of the next scheduled event. This does not include dates or times and
    * is used primarily for device panels.
    * Note this is not persisted to the model - read only
    */
    'schedule:nextCommandVerbose': {
      get() {
        const schedulers = schedulersFor(this);
        const scheduler = schedulers.attr('length') > 0 && schedulers.attr('0');

        if (scheduler && scheduler.attr('nextCommandDescriptionVerbose')) {
          return `${scheduler.attr('nextCommandDescriptionVerbose')}`;
        }

        return undefined;
      },
    },
    /**
     * @property {Number} web:watersoftener:saltLevel
     * @parent i2web/models/device
     *
     * The salt level for a watersoftener returned as a percentage to be used
     * on a badge and on the dashboard card
     */
    'web:watersoftener:saltLevel': {
      get() {
        const currentLevel = this.attr('watersoftener:currentSaltLevel');
        const maxLevel = this.attr('watersoftener:maxSaltLevel');
        return Math.round((currentLevel / maxLevel) * 100);
      },
    },
    /**
     * @property {Number} web:watersoftener:lowOnSalt
     * @parent i2web/models/device
     *
     * Whether this device is low on salt. Display a warning message on the dashboard
     * card or display the percentage in red on the panel badge
     */
    'web:watersoftener:lowOnSalt': {
      get() {
        const subsystem = _find(AppState().attr('subsystems'), (sys) => {
          return sys.attr('base:address').includes('subwater');
        });
        if (subsystem) {
          const found = subsystem.attr('subwater:lowSaltDevices')
            .indexOf(this.attr('base:address'));
          return found !== -1;
        }
        return false;
      },
    },
    /**
     * @property {String} web:watersoftener:formattedRechargeTime
     * @parent i2web/models/device
     * @description time left to recharge a watersoftener device formatted as hh:mm
     */
    'web:watersoftener:formattedRechargeTime': {
      get() {
        const remaining = this.attr('watersoftener:rechargeTimeRemaining');
        const hours = Math.floor(remaining / 60);
        const minutes = (remaining % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      },
    },
    /*
     * @property {string} web:dev:devtypehint
     * @parent i2web/models/device
     *
     * Keeps a normalized device type hint with the device to support tests using the same conventions as used in device config file
     */
    'web:dev:devtypehint': {
      get() {
        return this.attr('dev:devtypehint') ? this.attr('dev:devtypehint').replace(/\W/g, '').toLowerCase() : '';
      },
    },
    /*
    * @property {boolean} web:therm:autoSupported
    * @parent i2web/models/device
    *
    * Whether AUTO HVAC mode is supported; derived due to transitional code for Nest Thermostats
    */
    'web:therm:autoSupported': {
      get() {
        if (this.hasCapability('therm')) {
          // Degenerate case for old thermostat drivers lacking either attribute; UI should still allow AUTO mode selection for these
          if (!(typeof this.attr('therm:supportsAuto') === 'boolean' || this.attr('therm:supportedmodes'))) {
            return true;
          }
          const supportedModes = this.attr('therm:supportedmodes') || [];
          return this.attr('therm:supportsAuto') || _find(supportedModes, (m) => { return m === ThermostatCapability.HVACMODE_AUTO; });
        }
        return false;
      },
    },
    /*
    * @property {boolean} web:therm:ecoSupported
    * @parent i2web/models/device
    *
    * Whether ECO HVAC mode is supported
    */
    'web:therm:ecoSupported': {
      get() {
        if (this.hasCapability('therm')) {
          const supportedModes = this.attr('therm:supportedmodes') || [];
          return _find(supportedModes, (m) => { return m === ThermostatCapability.HVACMODE_ECO; });
        }
        return false;
      },
    },
    /*
    * @property {String} web:wifi:state
    * @parent i2web/models/device
    *
    * Wifi state description
    */
    'web:wifi:state': {
      get() {
        const state = this.attr('wifi:state');
        if (state === WifiCapability.STATE_CONNECTED) {
          return 'Wi-Fi Connected';
        }
        return 'Wi-Fi" Disconnected';
      },
    },
    /**
     * @property {string} web:camera:supportsUserRecording
     * @parent i2web/models/device
     *
     * Swann cameras do not support displaying Record buttons and Recording progress
     */
    'web:camera:supportsUserRecording': {
      get() {
        return this.hasCapability('camera') && !this.hasCapability('swannbatterycamera');
      },
    },
    /**
     * @property {string} web:camera:previewImageURL
     * @parent i2web/models/device
     *
     * The full URL to access the preview image for this camera device
     */
    'web:camera:previewImageURL': {
      get() {
        const place = AppState().attr('place');
        const baseURL = AppState().attr('cameraPreviewBaseURL');
        if (this.hasCapability('camera') && place && baseURL) {
          return `${baseURL}/preview/${place.attr('base:id')}/${this.attr('base:id')}`;
        }
        return '';
      },
    },
    /**
     * @property {string} web:irr:zones
     * @parent i2web/models/device
     *
     * A list of Zone models representing the irrigation zones
     */
    'web:irr:zones': {
      get() {
        return ZoneList.fromIrrigationController(this);
      },
    },
    /**
     * @property {string} web:petdoor:pettokens
     * @parent i2web/models/device
     *
     * A list of PetToken models representing the irrigation zones
     */
    'web:petdoor:pettokens': {
      get() {
        return PetTokenList.fromPetDoor(this);
      },
    },
    /**
     * @property {Boolean} isBridge
     * @parent i2web/models/device
     * @description Is the device a bridge device
     */
    isBridge: {
      get() {
        // Product Id b726df is the Somfy blind controller, which is a special type
        // of bridge device that lacks the bridge capability
        return this.hasCapability('bridge') || this.attr('dev:productId') === 'b726df';
      },
    },
    /**
     * @property {boolean} isZWave
     * @parent i2web/models/device
     * @description if the device is a ZWave device.
     */
    isZWave: {
      get() {
        return this.attr('devadv:protocol') === 'ZWAV';
      },
    },
    /**
     * @property {boolean} isZigBee
     * @parent i2web/models/device
     * @description if the device is a ZigBee device.
     */
    isZigBee: {
      get() {
        return this.attr('devadv:protocol') === 'ZIGB';
      },
    },
  },
  /**
  * @function hasConfigurator
  * @parent i2web/models/device
  * @param {String} cap Configurator name
  * @return {Boolean} Whether the device has the passed configurator
  */
  hasConfigurator(configurator) {
    return this.attr('configurators').indexOf(configurator) !== -1;
  },
  /**
  * @function toggleOnOff
  * @parent i2web/models/device
  * @return {Promise} Will be resolved once the device's state has been switched and saved, or rejected on error
  */
  toggleOnOff(context, el, ev) {
    if (ev) ev.stopImmediatePropagation();
    return new Promise((resolve, reject) => {
      if (this.attr('base:caps')) {
        if (this.attr('base:caps').indexOf('swit') !== -1) {
          const stateToBe = this.attr('isOn') ? SwitchCapability.STATE_OFF : SwitchCapability.STATE_ON;
          this.attr('swit:state', stateToBe).save()
          .then(() => {
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
        } else {
          reject('calling toggleOnOff when device has no capability that implements toggleOnOff - perhaps device instantiated incorrectly?');
        }
      } else {
        reject('no base:caps found on device - perhaps device instantiated incorrectly?');
      }
    });
  },
});

export const DeviceConnection = ModelConnection('dev', 'base:address', Device);
Device.connection = DeviceConnection;
makeCloneable(Device);

export default Device;
