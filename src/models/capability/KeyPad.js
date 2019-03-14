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
 * @module {Object} i2web/models/KeyPad KeyPad
 * @parent app.models.capabilities
 *
 * Keypads handle a user entering a PIN and arming disarming an alarm system or entering a panic mode.  The keypad should also display the current state of the Security Alarm Subsystem in some manner, either through LEDs or sound alerts.
 */
export default {
  writeableAttributes: [
    /**
     * @property {enum} keypad\:alarmState
     *
     * Current alarm state of the keypad.
Generally this should only be controlled via the specific methods (BeginArming, Armed, Disarmed, Soaking, Alerting).
However it may be set manually in case the keypad is no longer in sync with the security system.  In this case the
keypad should avoid making transition noises (such as the armed or disarmed beeps).  However if the state is
ARMING, SOAKING, or ALERTING and the associated sounds are enabled it should beep accordingly.
     *
     */
    'keypad:alarmState',
    /**
     * @property {enum} keypad\:alarmMode
     *
     * The current mode of the alarm.
Generally this should only be controlled via the specific methods (BeginArming, Armed, Disarmed, Soaking, Alerting).
However it may be set manually in case the keypad is no longer in sync with the security system.
     *
     */
    'keypad:alarmMode',
    /**
     * @property {enum} keypad\:alarmSounder
     *
     * DEPRECATED
When set to ON enabledSounds should be set to [BUTTONS,DISARMED,ARMED,ARMING,SOAKING,ALERTING].
When set to OFF enabledSounds should be set to [].
If enabledSounds is set to a value other than [] this should be changed to ON.
If both alarmSounder and enabledSounds are set in the same request an error should be thrown.
     *
     */
    'keypad:alarmSounder',
    /**
     * @property {set<enum>} keypad\:enabledSounds
     *
     * This contains the set of times when the keypad should play tones, the common combinations are:
Keypad Sounds On  / Normal Alarm  - [BUTTONS,DISARMED,ARMED,ARMING,SOAKING,ALERTING]
Keypad Sounds Off / Normal Alarm  - [ALERTING]
Keypad Sounds On  / Silent Alarm  - [BUTTONS,DISARMED,ARMED,ARMING]
Keypad Sounds Off / Silent Alarm  - []
Each sound should be enabled if it is present in the set or disabled if it is not present:
BUTTONS - Button presses should beep
DISARMED - Play a tone when the keypad disarms
ARMING - Play an exit delay tone
ARMED - Play a tone when the keypad is armed
SOAKING - Play an entrance delay tone
ALERTING - Play an alert tone
     *
     */
    'keypad:enabledSounds',
  ],
  methods: {
    /**
     * @function BeginArming
     *
     * Tell the Keypad that the arming process has started (exit delay), if sounds are enabled this should beep for the specified period.
The delay should be used to allow the beep to speed up as the end of the time window is reached.
The driver should update alarmState to ARMING and alarmMode to match the requested alarmMode.
     *
     * @param {int} delayInS The exit delay in seconds
     * @param {enum} alarmMode The mode the alarm should be armed into.
     * @return {Promise}
     */
    BeginArming(delayInS, alarmMode) {
      return Bridge.request('keypad:BeginArming', this.GetDestination(), {
        delayInS,
        alarmMode,
      });
    },
    /**
     * @function Armed
     *
     * Tell the Keypad that it has been armed, if sounds are enabled it should beep the tone matching the given mode.
This should update alarmState to ARMED and alarmMode to match the requested alarmMode.
     *
     * @param {enum} alarmMode The mode the alarm is armed into.
     * @return {Promise}
     */
    Armed(alarmMode) {
      return Bridge.request('keypad:Armed', this.GetDestination(), {
        alarmMode,
      });
    },
    /**
     * @function Disarmed
     *
     * Tell the Keypad that it has been armed, if sounds are enabled it should beep the tone matching the given mode.
This should update alarmState to ARMED and alarmMode to match the requested alarmMode.
     *
     * @return {Promise}
     */
    Disarmed() {
      return Bridge.request('keypad:Disarmed', this.GetDestination(), {});
    },
    /**
     * @function Soaking
     *
     * Tell the Keypad that the alarm is preparing to go off (entrance delay), if sounds are enabled it should beep the tone matching the given mode.
The duration should be used to allow the beep to speed up as the end of the time window is reached.
This should update alarmState to SOAKING and alarmMode to match the requested alarmMode.
     *
     * @param {int} durationInS The mode the alarm is armed into.
     * @param {enum} alarmMode The mode the alarm is armed into.
     * @return {Promise}
     */
    Soaking(durationInS, alarmMode) {
      return Bridge.request('keypad:Soaking', this.GetDestination(), {
        durationInS,
        alarmMode,
      });
    },
    /**
     * @function Alerting
     *
     * Tell the Keypad that the alarm is currently alerting.
This should update alarmState to ALERTING and alarmMode to match the requested alarmMode.
     *
     * @param {enum} alarmMode The mode the alarm is armed into.
     * @return {Promise}
     */
    Alerting(alarmMode) {
      return Bridge.request('keypad:Alerting', this.GetDestination(), {
        alarmMode,
      });
    },
    /**
     * @function Chime
     *
     * Tell the Keypad to make a chime noise.
     *
     * @return {Promise}
     */
    Chime() {
      return Bridge.request('keypad:Chime', this.GetDestination(), {});
    },
    /**
     * @function ArmingUnavailable
     *
     * Tell the Keypad that the arming process cannot be started due to triggered devices
     *
     * @return {Promise}
     */
    ArmingUnavailable() {
      return Bridge.request('keypad:ArmingUnavailable', this.GetDestination(), {});
    },
  },
  events: {
    /**
     * @function onArmPressed
     *
     * The arm button has been pressed on the keypad.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onArmPressed(callback) {
      Cornea.on('keypad keypad:ArmPressed', callback);
    },
    /**
     * @function onDisarmPressed
     *
     * The disarm button has been pressed on the keypad.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onDisarmPressed(callback) {
      Cornea.on('keypad keypad:DisarmPressed', callback);
    },
    /**
     * @function onPanicPressed
     *
     * The panic button has been pressed on the keypad.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onPanicPressed(callback) {
      Cornea.on('keypad keypad:PanicPressed', callback);
    },
    /**
     * @function onInvalidPinEntered
     *
     * User has typed in an invalid pin on the keypad, as verified by the Pin Management API.
     *
     * @param {Function} callback Function to be executed upon recieving the event
     */
    onInvalidPinEntered(callback) {
      Cornea.on('keypad keypad:InvalidPinEntered', callback);
    },
  },
  ALARMSTATE_DISARMED: 'DISARMED',
  ALARMSTATE_ARMED: 'ARMED',
  ALARMSTATE_ARMING: 'ARMING',
  ALARMSTATE_ALERTING: 'ALERTING',
  ALARMSTATE_SOAKING: 'SOAKING',
  ALARMMODE_ON: 'ON',
  ALARMMODE_PARTIAL: 'PARTIAL',
  ALARMMODE_OFF: 'OFF',
  ALARMSOUNDER_ON: 'ON',
  ALARMSOUNDER_OFF: 'OFF',
};
