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

import _ from 'lodash';
import CanList from 'can-list';
import CanMap from 'can-map';
import 'can-map-define';
import Component from 'can-component';
import CareSubsystem from 'i2web/models/capability/CareSubsystem';
import Cornea from 'i2web/cornea/';
import { showCareNotification } from 'i2web/plugins/notification';
import Subsystem from 'i2web/models/subsystem';
import Errors from 'i2web/plugins/errors';
import AppState from 'i2web/plugins/get-app-state';
import SidePanel from 'i2web/plugins/side-panel';
import view from './status.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {List<Behaviors>} behaviors
     * @parent i2web/components/subsystem/care/status
     * @description The behaviors defined on to the Place's subsystem
     */
    behaviors: {
      Type: CanList,
    },
    /**
     * @property {List<BehaviorTemplate>} behaviorTemplates
     * @parent i2web/components/subsystem/care/status
     * @description The behavior templates available to the Place's subsystem
     */
    behaviorTemplates: {
      Type: CanList,
    },
    /**
     * @property {Boolean} careAlert
     * @parent i2web/components/subsystem/care/status
     * @description The care subsystem is alerting
     */
    careAlert: {
      type: 'boolean',
      get() {
        return AppState().attr('careAlarmState')
          === CareSubsystem.ALARMSTATE_ALERT;
      },
    },
    /**
     * @property {String} careAlertName
     * @parent i2web/components/subsystem/care/status
     * @description The name of the alerting behavior
     */
    careAlertName: {
      get() {
        const behavior = _.find(this.attr('behaviors'), (b) => {
          return b.attr('id') === this.attr('subsystem.subcare:lastAlertCause');
        });
        return (behavior) ? behavior.attr('name') : 'Care Alert';
      },
    },
    /**
     * @property {Place} currentPlace
     * @parent i2web/components/subsystem/care/status
     * @description The current place
     */
    currentPlace: {
      get() {
        return AppState().attr('place');
      },
    },
    /**
     * @property {Boolean} refreshBehaviors
     * @parent i2web/components/subsystem/care/status
     * @description Whether or not to refresh the list of behaviors, no on
     * enabling/disabling behaviors, yes on everything else
     */
    refreshBehaviors: {
      value: true,
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/status
     * @description The associated subsystem, this should be a subsystem with the subcare capability
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function clearCareAlert
   * @parent i2web/components/subsystem/care/status
   * @description Clear the currently active care alarm
   */
  clearCareAlert() {
    this.attr('subsystem').Clear().catch(Errors.log);
  },
  /**
   * @function descriptionOf
   * @parent i2web/components/subsystem/care/status
   * @param {CanMap} behavior
   * @description The description for a behavior
   */
  descriptionOf(behavior) {
    const template = this.templateFor(behavior);
    return (template) ? template.attr('description') : '';
  },
  /**
   * @function editBehavior
   * @parent i2web/components/subsystem/care/status
   * @description Open up side panel to edit an existing care behavior
   */
  editBehavior(careBehavior, showSchedule) {
    const template = this.templateFor(careBehavior);
    let attrs = '{care-behavior}="careBehavior" {subsystem}="subsystem" {template}="template"';
    attrs = (showSchedule) ? `${attrs} show-schedule` : attrs;
    SidePanel.right(`<arcus-subsystem-care-behaviors-edit-panel ${attrs} />`, {
      careBehavior,
      subsystem: this.compute('subsystem'),
      template,
    });
  },
  /**
   * @function editSchedule
   * @parent i2web/components/subsystem/care/status
   * @param {Object} behavior
   * @description Open up side panel to schedule care behavior
   */
  editSchedule(behavior) {
    this.editBehavior(behavior, true);
  },
  /**
   * @function fetchBehaviors
   * @parent i2web/components/subsystem/care/status
   * @description Fetch the behaviors from the platform and set 'behaviors'
   */
  fetchBehaviors() {
    if (!this.attr('refreshBehaviors')) return;

    this.attr('subsystem').ListBehaviors().then(({ behaviors }) => {
      this.attr('behaviors', behaviors);
    }).catch(Errors.log);
  },
  /**
   * @function ifScheduled
   * @parent i2web/components/subsystem/care/status
   * @param {Object} behavior
   * @description If the care behavior is scheduled, render the schedule icon
   */
  ifScheduled(behavior) {
    return behavior.attr('timeWindows.length');
  },
  /**
   * @function templateFor
   * @parent i2web/components/subsystem/care/status
   * @param {CanMap} behavior
   * @description The template for a behavior "instance"
   */
  templateFor(behavior) {
    const templates = this.attr('behaviorTemplates');
    return _.find(templates, t => t.id === behavior.templateId);
  },
  /**
   * @function toggleBehavior
   * @parent i2web/components/subsystem/care/status
   * @param {CanMap} behavior
   * @description Toggle whether a care behavior is enabled or disabled
   */
  toggleBehavior(behavior) {
    return () => {
      const enabled = behavior.attr('enabled');
      behavior.attr('enabled', !enabled);
      this.attr('refreshBehaviors', false);
      this.attr('subsystem')
        .UpdateBehavior(behavior.serialize())
        .then(() => this.attr('refreshBehaviors', true))
        .catch(() => this.attr('refreshBehaviors', true));
    };
  },
  /**
   * @function updateBehavior
   * @parent i2web/components/subsystem/care/status
   * @param {CanMap} behavior
   * @description Used by the arcus-form-confirm-field component to change the name
   * of the behavior on blur
   */
  updateBehavior(behavior) {
    const original = _.find(this.attr('behaviors'), (b) => {
      return b.attr('id') === behavior.attr('id');
    });
    const duplicateName = this.attr('behaviors').filter((b) => {
      return b.attr('name') === behavior.attr('name');
    });
    if (duplicateName.length) {
      this.attr('notificationText', 'This Care Behavior name already exists.');
      behavior.attr('name', original.attr('name'));
      return Promise.reject();
    }
    this.removeAttr('notificationText');
    return this.attr('subsystem').UpdateBehavior(behavior.serialize());
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-care-status',
  viewModel: ViewModel,
  view,
  events: {
    fetchCallback: null,
    inserted() {
      const vm = this.viewModel;

      this.fetchCallback = vm.fetchBehaviors.bind(vm);
      Cornea.on('sub subcare:BehaviorAction', this.fetchCallback);

      vm.fetchBehaviors();

      if (vm.attr('careAlert')) {
        showCareNotification(vm.attr('currentPlace'), vm.attr('careAlertName'));
      }
    },
    removed() {
      Cornea.removeListener('sub subcare:BehaviorAction', this.fetchCallback);
    },
    '{viewModel} careAlert': function onCareAlert() {
      const vm = this.viewModel;
      if (vm.attr('careAlert')) {
        showCareNotification(vm.attr('currentPlace'), vm.attr('careAlertName'));
      }
    },
  },
});
