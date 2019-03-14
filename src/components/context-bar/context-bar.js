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

import $ from 'jquery';
import _ from 'lodash';
import Component from 'can-component';
import Cornea from 'i2web/cornea/';
import CanMap from 'can-map';
import route from 'can-route';
import 'can-map-define';
import AppState from 'i2web/plugins/get-app-state';
import SidePanel from 'i2web/plugins/side-panel';
import AlarmIncident from 'i2web/models/capability/AlarmIncident';
import CareSubystem from 'i2web/models/capability/CareSubsystem';
import HubAdvancedCapability from 'i2web/models/capability/HubAdvanced';
import { showHubNotification } from 'i2web/plugins/notification';
import HubNetworkCapability from 'i2web/models/capability/HubNetwork';
import AlarmsConfig from 'config/alarms.json';
import view from './context-bar.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {canMap} alert
     * @parent i2web/components/context-bar
     * @description The icon, style, and alarm text for the incident
     */
    alert: {
      get() {
        const alertType =
          this.attr('alertType') && this.attr('alertType').toLowerCase();
        if (alertType) {
          const priority =
            this.highestPriority(this.currentAlertType(), alertType);
          const alarmsConfig = AlarmsConfig[priority];
          if (alarmsConfig) {
            const cssClass = alarmsConfig.incidentClass;
            return new CanMap(_.assign(alarmsConfig, {
              alertText: `${alarmsConfig.displayName} Alarm`,
              icon: alarmsConfig.icon,
              cssClass,
              alertType: priority,
            }));
          }
        }
        return undefined;
      },
    },
    /**
     * @property {String} alertType
     * @parent i2web/components/context-bar
     * @description The type of the alarm
     */
    alertType: {
      get() {
        const incidentAlert = this.attr('currentIncident.incident:alert');
        const incident = incidentAlert && incidentAlert.toLowerCase();
        const care = this.attr('careAlarmState');
        return (incident && care)
          ? this.highestPriority(incident, care)
          : (incident || care);
      },
    },
    /**
     * @property {String} backgroundClass
     * @parent i2web/components/context-bar
     * @description The background color
     */
    backgroundClass: {
      get() {
        const hubOffline = this.attr('hubOffline');
        const alert = this.attr('alert');
        const invitationsExist = this.attr('invitationsExist');
        const matchesAlertingPage = this.attr('matchesAlertingPage');

        if (hubOffline && !alert && !matchesAlertingPage) {
          return invitationsExist ? 'pending-invitation' : '';
        } else if (!hubOffline) {
          if (alert) {
            return alert.cssClass;
          } else if (invitationsExist) {
            return 'pending-invitation';
          }
          return '';
        }
        return 'critical-notice';
      },
    },
    /**
     * @property {String} careAlarmState
     * @parent i2web/components/context-bar
     * @description The current alarm state of the care subsystem
     */
    careAlarmState: {
      get() {
        const state = AppState().attr('careAlarmState');
        return (state === CareSubystem.ALARMSTATE_ALERT) ? 'care' : null;
      },
    },
    /**
     * @property {String} onClick
     * @parent i2web/components/context-bar
     * @description The click function if it exists
     */
    onClick: {
      get() {
        const alert = this.attr('alert');
        const matchesAlertingPage = this.attr('matchesAlertingPage');
        const invitationsExist = this.attr('invitationsExist');
        if (alert && !matchesAlertingPage) {
          return 'routeToService()';
        } else if (invitationsExist) {
          return 'invitationSidebar()';
        }
        return undefined;
      },
    },
    /**
     * @property {Boolean} onDashboard
     * @parent i2web/components/context-bar
     * @description If we are on the dashboard we have a preferences icon that is
     * displayed. Push that icon away from the Hub Offline badge.
     */
    onDashboard: {
      get() {
        return route.attr('page') === 'home';
      },
    },
    /**
     * @property {Incident} currentIncident
     * @parent i2web/components/context-bar
     * @description The current incident of the alarm system, if none exist it is an empty
     * string. If there is a current incident, it is the string address of the incident.
     */
    currentIncident: {
      get() {
        return AppState().attr('currentIncident');
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/components/context-bar
     * @description The Hub connected to the current place
     */
    hub: {
      get() {
        return AppState().attr('hub');
      },
    },
    /**
     * @property {Boolean} hubCellularConnected
     * @parent i2web/components/context-bar
     * @description Does the Hub have a cellular connection
     */
    hubCellularConnected: {
      get() {
        return !this.attr('hubOffline')
          && this.attr('hub.hubnet:type') === HubNetworkCapability.TYPE_3G;
      },
    },
    /**
     * @property {Boolean} hubOffline
     * @parent i2web/components/context-bar
     * @description Indicates whether the hub is offline
     */
    hubOffline: {
      get() {
        const hub = this.attr('hub');
        return hub && !!hub.attr('isOffline');
      },
    },
    /**
     * @property {String} hubOfflineText
     * @parent i2web/components/context-bar
     * @description Indicates if the offline hub is updating firmware
     */
    hubOfflineText: {
      type: 'string',
      get() {
        const hub = AppState().attr('hub');
        if (hub) {
          return hub.attr('hubadv:lastRestartReason') === HubAdvancedCapability.LASTRESTARTREASON_FIRMWARE_UPDATE
            ? 'Hub Firmware Updating'
            : 'Hub Offline';
        }
        return '';
      },
    },
    /**
     * @property {String} icon
     * @parent i2web/components/context-bar
     * @description The icon in the header
     */
    icon: {
      get() {
        const alert = this.attr('alert');
        const invitationsExist = this.attr('invitationsExist');

        if (alert) {
          return alert.icon;
        } else if (invitationsExist) {
          return 'icon-app-user-1';
        }

        return '';
      },
    },
    /**
     * @property {String} id
     * @parent i2web/components/context-bar
     * @description The id in the header
     */
    id: {
      get() {
        const alert = this.attr('alert');
        return alert ? alert.alertType : 'none';
      },
    },
    /**
     * @property {Boolean} invitationsExist
     * @parent i2web/components/context-bar
     * @description If an invitation exists
     */
    invitationsExist: {
      get() {
        const invitationsCount = AppState().attr('invitationsCount');
        return invitationsCount && (invitationsCount > 0);
      },
    },
    /**
     * @property {Boolean} matchesAlertPage
     * @parent i2web/components/context-bar
     * @description Is the User currently on an alerting subsystem page?
     */
    matchesAlertingPage: {
      get() {
        const page = route.attr('page');
        const subpage = route.attr('subpage');
        const type = this.attr('alert.alertType');
        const servicePage = (type === 'care') ? 'care' : 'alarms';
        return page === 'services' && subpage === servicePage;
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/components/context-bar
     * @description The Person logged in. Used for accepting invitations
     */
    person: {
      get() {
        return AppState().attr('person');
      },
    },
    /**
     * @property {String} text
     * @parent i2web/components/context-bar
     * @description The text in the header
     */
    text: {
      get() {
        const alert = this.attr('alert');
        const invitationsExist = this.attr('invitationsExist');

        if (alert) {
          return alert.alertText;
        } else if (invitationsExist) {
          return 'You\'ve been invited!';
        }

        return '';
      },
    },
  },
  AlarmIncident,
  /**
   * @function {String} currentAlertType
   * @parent i2web/components/context-bar
   * @description Using the DOM, determine the current alert type being displayed
   */
  currentAlertType() {
    const id = $('.context-bar').attr('id');
    if (id) {
      const type = id.split('-')[1];
      const alarmTypes = ['co', 'smoke', 'panic', 'security', 'water'];
      if (alarmTypes.includes(type) && !this.attr('currentIncident')) {
        return undefined;
      }
      if (type === 'care' && !this.attr('careAlarmState')) {
        return undefined;
      }
      return type;
    }
    return undefined;
  },
  /**
   * @function {Boolean} isHigherPriority
   * @parent i2web/components/context-bar
   * @param {String} current
   * @param {String} upcoming
   * @description Check whether the new alert is of greater priorty than the
   * current alert
   */
  highestPriority(current, upcoming) {
    const orderOfImportance = [
      'co', 'smoke', 'panic', 'security', 'care', 'water', 'none',
    ];
    const currentIndex = orderOfImportance.indexOf(current);
    const upcomingIndex = orderOfImportance.indexOf(upcoming);
    if (upcomingIndex < 0 && currentIndex < 0) {
      return 'none';
    }
    if (upcomingIndex < 0 && currentIndex >= 0) {
      return current;
    }
    if (upcomingIndex >= 0 && currentIndex < 0) {
      return upcoming;
    }
    return (upcomingIndex <= currentIndex) ? upcoming : current;
  },
  /**
   * @function {void} incrementInvitationsCount
   * @parent i2web/components/context-bar
   * @description increment invitation count
   */
  incrementInvitationsCount(place) {
    // I2-4915 Pay no attention to events for the current place
    if (place && place['base:address'] === AppState().attr('place.base:address')) {
      return;
    }
    this.refreshInvitationsCount();
  },
  /**
   * @function {void} invitationSidebar
   * @parent i2web/components/context-bar
   * @description opens the side panel to accept invitations
   */
  invitationSidebar() {
    SidePanel.right('<arcus-invite-accept {person}="person" />', {
      person: this.compute('person'),
    });
  },
  /**
   * @function {void} refreshInvitationsCount
   * @parent i2web/components/context-bar
   * @description Refreshes AppState's invitation count
   */
  refreshInvitationsCount() {
    AppState().attr('person').PendingInvitations().then(({ invitations }) => {
      AppState().attr('invitationsCount', invitations.length);
    })
      .catch();
  },
  /**
   * @function {Void} routeToService
   * @parent i2web/components/context-bar
   * @description When the User clicks on an alarm in the context bar, route
   * the User to that service
   */
  routeToService() {
    const alarmsConfig = AlarmsConfig[this.attr('alertType')];
    if (alarmsConfig) {
      route.attr({
        page: 'services',
        subpage: alarmsConfig.service,
        action: 'status',
      });
    }
  },
});

export default Component.extend({
  tag: 'arcus-context-bar',
  viewModel: ViewModel,
  view,
  events: {
    incrementInvitationsCallback: null,
    decrementInvitationsCallback: null,
    inserted() {
      this.incrementInvitationsCallback = this.viewModel.incrementInvitationsCount.bind(this.viewModel);
      this.decrementInvitationsCallback = this.viewModel.refreshInvitationsCount.bind(this.viewModel);
      Cornea.on('place person:InvitationPending', this.incrementInvitationsCallback);
      Cornea.on('place person:InvitationCancelled', this.decrementInvitationsCallback);
    },
    removed() {
      if (this.incrementInvitationsCallback) {
        Cornea.removeListener('place person:InvitationPending', this.incrementInvitationsCallback);
      }
      if (this.decrementInvitationsCallback) {
        Cornea.removeListener('place person:InvitationCancelled', this.decrementInvitationsCallback);
      }
    },
    '{viewModel} hubOffline': function notifyHubOffline() {
      if (this.viewModel.attr('hubOffline') !== undefined) {
        showHubNotification(AppState().attr('place'), this.viewModel.attr('hubOffline'));
      }
    },
  },
});
