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

import buttonData from './device/buttons.json';
import contactSensorData from './device/contact_sensors.json';
import dimmerData from './device/dimmers.json';
import fanData from './device/fans.json';
import glassBreakSensorData from './device/glass_break_sensors.json';
import hueBridgeData from './device/hue_bridges.json';
import keyFobData from './device/key_fobs.json';
import keyPadData from './device/keypads.json';
import lightData from './device/lights.json';
import lutronBridgeData from './device/lutron_bridges.json';
import motionSensorData from './device/motion_sensors.json';
import pendantData from './device/pendants.json';
import sirenData from './device/sirens.json';
import smokeDetectorData from './device/smoke_detectors.json';
import switchData from './device/switches.json';
import tiltSensorData from './device/tilt_sensors.json';
import ventData from './device/vents.json';
import waterHeaterData from './device/water_heaters.json';
import waterLeakData from './device/water_leaks.json';
import unknownDeviceData from './device/unknowns.json';

export default [].concat(buttonData, contactSensorData, dimmerData, fanData, glassBreakSensorData, hueBridgeData, keyFobData, keyPadData, lightData, lutronBridgeData, motionSensorData, pendantData, sirenData, smokeDetectorData, switchData, tiltSensorData, ventData, waterHeaterData, waterLeakData, unknownDeviceData);
