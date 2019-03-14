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

import canRoute from 'can-route';
import getAppState from 'i2web/plugins/get-app-state';
import Notifications from 'i2web/plugins/notifications';
import PairingDeviceCapability from 'i2web/models/capability/PairingDevice.js';
import SidePanel from 'i2web/plugins/side-panel';
import 'i2web/components/pairing/hub-paired.component';

export default [
  {
    enabled() {
      return !!getAppState().attr('person.web:person:isOwner');
    },
    available: true,
    type: 'hub',
    icon: 'icon-platform-hub-1',
    heading: 'Add a Smart Hub or Kit',
    subheading: 'Pair a Hub or a Pre-packaged Collection of Devices',
    action() {
      const hub = getAppState().attr('hub');
      if (!!hub) {
        const pairingSubsystem =
          getAppState().attr('subsystems').findByName('subpairing');
        const getPairDevs = pairingSubsystem.ListPairingDevices();
        const getKitDevs = pairingSubsystem.GetKitInformation();

        Promise.all([getPairDevs, getKitDevs])
          .then(([{ devices }, { kitInfo }]) => {
            let unpaired = [];
            if (kitInfo) {
              unpaired = kitInfo.filter((kd) => {
                const foundPairDev = devices.filter((pd) => {
                  return kd.protocolAddress === pd['pairdev:protocolAddress']
                    && pd['pairdev:pairingState'] === PairingDeviceCapability.PAIRINGSTATE_PAIRING;
                });
                return foundPairDev[0];
              });
            }
            if (unpaired.length > 0) {
              if (hub.attr('isOffline')) {
                Notifications.error('Hub Offline. Re-connect your Hub and then try to pair.', 'icon-platform-warning-2');
                SidePanel.closeRight();
              } else {
                canRoute.attr({page: 'kit-activate', subpage: undefined, action: undefined});
              }
            } else {
              SidePanel.right('<arcus-pairing-hub-paired />', {});
            }
          }).catch(() => {
          SidePanel.right('<arcus-pairing-hub-paired />', {});
        });
      } else {
        canRoute.attr({ page: 'hub-setup', subpage: 'product-groups', action: undefined });
      }
    },
  },
  {
    enabled: true,
    available: true,
    type: 'device',
    icon: 'icon-app-devices',
    heading: 'Add a Device',
    subheading: 'Pair a Device',
    action() {
      const subsystems = getAppState().attr('subsystems');
      subsystems.findByName('subpairing').DismissAll();
      canRoute.attr({ page: 'product-catalog', subpage: 'brands', action: undefined });
    },
  },
  {
    enabled: true,
    available: true,
    type: 'person',
    icon: 'icon-app-user-2',
    heading: 'Add a Person',
    subheading: 'Invite Someone',
    action: 'settings/places/add-person',
  },
  {
    enabled: true,
    available: true,
    type: 'rule',
    icon: 'icon-app-pencil-2',
    heading: 'Add a Rule',
    subheading: 'Connect & Automate Devices',
    action: 'rules/add',
  },
  {
    enabled: true,
    available: true,
    type: 'scene',
    icon: 'icon-app-scene-2',
    heading: 'Add a Scene',
    subheading: 'Control Several Devices at Once',
    action: 'scenes/add',
  },
  {
    enabled: true,
    available: true,
    type: 'place',
    icon: 'icon-platform-home-2',
    heading: 'Add a Place',
    subheading: 'Add Additional Place (e.g. Vacation Home)',
    action: 'settings/places/add-place',
  },
  {
    enabled: true,
    available: true,
    type: 'behavior',
    icon: 'icon-app-care-heart-2',
    heading: 'Add a Care Behavior',
    subheading: 'Trigger a Care Alarm when a loved one\'s routine is out of the ordinary',
    action: 'services/care/behaviors',
  },
];
