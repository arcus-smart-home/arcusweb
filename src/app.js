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
 * @module {canMap} i2web/app AppViewModel
 * @parent app.global
 */
import 'i2web/plugins/polyfills';
import _ from 'lodash';
import canMap from 'can-map';
import canList from 'can-list';
import canRoute from 'can-route';
import canDev from 'can-util/js/dev/';
import canEvent from 'can-event';
import 'can-map-define';
import 'can-route-pushstate';
import deepAssign from 'deep-assign';

import Cornea from 'i2web/cornea/';
import Account from 'i2web/models/account';
import auth from 'i2web/models/auth';
import { clearAllProgress } from 'i2web/plugins/account-creation';
import CareSubsystemCaps from 'i2web/models/capability/CareSubsystem';
import Device, { DeviceConnection } from 'i2web/models/device';
import Hub, { HubConnection } from 'i2web/models/hub';
import HubNetCapability from 'i2web/models/capability/HubNetwork';
import Analytics from 'i2web/plugins/analytics';
import { showDeviceErrorsPanel } from 'i2web/plugins/device';
import Errors from 'i2web/plugins/errors';
import Notifications from 'i2web/plugins/notifications';
import SidePanel from 'i2web/plugins/side-panel';
import ProductCatalogService from 'i2web/models/service/ProductCatalogService';
import RuleService from 'i2web/models/service/RuleService';
import Rule, { RuleConnection } from 'i2web/models/rule';
import RuleTemplate from 'i2web/models/rule-template';
import Scene, { SceneConnection } from 'i2web/models/scene';
import SceneService from 'i2web/models/service/SceneService';
import SchedulerService from 'i2web/models/service/SchedulerService';
import Scheduler, { SchedulerConnection } from 'i2web/models/scheduler';
import SessionService from 'i2web/models/service/SessionService';
import SubsystemService from 'i2web/models/service/SubsystemService';
import Place from 'i2web/models/place';
import PlaceManager from 'i2web/models/place-manager';
import Person, { PersonConnection } from 'i2web/models/person';
import Subsystem, { SubsystemConnection } from 'i2web/models/subsystem';
import Incident, { IncidentConnection } from 'i2web/models/incident';
import { deviceNameSorter, personNameSorter, sceneNameSorter, subsystemSorter } from 'i2web/plugins/sorters';
import { requestNotificationPermission } from 'i2web/plugins/notification';

import appMeta from 'package.json';
import preferences from 'config/preferences.json';

// Remove fixtures in production
//!steal-remove-start
import fixture from 'can-fixture/';
import 'i2web/plugins/debug';
//!steal-remove-end

// temporarily adding this for prod builds
import 'flexboxgrid/dist/flexboxgrid.min.css';

const DEFAULT_PAGE = 'home';
// TODO this is a temp fix to get around the IE11 issues with the new create account flow. We should remove this once we have fixed the IE11 stache binding issue.
const AUTH_PAGES = ['create-account', 'login', 'invite', 'send-code'];

const AppViewModel = canMap.extend({
  define: {
    '*': {
      serialize: false,
    },
    /**
    * @property {String} version
    * @parent i2web/app
    *
    * version number of the app
    */
    version: {
      value() {
        return appMeta.version;
      },
    },
    /**
    * @property {Boolean} loggedIn
    * @parent i2web/app
    *
    * Is the user logged in? Based on session
    */
    loggedIn: {
      get() {
        return !!this.attr('session');
      },
    },
    /**
     * @property {String} email
     * @parent i2web/app
     *
     * When the User clicks the account creation email link, the Email is
     * included as a query parameter to populate the login form field
     */
    email: {
      serialize: true,
      type: 'string',
    },
    /**
    * @property {String} page
    * @parent i2web/app
    *
    * on intial authentication it will keep user on same page until auth is complete
    * redirect to login if user is not authorized
    */
    page: {
      set(newVal, __, ___, prevVal) {
        if (prevVal === 'login' && ['android', 'ios', 'web'].includes(this.attr('subpage'))) {
          this.attr('fromEmailLink', this.attr('subpage'));
        }
        // If in the process of initial authenticate, keep the user on the same page until auth complete
        if (AUTH_PAGES.indexOf(newVal) === -1 && this.attr('authenticating')) {
          if (!this.attr('nextPage')) this.attr('nextPage', newVal);
          return newVal;
        }

        // Redirect to login if we are headed to a non-auth page as an anon user
        if (AUTH_PAGES.indexOf(newVal) === -1 && !this.attr('loggedIn')) {
          if (!this.attr('nextPage')) this.attr('nextPage', newVal);
          return 'login';
        }

        // In this case the User has clicked back from the dashboard or account
        // creation after they have logged in. Since there is no login route
        // when there is a session, we should redirect them back to the dashboard
        if (AUTH_PAGES.indexOf(newVal) !== -1 && this.attr('loggedIn')) {
          if (newVal === 'create-account') { return newVal; }
          canRoute.removeAttr('page');
          return 'home';
        }

        // Remove anchor if we aren't on the services page.
        if (newVal !== 'services' && !canRoute.attr('subpage')) {
          canRoute.removeAttr('anchor');
        }

        // Close side panels if they happen to be open.
        SidePanel.close();

        // Scroll to the top of the page. This is basically because we are a single-page app
        // which doesn't really work like a normal html page, espcially with templates and template
        // data being cached. So when we change a page, force a scroll to the top of that page.
        window.scrollTo(0, 0);

        return newVal;
      },
      serialize: true,
    },
    /**
    * @property {Object} nextPage
    * @parent i2web/app
    *
    * next page
    */
    nextPage: {},
    /**
     * @property {String} fromEmailLink
     * @parent i2web/app
     *
     * @description Did the User come to the web by clicking on a link in an email?
     */
    fromEmailLink: {
      type: 'string',
    },
    /**
    * @property {String} subpage
    * @parent i2web/app
    *
    * subpage
    */
    subpage: {
      set(newVal) {
        if (!newVal) { return newVal; }
        let subpage = newVal;
        const page = this.attr('page');
        if (page === 'login') {
          const loginSubpages = [
            'android',
            'ios',
            'web',
            'create-account',
            'send-code',
            'reset-password',
            'reset-confirmation',
          ];
          // If the main page is login, and the subpage we are setting doesn't
          // match a specific set of subpages, we set it to an empty string,
          // removing it.
          if (!loginSubpages.includes(subpage)) {
            subpage = '';
          }
        }

        if (!this.attr('nextSubpage')) this.attr('nextSubpage', subpage);

        // Close side panels if they happen to be open.
        SidePanel.close();

        return subpage;
      },
      serialize: true,
    },
    /**
    * @property {Object} nextSubpage
    * @parent i2web/app
    *
    * next subpage
    */
    nextSubpage: {},
    /**
    * @property {String} anchor
    * @parent i2web/app
    *
    * anchor
    */
    anchor: {
      serialize: true,
    },
    /**
    * @property {String} accordion
    * @parent i2web/app
    *
    * accordion
    */
    accordion: {
      serialize: true,
    },
    /**
    * @property {String} action
    * @parent i2web/app
    *
    * action
    */
    action: {
      serialize: true,
    },
    /**
    * @property {Boolean} authenticating
    * @parent i2web/app
    *
    * authenticating
    */
    authenticating: {
      value: true,
    },
    /**
    * @property {Boolean} reconnecting
    * @parent i2web/app
    *
    * reconnecting
    */
    reconnecting: {
      value: false,
    },
    /**
    * @property {Boolean} ready
    * @parent i2web/app
    *
    * necessary pieces of the app have been loaded
    */
    ready: {
      value: false,
    },
    /**
    * @property {String} title
    * @parent i2web/app
    *
    * title of webpage
    */
    title: {
      value: 'Arcus',
    },
    /**
    * @property {Boolean} useFixtures
    * @parent i2web/app
    *
    * using fixtures or not? Does not allow use of fixtures in production
    */
    // Remove fixtures in production
    //!steal-remove-start
    useFixtures: {
      type: 'boolean',
      value() {
        if (System.isEnv('production')) {
          return false;
        }
        const inStorage = window.localStorage.getItem('preference/system/useFixtures');
        let on = true;
        if (inStorage !== null) {
          on = inStorage !== 'false';
        }
        return on;
      },
      set(newVal) {
        // toggle fixtures on/off
        if (!this.__inSetup) { auth.logout(); }
        if (newVal) {
          steal('i2web/models/fixtures/');
        }
        fixture.on = newVal;
        try {
          window.localStorage.setItem('preference/system/useFixtures', newVal);
        } catch (e) {
          canDev.warn(e);
        }

        return newVal;
      },
    },
    //!steal-remove-end
    /**
     * @property {canMap} leftPanelContent
     *
     * @param {Object} {} An object that includes the following properties:
     * @option {String} [tag] The tag name or template of the component to render
     * @option {Array} [attributes] Argument required to render the template
     *
     * Read by the left side-panel dictating what template to
     * display.
     */
    leftPanelContent: {
      Type: canMap,
      value: {},
    },
    /**
     * @property {canMap} rightPanelContent
     * @parent i2web/app
     * @param {Object} {} An object that includes the following properties:
     * @option {String} [tag] The tag name or template of the component to render
     * @option {Array} [attributes] Argument required to render the template
     *
     * This property is read by the right side-panel dictating what template to
     * display.
     */
    rightPanelContent: {
      Type: canMap,
      value: {},
    },
    /**
     * @property {canList} notifications
     * @parent i2web/app
     * The list of notifications that will be shown at the top of the
     * application. This property is on the AppState as to make it easy to
     * access from any part of the application.
     *
     * It is the responsibility of the notifications component to clear this
     * list of its notifications.
     */
    notifications: {
      Type: canList,
      value: [],
    },
    /**
     *  @property {canMap} session
     * @parent i2web/app
     *
     * current session, based on person. When session ends, person is removed as well
     */
    session: {
      Type: canMap,
      set(newSession) {
        const vm = this;

        const setPlaceGetPreferences = function setPlace(placeId) {
          vm.attr('placeId', placeId);
          SessionService.GetPreferences().then(({ prefs }) => {
            vm.attr('preferences', _.assign(preferences, prefs));
          }).catch((e) => {
            vm.attr('preferences', preferences);
            Errors.log(e);
          });
        };
        const setPlaceError = function setPlaceError(e) {
          Errors.log(e, true);
          vm.logout();
        };

        PlaceManager.activePlaceFromSession(newSession)
          .then(setPlaceGetPreferences).catch(setPlaceError);

        SessionService.onPreferencesChanged(({ prefs }) => {
          vm.attr('preferences').attr(prefs);
        });
        SessionService.onActivePlaceCleared(() => {
          PlaceManager.resetActivePlace()
            .then(setPlaceGetPreferences).catch(setPlaceError);
        });
        SessionService.onSessionExpired(() => {
          if (this.attr('logoutRequested')) {
            this.removeAttr('sessionError');
          } else {
            this.attr('sessionError', 'For your safety, we logged you out. Please login again.');
          }
          this.authLogout();
          auth.logout(false).catch(() => {
            Errors.log('An error occurred trying to delete your account. Please try again later.');
          });
        });
        Cornea.on('sess unauthorized', () => {
          if (this.attr('session')) {
            PlaceManager.resetActivePlace().then(setPlaceGetPreferences).catch(setPlaceError);
          }
        });

        Person.get({
          'base:id': newSession.attr('personId'),
        }).then((person) => {
          this.attr('person', person);
          person.PendingInvitations().then(({ invitations }) => {
            this.attr('invitationsCount', invitations.length);
          }).catch(e => Errors.log(e));
        }).catch(e => Errors.log(e, true));

        return newSession;
      },
      remove() {
        this.attr('ready', false);
        this.removeAttr('placeId');
        this.removeAttr('person');
      },
    },
    /**
     * @property {number} invitationsCount
     * @parent i2web/app
     *
     * The number of place invitations that are pending for the person
     */
    invitationsCount: {
      type: 'number',
    },
    /**
     * @property {Object} acceptedInvitation
     * @parent i2web/app
     * The accepted invitation. Will be truthy when a User accepts an invitation
     * from the UI, and will be set to undefined when the accept modal is closed
     */
    acceptedInvitation: {
      type: '*',
    },
    /**
     * @property {string} cameraPreviewBaseUrl
     * @parent i2web/app
     * The base URL for all camera devices preview images
     */
    cameraPreviewBaseURL: {
      get() {
        return this.attr('session.cameraPreviewBaseUrl');
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/app
     *
     * The default person.
     */
    person: {
      Type: Person,
      set(person) {
        person.ListAvailablePlaces().then(({ places }) => {
          if (places) {
            places.forEach((place) => {
              if (place.primary) {
                person.attr('web:person:primaryPlaceId', place.placeId);
              }
            });
          }
        }).catch(e => Errors.log(e));
        return person;
      },
    },
    /**
     * @property {Person.List} people
     * @parent i2web/app
     *
     * All people tied to this place
     */
    people: {
      Type: Person.List,
      set(newPeople) {
        newPeople.attr('comparator', personNameSorter);
        PersonConnection.addListReference(newPeople, {});
        return newPeople;
      },
      remove(people) {
        if (people) {
          PersonConnection.deleteListReference(people, {});
        }
        return people;
      },
    },
    /**
     * @property {String} placeId
     * @parent i2web/app
     */
    placeId: {
      type: 'string',
      set(placeId, setAsync) {
        // load all the new info
        this.attr('ready', false);
        this.removeAttr('devices');
        this.removeAttr('hub');
        this.removeAttr('incidents');
        this.removeAttr('place');
        this.removeAttr('people');
        this.removeAttr('rules');
        this.removeAttr('ruleTemplates');
        this.removeAttr('scenes');
        this.removeAttr('schedulers');
        this.removeAttr('subsystems');
        this.attr('products', new canMap({}));

        setAsync(placeId);
        const promises = [];
        const placeAddress = `SERV:place:${placeId}`;
        promises.push(
          ProductCatalogService.GetProducts(placeAddress)
            .then((res) => {
              res.products.forEach((product) => {
                this.attr('products').attr(product['product:id'], product);
              });

              const addProduct = ({ product }) => this.attr('products').attr(product['product:id'], product);
              // Hub Generation 2
              promises.push(ProductCatalogService.GetProduct(placeAddress, 'dee000')
                .then(addProduct)
                .catch(Errors.log));
              // Hub Generation 3
              promises.push(ProductCatalogService.GetProduct(placeAddress, 'dee001')
                .then(addProduct)
                .catch(Errors.log));
            })
            .catch((e) => {
              Errors.log(e, true);
            })
        );

        // load subsystems and associated alarm subsystem incidents
        promises.push(SubsystemService.ListSubsystems(placeId).then(({ subsystems }) => {
          this.attr('subsystems', subsystems);
        }));

        // load schedulers
        promises.push(SchedulerService.ListSchedulers(placeId, false).then(({ schedulers }) => {
          this.attr('schedulers', schedulers);
        }));

        // load scenes
        promises.push(SceneService.ListScenes(placeId).then(({ scenes }) => {
          this.attr('scenes', scenes);
        }));

        // load rules
        promises.push(RuleService.ListRules(placeId).then(({ rules }) => {
          this.attr('rules', rules);
        }));

        // load rule templates
        promises.push(this.requestRuleTemplates.bind(this)());

        // load the place and its devices
        promises.push(Place.get({
          'base:id': placeId,
        }).then((place) => {
          this.attr('place', place);

          // load devices
          promises.push(place.ListDevices().then(({ devices }) => {
            this.attr('devices', devices);
          }));

          // load people
          promises.push(place.ListPersons().then(({ persons }) => {
            this.attr('people', persons);
          }));

          promises.push(place.GetHub().then(({ hub }) => {
            if (hub['base:id']) {
              // Since we can run into a timeout with `Hub.get` we mark this hub as "halfFull".
              // HubConnection's handler updateHubInstance will fetch full info onHubConnected or onHubDisconnected event.
              hub.__halfFull = true;
              this.attr('hub', hub);

              // Place method to get hub only provides minimal cached info
              // getAttributes call is required to query full info from hub
              HubConnection.getData({
                'base:id': hub['base:id'],
              }).then((hubAttributes) => {
                this.attr('hub').attr(deepAssign(hub, hubAttributes));
                this.attr('hub').removeAttr('__halfFull');
              }).catch(e => Errors.log(e, true));
            } else {
              // Otherwise, a place with no hub returns empty hub object with no base:id
              this.removeAttr('hub');
            }
          }));

          // once all promises are resolved, then we can open the app
          Promise.all(promises).then(() => {
            this.attr('ready', true);

            // at this moment we can be sure we have all subsystems, and devices
            // so do we:
            //   - have a PreSmoke Alert?
            const safety = this.attr('subsystems').findByName('subsafety');
            if (safety.attr('subsafety:smokePreAlertDevices.length') > 0) {
              this.hasPreSmokeAlert(safety);
            }
          }).catch(e => Errors.log(e, true));
        }));

        return placeId;
      },
      remove() {
        this.attr('ready', false);
        this.removeAttr('products');
        this.removeAttr('devices');
        this.removeAttr('hub');
        this.removeAttr('incidents');
        this.removeAttr('place');
        this.removeAttr('people');
        this.removeAttr('rules');
        this.removeAttr('ruleTemplates');
        this.removeAttr('scenes');
        this.removeAttr('schedulers');
        this.removeAttr('subsystems');
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/app
     */
    hub: {
      Type: Hub,
      set(hub) {
        if (hub) {
          hub.bind('hubnet:type', (ev, connectionType) => {
            if (connectionType === HubNetCapability.TYPE_3G) {
              Notifications.warning(`You're now connected to Cellular Backup. We recommend reconnecting to Ethernet or Wi-Fi when it becomes available.`);
            }
            if (connectionType === HubNetCapability.TYPE_WIFI) {
              Notifications.success(`You have successfully connected to ${this.attr('hub.hubwifi:wifiSsid')}.`);
            }
          });
        }
        return hub;
      },
      remove(hub) {
        canEvent.removeEventListener.call(hub, 'hubnet:type');
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/app
     */
    place: {
      Type: Place,
      set(place) {
        Account.get({
          'base:id': place.attr('place:account'),
        }).then((account) => {
          this.attr('account', account);
          const state = account.attr('account:state');
          if (state !== 'COMPLETE') {
            if (state !== 'ABOUT_YOU') {
              account.attr('account:state', 'ABOUT_YOU').save();
            }
            if (!AUTH_PAGES.includes(this.attr('page'))) {
              canRoute.attr({ page: DEFAULT_PAGE, subpage: undefined, action: undefined });
            }
          }
        }).catch(e => Errors.log(e, true));
        return place;
      },
    },
    /**
     * @property {canMap} preferences
     * @parent i2web/app
     *
     * The User preferences, used for dashboard card ordering, hiding, and
     * showing and hiding tutorials.
     */
    preferences: {
      Type: canMap,
    },
    /**
     * @property {canMap} products
     * @parent i2web/app
     *
     * The product catalog
     */
    products: {
      Value: canMap,
    },
    /**
     * @property {canMap} pairingProduct
     * @parent i2web/app
     *
     * The Product datastructure for a Hub or selected Device
     */
    pairingProduct: {
      Type: canMap,
    },
    /**
     * @property {Account} account
     * @parent i2web/app
     *
     * The authenticated account
     */
    account: {
      Type: Account,
    },
    /**
     * @property {Device.List} devices
     * @parent i2web/app
     *
     * list of devices
     */
    devices: {
      Type: Device.List,
      set(devices) {
        devices.attr('comparator', deviceNameSorter);
        devices
          .bind('add', this.requestRuleTemplates.bind(this))
          .bind('remove', this.requestRuleTemplates.bind(this));

        DeviceConnection.addListReference(devices, {});
        return devices;
      },
      remove(devices) {
        if (devices) {
          DeviceConnection.deleteListReference(devices, {});
          canEvent.removeEventListener.call(devices, 'add');
          canEvent.removeEventListener.call(devices, 'remove');
        }
        return devices;
      },
    },
    /**
     * @property {Rule.List} rules
     * @parent i2web/app
     * @description The list of rules configured for the Place
     */
    rules: {
      Type: Rule.List,
      set(rules) {
        rules.attr('comparator', 'rule:name');
        RuleConnection.addListReference(rules, {});
        return rules;
      },
      remove(rules) {
        if (rules) {
          RuleConnection.deleteListReference(rules, {});
        }
        return rules;
      },
    },
    /**
     * @property {RuleTemplate.List} templates
     * @parent i2web/app
     * @description The list of rule templates for the currently selected place.
     */
    ruleTemplates: {
      Type: RuleTemplate.List,
    },
    /**
     * @property {Scene.List} scenes
     * @parent i2web/app
     *
     * list of scenes
     */
    scenes: {
      Type: Scene.List,
      set(scenes) {
        scenes.attr('comparator', sceneNameSorter);
        scenes.bind('add', this.requestRuleTemplates.bind(this))
              .bind('remove', this.requestRuleTemplates.bind(this));
        SceneConnection.addListReference(scenes, {});
        return scenes;
      },
      remove(scenes) {
        if (scenes) {
          SceneConnection.deleteListReference(scenes, {});
          canEvent.removeEventListener.call(scenes, 'length');
        }
        return scenes;
      },
    },
    /**
     * @property {Scheduler.List} schedulers
     * @parent i2web/app
     *
     * list of Schedulers
     */
    schedulers: {
      Type: Scheduler.List,
      set(schedulers) {
        SchedulerConnection.addListReference(schedulers, {});
        return schedulers;
      },
      remove(schedulers) {
        if (schedulers) {
          SchedulerConnection.deleteListReference(schedulers, {});
        }
        return schedulers;
      },
    },
    /**
     * @property {Subsystem.List} subsystems
     * @parent i2web/app
     *
     * list of subsystems
     */
    subsystems: {
      Type: Subsystem.List,
      set(subsystems) {
        subsystems.attr('comparator', subsystemSorter);
        SubsystemConnection.addListReference(subsystems, {});

        const alarmSubsystem = subsystems.findByName('subalarm');
        // Currently exists a rare case where alarmSubsystem would not actually have
        // all it's mixins at this point and ListIncidents will be undefined. We cannot
        // actually reproduce this in order to figure out where the problem is so in the
        // meantime we just check to see if ListIncidents exists before running it
        if (alarmSubsystem && alarmSubsystem.ListIncidents) {
          // load existing incidents (this will set the current incident, if it exists)
          alarmSubsystem.ListIncidents().then(({ incidents }) => {
            this.attr('incidents', incidents);
          }).catch(e => Errors.log(e));

          // listen for changes on the current incident
          alarmSubsystem.bind('subalarm:currentIncident', (ev, incidentId) => {
            this.setCurrentIncident(incidentId);
          });
          alarmSubsystem.attr('subalarm:availableAlerts')
            .bind('length', this.requestRuleTemplates.bind(this));
        }

        const safety = subsystems.findByName('subsafety');
        if (safety) {
          safety.bind('subsafety:smokePreAlert', (ev, alertValue) => {
            if (alertValue === 'READY') { SidePanel.closeRight(); }
            if (alertValue === 'ALERT') { this.hasPreSmokeAlert(safety); }
          });
        }

        const care = subsystems.findByName('subcare');
        if (care) {
          if (care.attr('subs:available')) {
            this.attr('careAlarmState', care.attr('subcare:alarmState'));
          }
          care.bind('subcare:alarmState', (ev, alarmState) => {
            if (Place.isPremium(this.attr('place.place:serviceLevel'))) {
              this.setCareAlarm(alarmState);
            }
          });
        }
        return subsystems;
      },
      remove(subsystems) {
        if (subsystems) {
          // remove current incident bindings
          const alarmSubsystem = subsystems.findByName('subalarm');
          if (alarmSubsystem) {
            canEvent.removeEventListener.call(alarmSubsystem, 'subalarm:currentIncident');
          }
          const safetySubsystem = subsystems.findByName('subsafety');
          if (safetySubsystem) {
            canEvent.removeEventListener.call(safetySubsystem, 'subsafety:smokePreAlert');
          }
          const careSubsystem = subsystems.findByName('subcare');
          if (careSubsystem) {
            canEvent.removeEventListener.call(careSubsystem, 'subcare:alarmState');
          }
          SubsystemConnection.deleteListReference(subsystems, {});
        }
        this.removeAttr('incidents');
        return subsystems;
      },
    },
    /**
     * @property {Incident.List} incidents
     * @parent i2web/app
     *
     * List of alarm incidents associated with the current place
     */
    incidents: {
      Type: Incident.List,
      set(incidents, setVal) {
        IncidentConnection.addListReference(incidents, {});
        setVal(incidents);

        // set the current incident if we have an alarm subsystem
        const alarmSubsystem = this.attr('subsystems').findByName('subalarm');
        if (alarmSubsystem) {
          this.setCurrentIncident(alarmSubsystem.attr('subalarm:currentIncident'));
        }
      },
      remove(incidents) {
        if (incidents) {
          IncidentConnection.deleteListReference(incidents, {});
        }
        this.removeAttr('currentIncident');
        return incidents;
      },
    },
    /**
     * @property {String} careAlarmState
     * @parent i2web/app
     * @description The alarm state (READY, ALERT) of the care subsystem
     */
    careAlarmState: {
      type: 'string',
    },
    /**
     * @property {Incident} currentIncident
     * @parent i2web/app
     * @description If there is an active incident, this will be defined
     */
    currentIncident: {
      Type: Incident,
    },
    /**
     * @property {string} supportNumber
     * @parent i2web/app
     *
     * phone number for Arcus support
     */
    supportNumber: {
      value: '1-555-555-5555',
    },
    /**
     * @property {string} monitoringStationNumber
     * @parent i2web/app
     *
     * phone number for Promon monitoring station
     */
    monitoringStationNumber: {
      value: '1-555-555-5555',
    },
    /**
     * @property {boolean} logoutRequested
     * @parent i2web/app
     *
     * Indicates if user specifically clicked the logout button. This will prevent any auto-logout message from appearing
     * when platform emits a SessionExpiration due to manual logout.
     */
    logoutRequested: {
      type: 'boolean',
      value: false,
    },
  },
  init() {
    auth.on('authentication:fail', this.authFail.bind(this));
    auth.on('authentication:success', this.authSuccess.bind(this));
    auth.on('authentication:logout', this.authLogout.bind(this));
    auth.authenticate().then(() => {
      this.attr('loginMethod', 'auto');
    }).catch(e => canDev.warn(e));
  },
  /**
  * @function authSuccess
  * @parent i2web/app
  * @param session
  * On auth success, set session to session, if they are reconnecting no need to redirect, otherwise
  * redirect to next page
  */
  authSuccess(session) {
    this.attr('authenticating', false);
    this.attr('session', session);

    // We cannot tag for analytics until we have a session, so we have to store a method
    // property above, and then wait till we have succesfully acquired a session
    Analytics.tag(`login.${this.attr('loginMethod') || 'manual'}`);
    this.removeAttr('loginMethod');

    // Only redirect if we are not reconnecting and we are not in account creation
    // or invitee account creation flows
    const dontRedirectPages = ['create-account', 'invite'];
    const page = canRoute.attr('page');
    if (!this.attr('reconnecting') && !dontRedirectPages.includes(page)) {
      this.redirectToNextPage();
    }
    this.attr('reconnecting', false);
  },
  /**
  * @function authFail
  * @parent i2web/app
  *
  * if authorization fails, if they were logged in, it is reconnection and an error message will
  * display, otherwise, they will be redirected to login
  */
  authFail() {
    this.attr('authenticating', false);
    // If user was logged in, this is a reconnection
    // Show an error. When the reconnection happens, authSuccess will redirect.
    // If user is fresh, go to login.
    if (this.attr('loggedIn')) {
      this.attr('reconnecting', true);
      // This is just a temporary solution until there is a proper error notification widget.
      Notifications.error('Lost connection to Arcus. Reconnecting...', 'icon-app-light-1');
    } else {
      this.redirectToLogin();
    }
  },
  /**
  * @function authLogout
  * @parent i2web/app
  *
  * After logging out, session is deleted, right and left panel content are emptied
  * and user is redirected to the login page
  */
  authLogout() {
    this.removeAttr('session');
    this.attr('reconnecting', false);
    this.attr('authenticating', false);
    this.attr('loggedIn', false);

    this.attr('leftPanelContent', {});
    this.attr('rightPanelContent', {});

    clearAllProgress();
    this.redirectToLogin(true);
  },
  /**
  * @function login
  * @parent i2web/app
  * @param {String} username
  * @param {String} password
   * @param {String} isPublic
  * passes username and password to auth
  */
  login(username, password, isPublic) {
    return auth.login(username, password, isPublic);
  },
  /**
  * @function logout
  * @parent i2web/app
  *
  * logout user
  */
  logout() {
    return auth.logout();
  },
  /**
  * @function redirectToLogin
  * @parent i2web/app
  *
  * Redirect to login page
  */
  redirectToLogin(ignoreCurrentRoute = false) {
    // sometimes we don't want to redirect to login if we are not authenticated
    if (!ignoreCurrentRoute) {
      if (AUTH_PAGES.includes(this.attr('page'))) return;
    }
    this.attr({
      page: 'login',
      subpage: undefined,
      action: undefined,
    });
  },
  /**
  * @function redirectToNextPage
  * @parent i2web/app
  *
  * sets the next page and redirects to next page
  */
  redirectToNextPage() {
    this.attr('page', this.attr('nextPage') || DEFAULT_PAGE);
    if (this.attr('nextSubpage')) {
      this.attr('subpage', this.attr('nextSubpage'));
      this.removeAttr('nextSubpage');
    }
    this.removeAttr('nextPage');
  },
  /**
   * @function requestRuleTemplates
   * @parent i2web/app
   *
   * Request the ruleTemplates for a given place. This is called on intial app load,
   * and when the length of devices or scenes change.
   */
  requestRuleTemplates() {
    return RuleService.ListRuleTemplates(this.attr('placeId')).then(({ ruleTemplates }) => {
      this.attr('ruleTemplates', ruleTemplates);
    });
  },
  setCareAlarm(state) {
    this.attr('careAlarmState', state);
    SidePanel.close();
    if (state === CareSubsystemCaps.ALARMSTATE_ALERT) {
      canRoute.attr({ page: 'services', subpage: 'care', action: 'status' });
    }
  },
  /**
   * @function setCurrentIncident
   * @parent i2web/app
   * @param {string} incidentId
   *
   * Sets the current incident to the given ID, assume it is found in incidents
   */
  setCurrentIncident(incidentId) {
    const incident = _.find(this.attr('incidents'), (i) => {
      return i.attr('base:address') === incidentId;
    });
    if (incident) {
      this.attr('currentIncident', incident);
      // Close side panels if they happen to be open.
      SidePanel.close();
      canRoute.attr({
        page: 'services',
        subpage: 'alarms',
        action: 'status',
      });
    } else {
      this.removeAttr('currentIncident');
    }
  },
  /**
   * @function selectPairingProduct
   * @parent i2web/app
   * @param {CanMap} product The product, selected by the User, to start pairing
   *
   * Set the User-selected product to pair, and switch the route to start the
   * pairing process.
   */
  selectPairingProduct(product, type = 'device') {
    this.attr('pairingProduct', product);
    if (product && type) {
      canRoute.attr({ page: 'pairing', subpage: type });
    }
  },
  /**
   * @function hasPreSmokeAlert
   * @parent i2web/app
   * @param {Subsystem} safety
   *
   * Open the SidePanel to display the PreSmoke Alert on a device(s)
   */
  hasPreSmokeAlert(safety) {
    const devices = _.filter(this.attr('devices'), (d) => {
      const alertDevices = safety.attr('subsafety:smokePreAlertDevices');
      return _.includes(alertDevices, d.attr('base:address'));
    });
    if (devices.length > 0) {
      showDeviceErrorsPanel(devices[0], 'warn');
    }
  },
  /**
   * @function {boolean} renderHeaderFooter
   * @param {string} page The page in the route
   *
   * Only render the header and footer when the page is NOT 'create-account'
   * or 'pairing'
   */
  renderHeaderFooter(page) {
    const doNotRenderFor = [
      'create-account',
      'kit-activate',
      'pairing',
      'product-catalog',
      'hub-setup',
      'invite',
    ];
    return page && !doNotRenderFor.includes(page);
  },
});

canRoute('{page}', { page: DEFAULT_PAGE });
canRoute('{page}/{subpage}');
canRoute('{page}#{anchor}');
canRoute('{page}/{subpage}/{action}');
canRoute('{page}/{subpage}#{anchor}');

// request permission if the user hasn't been asked for permission yet.
requestNotificationPermission();

export default AppViewModel;
