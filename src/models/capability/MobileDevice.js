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
 * @module {Object} i2web/models/MobileDevice MobileDevice
 * @parent app.models.capabilities
 *
 * Model of a mobile device
 */
export default {
  writeableAttributes: [
    /**
     * @property {string} mobiledevice\:osVersion
     *
     * The version of the operating system running on the mobile device.
     *
     */
    'mobiledevice:osVersion',
    /**
     * @property {string} mobiledevice\:formFactor
     *
     * The form factor of the device (phone, tablet for example).
     *
     */
    'mobiledevice:formFactor',
    /**
     * @property {string} mobiledevice\:phoneNumber
     *
     * The phone number of the device if present.
     *
     */
    'mobiledevice:phoneNumber',
    /**
     * @property {string} mobiledevice\:deviceIdentifier
     *
     * The mobile device provided unique identifier
     *
     */
    'mobiledevice:deviceIdentifier',
    /**
     * @property {string} mobiledevice\:deviceModel
     *
     * The model of the device if known.
     *
     */
    'mobiledevice:deviceModel',
    /**
     * @property {string} mobiledevice\:deviceVendor
     *
     * The vendor of the device if known.
     *
     */
    'mobiledevice:deviceVendor',
    /**
     * @property {string} mobiledevice\:resolution
     *
     * The screen resolution of the device (ex. xhdpi)
     *
     */
    'mobiledevice:resolution',
    /**
     * @property {string} mobiledevice\:notificationToken
     *
     * The token for sending push notifications to this device if it is registered to do so.
     *
     */
    'mobiledevice:notificationToken',
    /**
     * @property {double} mobiledevice\:lastLatitude
     *
     * The last measured latitude if collected.
     *
     */
    'mobiledevice:lastLatitude',
    /**
     * @property {double} mobiledevice\:lastLongitude
     *
     * The last measured longitude if collected.
     *
     */
    'mobiledevice:lastLongitude',
    /**
     * @property {string} mobiledevice\:name
     *
     * A friendly name for the device.
     *
     */
    'mobiledevice:name',
    /**
     * @property {string} mobiledevice\:appVersion
     *
     * The version of the Arcus app installed on this device.
     *
     */
    'mobiledevice:appVersion',
  ],
  methods: {},
  events: {},

};
