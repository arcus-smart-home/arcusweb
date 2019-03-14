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

import Bridge from 'i2web/cornea/bridge';

import Cornea from 'i2web/cornea/';

/**
 * @module {Object} i2web/models/IpcdService IpcdService
 * @parent app.models.services
 *
 * IPCD Service
 */
export default {
  /**
   * @function onDeviceClaimed
   *
   * Issued from the IPCD Service to the IPCD Briges(s)/SAD Server when a device has been claimed
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onDeviceClaimed(callback) {
    Cornea.on('ipcd ipcd:DeviceClaimed', callback);
  },
  /**
   * @function onDeviceRegistered
   *
   * Issued from the IPCD Service to the IPCD Bridge(s)/SAD Server when a device has been fully registered (i.e. has a driver)
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onDeviceRegistered(callback) {
    Cornea.on('ipcd ipcd:DeviceRegistered', callback);
  },
  /**
   * @function onDeviceUnregistered
   *
   * Issued from the IPCD Service to the IPCD Bridge(s)/SAD Server when a device has been unregistered
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onDeviceUnregistered(callback) {
    Cornea.on('ipcd ipcd:DeviceUnregistered', callback);
  },
  /**
   * @function onDeviceConnected
   *
   * Issued from the IPCD Bridge(s)/SAD Server when a device comes online.  The source should be the specific IPCD bridge/SAD Server
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onDeviceConnected(callback) {
    Cornea.on('ipcd ipcd:DeviceConnected', callback);
  },
  /**
   * @function onDeviceDisconnected
   *
   * Issued from the IPCD Bridge(s)/SAD Server when a device goes offline.  The source should be the specific IPCD bridge/SAD Server
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onDeviceDisconnected(callback) {
    Cornea.on('ipcd ipcd:DeviceDisconnected', callback);
  },
  /**
   * @function onDeviceHeartBeat
   *
   * Issued from the IPCD Bridge(s)/SAD Server with the protocol addresses of all online devices
   *
   * @param {Function} callback Function to be executed upon recieving the event
   */
  onDeviceHeartBeat(callback) {
    Cornea.on('ipcd ipcd:DeviceHeartBeat', callback);
  },
  /**
   * @function ListDeviceTypes
   *
   * Lists the available vendor/model combinations for supported IPCD devices
   *
   * @return {Promise}
   */
  ListDeviceTypes() {
    return Bridge.request('ipcd:ListDeviceTypes', 'SERV:ipcd:', {});
  },
  /**
   * @function FindDevice
   *
   * Finds the IPCD device for the given vendor/model/sn combination that uniquely identies an IPCD device
   *
   * @param {IpcdDeviceType} deviceType The type of device to search for
   * @param {string} sn The serial number of the device the user would register with
   * @return {Promise}
   */
  FindDevice(deviceType, sn) {
    return Bridge.request('ipcd:FindDevice', 'SERV:ipcd:', {
      deviceType,
      sn,
    });
  },
  /**
   * @function ForceUnregister
   *
   * Forces unregistration of an IPCD device
   *
   * @param {string} protocolAddress The protocol address of the device to forcibly remove
   * @return {Promise}
   */
  ForceUnregister(protocolAddress) {
    return Bridge.request('ipcd:ForceUnregister', 'SERV:ipcd:', {
      protocolAddress,
    });
  },
};
