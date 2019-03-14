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

import './assign-button.component';
import './assign-buttons.component';
import './assign-device.component';
import './assign-halo-room.component';
import './brightness.component';
import './color-or-colortemp.component';
import './color.component';
import './colortemp.component';
import './fan-speed.component';
import './garage-door-controller.component';
import './camera-framerate.component';
import './camera-ir-led-mode.component';
import './camera-local-streaming.component';
import './camera-resolution.component';
import './camera-rotation.component';
import './contact-setting.component';
import './motion-sensitivity/';
import './noaa-location/';
import './noaa-radio/';
import './noaa-weather-alerts/';
import './orientation.component';
import './petdoor-add-smartkey.component';
import './petdoor-smartkeys.component';
import './test-coverage.component';
import './test-halo.component';
import './thermostat-mode.component';
import './somfy-reversed.component';
import './somfy-customization.component';
import './somfy-type.component';
import './space-heater-mode.component';
import './water-flow.component';
import './water-hardness.component';
import './water-heater-mode.component';
import './water-salt-type.component';
import './water-saver.component';
import './water-softener-recharge-time.component';
import './wifi-read-only.component';
import './wifiScan/';
import './irrigation-mode/';

/**
 * @module {canMap} i2web/components/device/configurators Configurators
 * @parent i2web/components/device
 * @description The configurators for each device
 *
 */

// ---------------- Assign Buttons DOCUMENTATION -------------------//

/**
 * @module {canComponent} i2web/components/device/configurators/assign-buttons Assign Buttons
 * @parent i2web/components/device/configurators
 * @description The assign rules to buttons component
 * @signature `<arcus-device-configurator-assign-buttons>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/assign-buttons
 * The device associated with the rule assigner
 */

 /**
 * @property {List} buttons
 * @parent i2web/components/device/configurators/assign-buttons
 * The buttons that are associated to the type of device. For current keyfobs that
 * is either "away" and "home" or "circle," "square," "diamond," and "hexagon"
 */

// ---------------- Assign Button DOCUMENTATION -------------------//

/**
 * @module {canComponent} i2web/components/device/configurators/assign-button Assign Button
 * @parent i2web/components/device/configurators
 * @description The assign rule to a specific button component
 * @signature `<arcus-device-configurator-assign-buttons>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/assign-button
 * The device associated with the rule assigner
 */

 /**
 * @property {String} button
 * @parent i2web/components/device/configurators/assign-button
 * The name of the button on the device we want to associate a rule to
 */

 /**
 * @property {Rule} rule
 * @parent i2web/components/device/configurators/assign-button
 * The rule currently associated to this device and this button
 */

 /**
 * @property {RuleTemplates} templates
 * @parent i2web/components/device/configurators/assign-button
 * All of the templates that could be assigned to this particular device.
 */

 /**
 * @property {String} selected
 * @parent i2web/components/device/configurators/assign-button
 * The selected rule base address
 */

 /**
  * @function setRuleTemplate
  * @parent i2web/components/device/configurators/assign-button
  * @param {Rule} rule The rule that needs a template
  * Finds the template that the Rule matches and sets it to a ruleTemplate
  * property on the Rule.
  */

 /**
  * @function isSelected
  * @parent i2web/components/device/configurators/assign-button
  * @param {RuleTemplate} ruleTemplate The template to match
  * Determines whether or not the given rule template is associated with this
  * device and button
  */

 /**
  * @function saveRule
  * @parent i2web/components/device/configurators/assign-button
  * @param {RuleTemplate} ruleTemplate The template to save
  * Deletes the rule associated to the button and device. If a rule
  * template is provided, it will then create a new rule in it's place.
  */

// ---------------- Assign Device DOCUMENTATION -------------------//

/**
 * @module {canComponent} i2web/components/device/configurators/assign-device Assign Device
 * @parent i2web/components/device/configurators
 * @description The assign device component
 * @signature `<arcus-device-configurator-assign-device>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/assign-device
 * The device associated with the person assigner
 */

 /**
 * @property {List} things
 * @parent i2web/components/device/configurators/assign-device
 * The things which we can assign to the device
 */

 /**
 * @function isSelected
 * @parent i2web/components/device/configurators/assign-device
 *
 * @param thing
 * Whether or not the passed in thing is the one selected to be assigned
 * to our device
 */

 /**
 * @function selectThing
 * @parent i2web/components/device/configurators/assign-device
 *
 * @param thing
 * Assigns the thing to the device if a person, otherwise unassigns it, and saves.
 */


// ---------------- Assign Halo Room DOCUMENTATION -------------------//

/**
 * @module {canComponent} i2web/components/device/configurators/assign-halo-room Assign Halo Room
 * @parent i2web/components/device/configurators
 * @description The assigns a room to the halo device
 * @signature `<arcus-device-configurator-assign-halo-room>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/assign-halo-room
 * The device associated with the room assigner
 */

 /**
 * @function saveRoom
 * @parent i2web/components/device/configurators/assign-halo-room
 * @param room The room you should assign the halo to.
 * Assigns the room to the halo device and saves it.
 */

// ---------------- BRIGHTNESS DOCUMENTATION -------------------//

/**
 * @module {canComponent} i2web/components/device/configurators/brightness Brightness
 * @parent i2web/components/device/configurators
 * @description The brightness component
 * @signature `<arcus-device-configurator-brightness>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/brightness
 * The device associated with the brightness badge
 */

 /**
 * @property {} saveTimeoutId
 * @parent i2web/components/device/configurators/brightness
 * The set timeout id
 */

 /**
 * @property {String} brightness
 * @parent i2web/components/device/configurators/brightness
 * The brightness
 */

// ---------------- BRIGHTNESS DOCUMENTATION -------------------//

/**
 * @module {canComponent} i2web/components/device/configurators/brightness Brightness
 * @parent i2web/components/device/configurators
 * @description The brightness component
 * @signature `<arcus-device-configurator-brightness>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/brightness
 * The device associated with the brightness badge
 */

 /**
 * @property {} saveTimeoutId
 * @parent i2web/components/device/configurators/brightness
 * The set timeout id
 */

 /**
 * @property {String} brightness
 * @parent i2web/components/device/configurators/brightness
 * The brightness
 */

 // ---------------- COLOR-OR-COLORTEMP DOCUMENTATION ----------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/color-or-colortemp Color Or Color Temp
 * @parent i2web/components/device/configurators
 * @description The brightness component
 * @signature `<arcus-device-configurator-brightness>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/color-or-colortemp
 * The device associated with the color-or-colortemp configurator
 */

 /**
 * @function isRightMode
 * @parent i2web/components/device/configurators/color-or-colortemp
 * Whether or not the mode matches the device.
 */

 /**
 * @function modeChanged
 * @parent i2web/components/device/configurators/color-or-colortemp
 * Updates the mode to whatever mode is specifically available for the device
 */


 // ---------------- COLOR DOCUMENTATION ---------------------//

 /**
 * @module {canComponent} i2web/components/device/configurators/color Color
 * @parent i2web/components/device/configurators
 * @description The brightness component
 * @signature `<arcus-device-configurator-brightness>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/color
 * The device associated with the color configurator
 */

 /**
 * @property {String} fromColor
 * @parent i2web/components/device/configurators/color
 * The previous color during sliding
 */

 /**
 * @property {String} toColor
 * @parent i2web/components/device/configurators/color
 * The new color the user has slid to
 */

/**
 * @property {Boolean} isColorMode
 * @parent i2web/components/device/configurators/color
 * Is the color mode `COLOR`?
 */

 /**
 * @property {} saveTimeoutId
 * @parent i2web/components/device/configurators/color
 * The set timeout ID
 */

 /**
 * @property {String} hue
 * @parent i2web/components/device/configurators/color
 * Hue
 */

 /**
 * @property {String} saturation
 * @parent i2web/components/device/configurators/color
 * Saturation
 */

  /**
 * @function colorChanged
 * @parent i2web/components/device/configurators/color
 *
 * @param event
 * When color is changed, if it is the hue slider change the device hue, if the saturation
 * slider is changed, change the device saturation. Wait 50ms to save.
 */

 // ---------------- COLORTEMP DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/colortemp Color Temp
 * @parent i2web/components/device/configurators
 * @description The brightness component
 * @signature `<arcus-device-configurator-brightness>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/colortemp
 * The device associated with this colortemp component
 */

 /**
 * @property {Boolean} isColorTempMode
 * @parent i2web/components/device/configurators/colortemp
 * Is color mode `COLORTEMP`?
 */

 /**
 * @property {String} saveTimeoutId
 * @parent i2web/components/device/configurators/colortemp
 * The set timeout Id
 */

 /**
 * @function tempuratureChanged
 * @parent i2web/components/device/configurators/colortemp
 * @param event
 * Wait 50ms after slider change to save new colortemp
 */

 // ---------------- CONTACT SETTING DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/contact-setting Contact Sensor Setting
 * @parent i2web/components/device/configurators
 * @description The sensor setting component
 * @signature `<arcus-device-configurator-contact-setting>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/contact-setting
 * The device associated with this contact setting component
 */

// --------------- CAMERA FRAME RATE DOCUMENTATION -----------------//
/**
 * @module {canComponent} i2web/components/device/configurators/camera-framerate Camera Frame Rate
 * @parent i2web/components/device/configurators
 * @description The camera frame rate component
 * @signature `<arcus-device-configurator-camera-framerate>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/camera-framerate
 * The device associated with this camera framerate component
 */

// --------------- CAMERA IR LED MODE DOCUMENTATION -----------------//
/**
 * @module {canComponent} i2web/components/device/configurators/camera-ir-led-mode Camera IR LED Mode
 * @parent i2web/components/device/configurators
 * @description The camera infrared LED mode component
 * @signature `<arcus-device-configurator-camera-ir-led-mode>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/camera-ir-led-mode
 * The device associated with this camera infrared LED mode component
 */

// ------------ CAMERA LOCAL STREAMING DOCUMENTATION -----------------//
/**
 * @module {canComponent} i2web/components/device/configurators/camera-local-streaming Camera Local Streaming
 * @parent i2web/components/device/configurators
 * @description The camera local streaming component
 * @signature `<arcus-device-configurator-camera-local-streaming>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/camera-local-streaming
 * The device associated with this camera local streaming component
 */

// --------------- CAMERA RESOLUTION DOCUMENTATION -----------------//
/**
 * @module {canComponent} i2web/components/device/configurators/camera-resolution Camera Resolution
 * @parent i2web/components/device/configurators
 * @description The camera resolution component
 * @signature `<arcus-device-configurator-camera-resolution>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/camera-resolution
 * @description The device associated with this camera resolution component
 */

 /**
  * @property {CanList} supportedResolutions
  * @parent i2web/components/device/configurators/camera-resolution
  * @description List of supported resolutions, this list will be sorted in
  * decreasing order for swann cameras.
  */

// --------------- CAMERA ROTATION DOCUMENTATION -----------------//
/**
 * @module {canComponent} i2web/components/device/configurators/camera-rotation Camera Rotation
 * @parent i2web/components/device/configurators
 * @description The camera rotation component
 * @signature `<arcus-device-configurator-camera-rotation>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/camera-rotation
 * The device associated with this camera rotation component
 */

// ---------------- NOAA LOCATION DOCUMENTATION ----------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/noaa-location noaa-location
 * @parent i2web/components/device/configurators
 * @description The noaa-location component
 * @signature `<arcus-device-configurator-noaa-location>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/noaa-location
 * The device associated with this noaa-location component
 */

// ---------------- NOAA RADIO DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/noaa-radio Noaa-radio
 * @parent i2web/components/device/configurators
 * @description The noaa-radio component
 * @signature `<arcus-device-configurator-noaa-radio>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/noaa-radio
 * The device associated with this noaa-radio component
 */

 // ---------------- NOAA WEATHER ALERTS DOCUMENTATION -------------------//
  /**
  * @module {canComponent} i2web/components/device/configurators/noaa-weather-alerts noaa-weather-alerts
  * @parent i2web/components/device/configurators
  * @description The noaa-weather-alerts component
  * @signature `<arcus-device-configurator-noaa-weather-alerts>`
  *
  */

  /**
  * @property {Device} device
  * @parent i2web/components/device/configurators/noaa-weather-alerts
  * The device associated with this noaa-weather-alerts component
  */

// ---------------- ORIENTATION DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/orientation Orientation
 * @parent i2web/components/device/configurators
 * @description The orientation component
 * @signature `<arcus-device-configurator-orientation>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/orientation
 * The device associated with this orientation component
 */

 /**
 * @function isRightOrientation
 * @parent i2web/components/device/configurators/orientation
 * Whether or not the orientation matches the device.
 */

 /**
 * @function orientationChanged
 * @parent i2web/components/device/configurators/orientation
 * Based on whether or not the orientation is horizontal or vertical, adds or
 * removes the closedOnUpright tag from base:tags
 */

// ---------------- PETDOOR ADD SMARTKEY DOCUMENTATION ----------------//
/**
 * @module {canComponent} i2web/components/device/configurators/petdoor-add-smartkey Add Pet Door Smart Key
 * @parent i2web/components/device/configurators
 * @description The petdoor add smart key component
 * @signature `<arcus-device-configurator-petdoor-add-smartkey>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/petdoor-add-smartkey
 * The device associated with this petdoor add smart key component
 */

// ---------------- PETDOOR SMARTKEYS DOCUMENTATION -------------------//
/**
 * @module {canComponent} i2web/components/device/configurators/petdoor-smartkeys Pet Door Smart Keys
 * @parent i2web/components/device/configurators
 * @description The petdoor smart keys component
 * @signature `<arcus-device-configurator-petdoor-smartkeys>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/petdoor-smartkeys
 * The device associated with this petdoor smart keys component
 */

// ---------------- TEST COVERAGE DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/test-coverage Test Coverage
 * @parent i2web/components/device/configurators
 * @description The test coverage component
 * @signature `<arcus-device-configurator-test-coverage>`
 */

// ---------------- Assign Halo Room DOCUMENTATION -------------------//

/**
 * @module {canComponent} i2web/components/device/configurators/test-halo Test Halo
 * @parent i2web/components/device/configurators
 * @description The test halo device component
 * @signature `<arcus-device-configurator-test-halo>`
 *
 */

// -------------------- Somfy Reversed DOCUMENTATION -------------------//

/**
* @module {canComponent} i2web/components/device/configurators/somfy-reversed Somfy Reversed
* @parent i2web/components/device/configurators
* @description Configurator to reverse a Somfy blind device
* @signature `<arcus-device-configurator-somfy-reversed>`
*/

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/space-heater-mode
 * The somfy blind device
 */

 // -------------------- Somfy Customization DOCUMENTATION -----------------------//

/**
* @module {canComponent} i2web/components/device/configurators/somfy-customization Somfy Customization
* @parent i2web/components/device/configurators
* @description Configurator to show the User how to configure Somfy blind device
* @signature `<arcus-device-configurator-somfy-customization>`
*/

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/space-heater-mode
 * The somfy blind device
 */

// -------------------- Somfy Type DOCUMENTATION -----------------------//

/**
* @module {canComponent} i2web/components/device/configurators/somfy-type Somfy Type
* @parent i2web/components/device/configurators
* @description Configurator to change the type for Somfy blind device
* @signature `<arcus-device-configurator-somfy-type>`
*/

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/space-heater-mode
 * The somfy blind device
 */

 // ---------------- SPACE HEATER MODE DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/space-heater-mode Space Heater Mode
 * @parent i2web/components/device/configurators
 * @description The space heater mode component
 * @signature `<arcus-device-configurator-space-heater-mode>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/space-heater-mode
 * The device associated with this space-heater-mode component
 */

 /**
 * @property {canList} modes
 * @parent i2web/components/device/configurators/space-heater-mode
 * The modes you can set the space heater if eco mode is available
 */

 /**
 * @property {canList} states
 * @parent i2web/components/device/configurators/space-heater-mode
 * The states you can set the space heater to, on or off.
 */

 /**
 * @function isRightState
 * @parent i2web/components/device/configurators/space-heater-mode
 * Whether or not the state matches the device.
 */

 /**
 * @function stateChanged
 * @parent i2web/components/device/configurators/space-heater-mode
 * Updates the state to either on or off.
 */

 /**
 * @function isRightMode
 * @parent i2web/components/device/configurators/space-heater-mode
 * Whether or not the mode matches the device.
 */

 /**
 * @function modeChanged
 * @parent i2web/components/device/configurators/space-heater-mode
 * Updates the mode to either standard or energy saver.
 */


 // ---------------- FAN SPEED DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/fan-speed Fan Speed
 * @parent i2web/components/device/configurators
 * @description The fan speed component
 * @signature `<arcus-device-configurator-fan-speed>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/fan-speed
 * The device associated with this fan-speed component
 */


 // ---------------- GARAGE DOOR CONTROLLER DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/garage-door-controller Garage Door Controller
 * @parent i2web/components/device/configurators
 * @description Manage garage door controls
 * @signature `<arcus-device-configurator-garage-door-controller>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/garage-door-controller
 * The device associated with this garage-door-controller component
 */

 // ---------------- WATER FLOW DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/water-flow Water Flow
 * @parent i2web/components/device/configurators
 * @description The water flow component
 * @signature `<arcus-device-configurator-water-flow>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/water-flow
 * The device associated with this water-flow component
 */

// ---------------- WATER HARDNESS DOCUMENTATION -------------------//
/**
 * @module {canComponent} i2web/components/device/configurators/water-hardness Water Hardness
 * @parent i2web/components/device/configurators
 * @description The water hardness component
 * @signature `<arcus-device-configurator-water-hardness>`
 *
 */

/**
 * @property {Device} device
 * @parent i2web/components/device/configurators/water-hardness
 * The device associated with this water-hardness component
 */

 // ---------------- WATER HEATER MODE DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/water-heater-mode Water Heater Mode
 * @parent i2web/components/device/configurators
 * @description The water header mode component
 * @signature `<arcus-device-configurator-water-heater-mode>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/water-heater-mode
 * The device associated with this water-heater-mode component
 */

 /**
 * @function isRightMode
 * @parent i2web/components/device/configurators/water-heater-mode
 * Whether or not the mode matches the device.
 */

 /**
 * @function modeChanged
 * @parent i2web/components/device/configurators/water-heater-mode
 * Updates the mode to either standard or energy saver.
 */


// ---------------- WATER SALT TYPE DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/water-salt-type Water Salt Type
 * @parent i2web/components/device/configurators
 * @description The water salt type component
 * @signature `<arcus-device-configurator-water-salt-type>`
 *
 */

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/water-salt-type
 * The device associated with this water-salt-type component
 */

// ---------------- WATER SAVER DOCUMENTATION -------------------//
/**
 * @module {canComponent} i2web/components/device/configurators/water-saver Water Saver
 * @parent i2web/components/device/configurators
 * @description The irrigation water saver configurator component
 * @signature `<arcus-device-configurator-water-saver>`

 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/water-saver
 * The device associated with this water-saver component
 */

/**
 * @property {String} irrigationControllerBudget
 * @parent i2web/components/device/configurators/water-saver
 * The budget for water saver
 */

// ---------------- WATER SOFTENER RECHARGE TIME DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/water-softener-recharge-time Water Softener Recharge Time
 * @parent i2web/components/device/configurators
 * @description The water softener recharge time component
 * @signature `<arcus-device-configurator-water-softener-recharge-time>`
 /**
 * @property {Device} device
 * @parent i2web/components/device/configurators/water-softener-recharge-time
 * The device associated with this water-softener-recharge-time component
 */

 /**
 * @property {String} rechargeStartTime
 * @parent i2web/components/device/configurators/water-softener-recharge-time
 * The current start time for water softener recharge
 */

// ---------------- WIFI READ-ONLY DOCUMENTATION -------------------//
 /**
 * @module {canComponent} i2web/components/device/configurators/wifi-read-only WiFi (read-Only)
 * @parent i2web/components/device/configurators
 * @description Wifi (read-only)
 * @signature `<arcus-device-configurator-wifi-read-only>`
 */
