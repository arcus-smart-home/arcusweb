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

import AccountService from './AccountService.js';
import AlarmService from './AlarmService.js';
import BridgeService from './BridgeService.js';
import DeviceService from './DeviceService.js';
import EasCodeService from './EasCodeService.js';
import I18NService from './I18NService.js';
import InvitationService from './InvitationService.js';
import IpcdService from './IpcdService.js';
import NwsSameCodeService from './NwsSameCodeService.js';
import PairingDeviceService from './PairingDeviceService.js';
import PersonService from './PersonService.js';
import PlaceService from './PlaceService.js';
import ProductCatalogService from './ProductCatalogService.js';
import ProMonitoringService from './ProMonitoringService.js';
import RuleService from './RuleService.js';
import SceneService from './SceneService.js';
import SchedulerService from './SchedulerService.js';
import SessionService from './SessionService.js';
import SubsystemService from './SubsystemService.js';
import SupportSearchService from './SupportSearchService.js';
import SupportSessionService from './SupportSessionService.js';
import VideoService from './VideoService.js';

export default {
  account: AccountService,
  alarmservice: AlarmService,
  bridgesvc: BridgeService,
  dev: DeviceService,
  eascode: EasCodeService,
  i18n: I18NService,
  invite: InvitationService,
  ipcd: IpcdService,
  nwssamecode: NwsSameCodeService,
  pairdev: PairingDeviceService,
  person: PersonService,
  place: PlaceService,
  prodcat: ProductCatalogService,
  promon: ProMonitoringService,
  rule: RuleService,
  scene: SceneService,
  scheduler: SchedulerService,
  sess: SessionService,
  subs: SubsystemService,
  supportsearch: SupportSearchService,
  suppcustsession: SupportSessionService,
  video: VideoService,
};
