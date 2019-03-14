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

import Account from './Account.js';
import AccountMigration from './AccountMigration.js';
import Alarm from './Alarm.js';
import AlarmIncident from './AlarmIncident.js';
import AlarmSubsystem from './AlarmSubsystem.js';
import Alert from './Alert.js';
import AOSmithWaterHeaterController from './AOSmithWaterHeaterController.js';
import Atmos from './Atmos.js';
import Bridge from './Bridge.js';
import BridgeChild from './BridgeChild.js';
import Button from './Button.js';
import Camera from './Camera.js';
import CameraPTZ from './CameraPTZ.js';
import CamerasSubsystem from './CamerasSubsystem.js';
import CameraStatus from './CameraStatus.js';
import CarbonMonoxide from './CarbonMonoxide.js';
import CareSubsystem from './CareSubsystem.js';
import CellBackupSubsystem from './CellBackupSubsystem.js';
import CentraLiteSmartPlug from './CentraLiteSmartPlug.js';
import ClimateSubsystem from './ClimateSubsystem.js';
import Clock from './Clock.js';
import Cloud from './Cloud.js';
import Color from './Color.js';
import ColorTemperature from './ColorTemperature.js';
import Contact from './Contact.js';
import DayNightSensor from './DayNightSensor.js';
import DeviceAdvanced from './DeviceAdvanced.js';
import Device from './Device.js';
import DeviceConnection from './DeviceConnection.js';
import DeviceOta from './DeviceOta.js';
import DevicePower from './DevicePower.js';
import DeviceMock from './DeviceMock.js';
import Dimmer from './Dimmer.js';
import DoorLock from './DoorLock.js';
import DoorsNLocksSubsystem from './DoorsNLocksSubsystem.js';
import EcowaterWaterSoftener from './EcowaterWaterSoftener.js';
import Fan from './Fan.js';
import Flow from './Flow.js';
import Glass from './Glass.js';
import Halo from './Halo.js';
import HoneywellTCC from './HoneywellTCC.js';
import Hub4g from './Hub4g.js';
import HubAdvanced from './HubAdvanced.js';
import HubAlarm from './HubAlarm.js';
import HubAV from './HubAV.js';
import HubBackup from './HubBackup.js';
import Hub from './Hub.js';
import HubButton from './HubButton.js';
import HubChime from './HubChime.js';
import HubConnection from './HubConnection.js';
import HubDebug from './HubDebug.js';
import HubHue from './HubHue.js';
import HubKit from './HubKit.js';
import HubMetrics from './HubMetrics.js';
import HubNetwork from './HubNetwork.js';
import HubPower from './HubPower.js';
import HubReflex from './HubReflex.js';
import HubSercomm from './HubSercomm.js';
import HubSounds from './HubSounds.js';
import HubVolume from './HubVolume.js';
import HubWiFi from './HubWiFi.js';
import HubZigbee from './HubZigbee.js';
import HubZwave from './HubZwave.js';
import HueBridge from './HueBridge.js';
import Identify from './Identify.js';
import Illuminance from './Illuminance.js';
import Indicator from './Indicator.js';
import IpInfo from './IpInfo.js';
import IrrigationController from './IrrigationController.js';
import IrrigationSchedulable from './IrrigationSchedulable.js';
import IrrigationZone from './IrrigationZone.js';
import KeyPad from './KeyPad.js';
import LawnNGardenSubsystem from './LawnNGardenSubsystem.js';
import LeakGas from './LeakGas.js';
import LeakH2O from './LeakH2O.js';
import Light from './Light.js';
import LightsNSwitchesSubsystem from './LightsNSwitchesSubsystem.js';
import LutronBridge from './LutronBridge.js';
import MobileDevice from './MobileDevice.js';
import MockAlarmIncident from './MockAlarmIncident.js';
import Motion from './Motion.js';
import MotorizedDoor from './MotorizedDoor.js';
import NestThermostat from './NestThermostat.js';
import PairingDevice from './PairingDevice.js';
import PairingDeviceMock from './PairingDeviceMock.js';
import PairingSubsystem from './PairingSubsystem.js';
import Person from './Person.js';
import PetDoor from './PetDoor.js';
import PetToken from './PetToken.js';
import Place from './Place.js';
import PlaceMonitorSubsystem from './PlaceMonitorSubsystem.js';
import PowerUse from './PowerUse.js';
import Presence from './Presence.js';
import PresenceSubsystem from './PresenceSubsystem.js';
import Product from './Product.js';
import ProductCatalog from './ProductCatalog.js';
import ProMonitoringSettings from './ProMonitoringSettings.js';
import Recording from './Recording.js';
import RelativeHumidity from './RelativeHumidity.js';
import Rule from './Rule.js';
import RuleTemplate from './RuleTemplate.js';
import SafetySubsystem from './SafetySubsystem.js';
import Scene from './Scene.js';
import SceneTemplate from './SceneTemplate.js';
import Schedulable from './Schedulable.js';
import Schedule from './Schedule.js';
import Scheduler from './Scheduler.js';
import SecurityAlarmMode from './SecurityAlarmMode.js';
import SecuritySubsystem from './SecuritySubsystem.js';
import Shade from './Shade.js';
import Smoke from './Smoke.js';
import SoilMoisture from './SoilMoisture.js';
import Somfy1 from './Somfy1.js';
import Somfyv1 from './Somfyv1.js';
import SpaceHeater from './SpaceHeater.js';
import Subsystem from './Subsystem.js';
import SupportAgent from './SupportAgent.js';
import SupportAgentLogEntry from './SupportAgentLogEntry.js';
import CustomerInteraction from './CustomerInteraction.js';
import SupportCustomerSession from './SupportCustomerSession.js';
import IcstDocument from './IcstDocument.js';
import IcstMessage from './IcstMessage.js';
import ProblemDevice from './ProblemDevice.js';
import IcstSwannKey from './IcstSwannKey.js';
import SwannBatteryCamera from './SwannBatteryCamera.js';
import Switch from './Switch.js';
import Temperature from './Temperature.js';
import Test from './Test.js';
import Thermostat from './Thermostat.js';
import Tilt from './Tilt.js';
import TwinStar from './TwinStar.js';
import Valve from './Valve.js';
import Vent from './Vent.js';
import WaterHardness from './WaterHardness.js';
import WaterHeater from './WaterHeater.js';
import WaterSoftener from './WaterSoftener.js';
import WaterSubsystem from './WaterSubsystem.js';
import WeatherRadio from './WeatherRadio.js';
import WeatherSubsystem from './WeatherSubsystem.js';
import WeeklySchedule from './WeeklySchedule.js';
import WiFi from './WiFi.js';
import WiFiScan from './WiFiScan.js';

export default {
  account: Account,
  accountmig: AccountMigration,
  alarm: Alarm,
  incident: AlarmIncident,
  subalarm: AlarmSubsystem,
  alert: Alert,
  aosmithwaterheatercontroller: AOSmithWaterHeaterController,
  atmos: Atmos,
  bridge: Bridge,
  bridgechild: BridgeChild,
  but: Button,
  camera: Camera,
  cameraptz: CameraPTZ,
  subcameras: CamerasSubsystem,
  camerastatus: CameraStatus,
  co: CarbonMonoxide,
  subcare: CareSubsystem,
  cellbackup: CellBackupSubsystem,
  centralitesmartplug: CentraLiteSmartPlug,
  subclimate: ClimateSubsystem,
  clock: Clock,
  cloud: Cloud,
  color: Color,
  colortemp: ColorTemperature,
  cont: Contact,
  daynight: DayNightSensor,
  devadv: DeviceAdvanced,
  dev: Device,
  devconn: DeviceConnection,
  devota: DeviceOta,
  devpow: DevicePower,
  devmock: DeviceMock,
  dim: Dimmer,
  doorlock: DoorLock,
  subdoorsnlocks: DoorsNLocksSubsystem,
  ecowater: EcowaterWaterSoftener,
  fan: Fan,
  flow: Flow,
  glass: Glass,
  halo: Halo,
  honeywelltcc: HoneywellTCC,
  hub4g: Hub4g,
  hubadv: HubAdvanced,
  hubalarm: HubAlarm,
  hubav: HubAV,
  hubbackup: HubBackup,
  hub: Hub,
  hubbutton: HubButton,
  hubchime: HubChime,
  hubconn: HubConnection,
  hubdebug: HubDebug,
  hubhue: HubHue,
  hubkit: HubKit,
  hubmetric: HubMetrics,
  hubnet: HubNetwork,
  hubpow: HubPower,
  hubrflx: HubReflex,
  hubsercomm: HubSercomm,
  hubsounds: HubSounds,
  hubvol: HubVolume,
  hubwifi: HubWiFi,
  hubzigbee: HubZigbee,
  hubzwave: HubZwave,
  huebridge: HueBridge,
  ident: Identify,
  ill: Illuminance,
  indicator: Indicator,
  ipinfo: IpInfo,
  irrcont: IrrigationController,
  irrsched: IrrigationSchedulable,
  irr: IrrigationZone,
  keypad: KeyPad,
  sublawnngarden: LawnNGardenSubsystem,
  gas: LeakGas,
  leakh2o: LeakH2O,
  light: Light,
  sublightsnswitches: LightsNSwitchesSubsystem,
  lutronbridge: LutronBridge,
  mobiledevice: MobileDevice,
  incidentmock: MockAlarmIncident,
  mot: Motion,
  motdoor: MotorizedDoor,
  nesttherm: NestThermostat,
  pairdev: PairingDevice,
  pairdevmock: PairingDeviceMock,
  subpairing: PairingSubsystem,
  person: Person,
  petdoor: PetDoor,
  pettoken: PetToken,
  place: Place,
  subplacemonitor: PlaceMonitorSubsystem,
  pow: PowerUse,
  pres: Presence,
  subspres: PresenceSubsystem,
  product: Product,
  prodcat: ProductCatalog,
  promon: ProMonitoringSettings,
  video: Recording,
  humid: RelativeHumidity,
  rule: Rule,
  ruletmpl: RuleTemplate,
  subsafety: SafetySubsystem,
  scene: Scene,
  scenetmpl: SceneTemplate,
  schedulable: Schedulable,
  sched: Schedule,
  scheduler: Scheduler,
  subsecuritymode: SecurityAlarmMode,
  subsecurity: SecuritySubsystem,
  shade: Shade,
  smoke: Smoke,
  soilmoisture: SoilMoisture,
  somfy1: Somfy1,
  somfyv1: Somfyv1,
  spaceheater: SpaceHeater,
  subs: Subsystem,
  supportagent: SupportAgent,
  salogentry: SupportAgentLogEntry,
  suppcustinteraction: CustomerInteraction,
  suppcustsession: SupportCustomerSession,
  icstdoc: IcstDocument,
  icstmsg: IcstMessage,
  suppprobdev: ProblemDevice,
  icstswannkey: IcstSwannKey,
  swannbatterycamera: SwannBatteryCamera,
  swit: Switch,
  temp: Temperature,
  test: Test,
  therm: Thermostat,
  tilt: Tilt,
  twinstar: TwinStar,
  valv: Valve,
  vent: Vent,
  waterhardness: WaterHardness,
  waterheater: WaterHeater,
  watersoftener: WaterSoftener,
  subwater: WaterSubsystem,
  noaa: WeatherRadio,
  subweather: WeatherSubsystem,
  schedweek: WeeklySchedule,
  wifi: WiFi,
  wifiscan: WiFiScan,
};
