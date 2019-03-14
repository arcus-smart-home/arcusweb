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

import 'i2web/models/test';
import 'i2web/app';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'i2web/app.less';

// component tests
import 'i2web/components/accordion/accordion_test';
import 'i2web/components/accordion/panel/panel_test';
import 'i2web/components/camera/camera_test';
import 'i2web/components/carousel/carousel_test';
import 'i2web/components/context-bar/context-bar_test';
import 'i2web/components/control-switch/control-switch_test';
import 'i2web/components/countdown/countdown_test';
import 'i2web/components/create-account/create-account_test';
import 'i2web/components/device/device_test';
import 'i2web/components/device/badges/badges-test';
import 'i2web/components/device/configuration-panel/configuration-panel_test';
import 'i2web/components/device/configurators/irrigation-mode/irrigation-mode-test';
import 'i2web/components/device/configurators/motion-sensitivity/motion-sensitivity-test';
import 'i2web/components/device/configurators/noaa-location/noaa-location-test';
import 'i2web/components/device/configurators/noaa-radio/noaa-radio-test';
import 'i2web/components/device/configurators/noaa-weather-alerts/noaa-weather-alerts-test';
import 'i2web/components/device/configurators/wifiScan/wifiScan_test';
import 'i2web/components/device/detail-panel/detail-panel_test';
import 'i2web/components/device/error-panel/error-panel_test';
import 'i2web/components/device/list/list_test';
import 'i2web/components/device/actions/thermostat-slider/thermostat-slider_test';
// TODO devtools test?
import 'i2web/components/event-list/event-list_test';
import 'i2web/components/favorite/favorite_test';
import 'i2web/components/form/form_test';
import 'i2web/components/form/delete-account/delete-account_test';
import 'i2web/components/header/header_test';
import 'i2web/components/hub/configuration-panel/configuration-panel_test';
import 'i2web/components/hub/detail-panel/detail-panel_test';
import 'i2web/components/hub/panel/panel_test';
import 'i2web/components/icon-grid/icon-grid_test';
import 'i2web/components/infinite-scroll/infinite-scroll_test';
import 'i2web/components/notifications/notifications_test';
import 'i2web/components/pairing/help/help-test';
import 'i2web/components/pairing/customize/device/device-test';
import 'i2web/components/pairing/customize/room/room-test';
import 'i2web/components/pairing/steps/steps-test';
import 'i2web/components/pin-code/pin-code_test';
import 'i2web/components/place-selector/place-selector_test';
import 'i2web/components/progress-bar/progress-bar-test';
import 'i2web/components/recording/recording-test';
import 'i2web/components/rules/category-list/category-list_test';
import 'i2web/components/rules/edit-panel/edit-panel_test';
import 'i2web/components/rules/my-list/my-list_test';
import 'i2web/components/scenes/scenes_test';
import 'i2web/components/scenes/action-device-selector/action-device-selector_test';
import 'i2web/components/scenes/device-configurator/device-configurator_test';
import 'i2web/components/scenes/edit-panel/edit-panel_test';
import 'i2web/components/schedule/calendar/calendar_test';
import 'i2web/components/schedule/calendar/day/day_test';
import 'i2web/components/schedule/edit-panel/edit-panel_test';
import 'i2web/components/schedule/edit-panel/day-carousel/day-carousel_test';
import 'i2web/components/schedule/event/event_test';
import 'i2web/components/schedule/mode/mode_test';
import 'i2web/components/schedule/offset-minutes/offset-minutes_test';
import 'i2web/components/schedule/time/time_test';
import 'i2web/components/segmented-radial/segmented-radial_test';
import 'i2web/components/settings/invites/accept-code/accept-code-test';
import 'i2web/components/settings/people/add-person/add-person_test';
import 'i2web/components/settings/people/contact-info-form/contact-info-form_test';
import 'i2web/components/settings/people/edit-contact-info/edit-contact-info_test';
import 'i2web/components/settings/places/places_test';
import 'i2web/components/settings/places/cancel-invitation/cancel-invitation_test';
import 'i2web/components/settings/places/place/place_test';
import 'i2web/components/settings/places/promonitoring-info/promonitoring-info_test';
import 'i2web/components/settings/places/remove-place/remove-place_test';
import 'i2web/components/settings/profile/profile_test';
import 'i2web/components/side-panel/side-panel_test';
import 'i2web/components/spinner/spinner_test';
import 'i2web/components/storage-capacity/storage-capacity-test.js';
import 'i2web/components/subsystem/alarms/alarms_test';
import 'i2web/components/subsystem/alarms/notification-list/notification-list_test';
import 'i2web/components/subsystem/alarms/settings/settings_test';
import 'i2web/components/subsystem/alarms/status/status_test';
import 'i2web/components/subsystem/cameras/cameras_test';
import 'i2web/components/subsystem/cameras/clips/clips_test';
import 'i2web/components/subsystem/cameras/storage/storage_test';
import 'i2web/components/subsystem/card/card_test';
import 'i2web/components/subsystem/care/care-test';
import 'i2web/components/subsystem/care/activity/activity-test';
import 'i2web/components/subsystem/care/behaviors/behaviors-test';
import 'i2web/components/subsystem/care/behaviors/edit-panel/edit-panel-test';
import 'i2web/components/subsystem/care/card/card-test';
import 'i2web/components/subsystem/care/settings/settings-test';
import 'i2web/components/subsystem/care/status/status-test';
import 'i2web/components/subsystem/care/status/active/active-test';
import 'i2web/components/subsystem/care/status/incident-list/incident-list-test';
import 'i2web/components/subsystem/climate/climate_test';
import 'i2web/components/subsystem/climate/card/card-test';
import 'i2web/components/subsystem/climate/settings/settings-test';
import 'i2web/components/subsystem/doors-locks/doors-locks-test';
import 'i2web/components/subsystem/doors-locks/access-list/access-list-test';
import 'i2web/components/subsystem/doors-locks/settings/settings-test';
import 'i2web/components/subsystem/doors-locks/status/status-test';
import 'i2web/components/subsystem/favorites/favorites_test';
import 'i2web/components/subsystem/lawn-garden/card/card-test';
import 'i2web/components/subsystem/status/lights-switches/lights-switches_test';
import 'i2web/components/subsystem/weather/alerts/alerts-test';
import 'i2web/components/terms/terms_test';
import 'i2web/components/thermostat/thermostat_test';
import 'i2web/components/tooltip/tooltip_test';
import 'i2web/components/wifi-scan/wifi-scan_test';
import 'i2web/components/wizard/wizard_test';
import 'i2web/components/zwave-tools/rebuild/rebuild-test';
import 'i2web/components/zwave-tools/remove/remove-test';

// connections tests
import 'i2web/connections/helpers/changeStore_test';
import 'i2web/connections/helpers/overwrite_test';
import 'i2web/connections/can-map-diff_test';
import 'i2web/connections/can-map-address_test';
import 'i2web/connections/merge-data_test';
import 'i2web/connections/data-cornea_test';

// cornea tests
import 'i2web/cornea/cornea_test';
import 'i2web/cornea/bridge_test';
import 'i2web/cornea/backoff_test';

// helper tests
// TODO

// model tests
// TODO

// page tests
import 'i2web/pages/devices/devices_test';
import 'i2web/pages/history/history_test';
import 'i2web/pages/home/home_test';
import 'i2web/pages/login/login_test';
import 'i2web/pages/promonitoring/promonitoring_test';
import 'i2web/pages/rules/rules_test';
import 'i2web/pages/scenes/scenes_test';
import 'i2web/pages/services/services_test';
import 'i2web/pages/settings/settings_test';

// plugin tests
// TODO
