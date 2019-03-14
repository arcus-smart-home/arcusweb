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

import './changeBlindState.component';
import './changeFanSpeed.component';
import './changeTemperature.component';
import './changeSpaceHeaterTemperature.component';
import './changeWaterHeaterTemperature.component';
import './changeShadeLevel.component';
import './changeVentLevel.component';
import './halo/hover-action-status.component';
import './halo/toggleLightPlayStop.component';
import './irrigation/nowStopSkip.component';
import './lockUnlockAutoPetdoor.component';
import './lockUnlock.component';
import './openCloseDoor.component';
import './openCloseValve.component';
import './rechargeNow.component';
import './streamRecord.component';
import './toggleOnOff.component';
import './thermostat-slider/';

/**
 * @module {canMap} i2web/components/device/actions Actions
 * @parent i2web/components/device
 * @description The actions displayed for each device
 */

 /**
 * @module {canComponent} i2web/components/device/actions/changeFanSpeed Change Fan Speed
 * @parent i2web/components/device/actions
 * @description Changes the speed of the fan device
 * @signature `<arcus-device-action-changeFanSpeed>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/changeFanSpeed
 *
 * @description The device to affect
 */

 /**
 * @module {canComponent} i2web/components/device/actions/changeSpaceHeaterTemperature Change Space Heater Temperature
 * @parent i2web/components/device/actions
 * @description Changes the temperature of the space heater device
 * @signature `<arcus-device-action-changeSpaceHeaterTemperature>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/changeSpaceHeaterTemperature
 *
 * @description The device to affect
 */

 /**
 * @property {Number} minSetPoint
 * @parent i2web/components/device/actions/changeSpaceHeaterTemperature
 *
 * @description Minimum we can set the temperature to
 */

 /**
 * @property {Number} maxSetPoint
 * @parent i2web/components/device/actions/changeSpaceHeaterTemperature
 *
 * @description Maximum we can set the temperature to
 */

 /**
 * @property {Number} setPoint
 * @parent i2web/components/device/actions/changeSpaceHeaterTemperature
 *
 * @description Current setpoint of the space heater
 */

 /**
 * @property {Boolean} canChangeTemperature
 * @parent i2web/components/device/actions/changeSpaceHeaterTemperature
 *
 * @description Whether or not we can change the temperature. True if device is online and not in eco mode
 */

 /**
 * @module {canComponent} i2web/components/device/actions/changeWaterHeaterTemperature Change Water Heater Temperature
 * @parent i2web/components/device/actions
 * @description Changes the water heater temperature
 * @signature `<arcus-device-action-changeWaterHeaterTemperature>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/changeWaterHeaterTemperature
 *
 * @description The device to affect
 */

 /**
 * @module {canComponent} i2web/components/device/actions/changeShadeLevel Change Shade Level
 * @parent i2web/components/device/actions
 * @description Changes the shade open level
 * @signature `<arcus-device-action-changeShadeLevel>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/changeShadeLevel
 *
 * @description The device to affect
 */

 /**
 * @module {canComponent} i2web/components/device/actions/changeVentLevel Change Vent Level
 * @parent i2web/components/device/actions
 * @description Changes the vent open level
 * @signature `<arcus-device-action-changeVentLevel>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/changeVentLevel
 *
 * @description The device to affect
 */

/**
 * @module {canComponent} i2web/components/device/actions/halo/hover-action-status Hover Action Status
 * @parent i2web/component/device/actions/halo
 * @description The card action with specific functional for the Halo device
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/halo/hover-action-status
 *
 * @description The device to affect
 */

 /**
 * @module {canComponent} i2web/components/device/actions/halo/toggleLightPlayStop Toggle Light Play/Stop
 * @parent i2web/component/device/actions/halo
 * @description The panel action with specific functional for the Halo device
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/halo/toggleLightPlayStop
 *
 * @description The device to affect
 */

 /**
 * @module {canComponent} i2web/components/device/actions/toggleOnOff Toggle On/Off
 * @parent i2web/components/device/actions
 * @description The toggle component
 * @signature `<arcus-device-action-toggle-on-off>`
 *
 */

 /**
 * @module {canComponent} i2web/components/device/actions/irrigation/nowStopSkip Irrigation - Now, Stop, Skip
 * @parent i2web/components/device/actions/irrigation
 * @description The panel action to start, stop, skip watering of a zone
 * @signature `<arcus-device-action-irrigation-nowstopskip>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/actions/irrigation/nowStopSkip
 *
 * @description The Irrigation controller
 */

/**
 * @module {canComponent} i2web/components/device/actions/lockUnlock Lock/Unlock Door
 * @parent i2web/components/device/actions
 * @description The panel action to lock or unlock door locks
 * @signature `<arcus-device-action-lock-unlock-door>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/openCloseDoor
 *
 * @description The device to toggle the door
 */


 /**
 * @module {canComponent} i2web/components/device/actions/openCloseDoor Open/Close Door
 * @parent i2web/components/device/actions
 * @description The panel action to open or close motorized doors
 * @signature `<arcus-device-action-open-close-door>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/openCloseDoor
 *
 * @description The device to toggle the door
 */


/**
 * @module {canComponent} i2web/components/device/actions/openCloseValve Open/Close Valve
 * @parent i2web/components/device/actions
 * @description The panel action to open or close valves
 * @signature `<arcus-device-action-open-close-valve>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/openCloseValve
 *
 * @description The device to toggle the valve
 */

/**
 * @module {canComponent} i2web/components/device/actions/rechargeNow Recharge Water Softener
 * @parent i2web/components/device/actions
 * @description Panel that start the water softener recharging
 * @signature `<arcus-device-action-recharge-now {device}="device" />`
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/actions/rechargeNow
 * @description The device (water softener) for which to recharge
 */

/**
 * @module {canComponent} i2web/components/device/actions/streamRecord Stream/Record Camera
 * @parent i2web/components/device/actions
 * @description Panel that starts a camera streaming or recording
 * @signature `<arcus-device-action-stream-record {device}="device">`
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/streamRecord
 *
 * @description The device (camera) from which to stream or record
 */

 /**
 * @module {canComponent} i2web/components/device/actions/halo/hover-action-status Halo Status (Hover)
 * @parent i2web/components/device/actions
 * @description Halo Status (Hover)
 * @signature `<arcus-device-action-halo-hover-action-status>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/halo/hover-action-status
 *
 * @description The Halo device
 */


 /**
 * @module {canComponent} i2web/components/device/actions/halo/toggle-light Halo Light Toggle
 * @parent i2web/components/device/actions
 * @description The panel action to toggle a Halo light
 * @signature `<arcus-device-action-halo-light-toggle>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/actions/halo/toggle-light
 *
 * @description The Halo device
 */
