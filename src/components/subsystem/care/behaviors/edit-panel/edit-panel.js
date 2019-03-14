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
import AppState from 'i2web/plugins/get-app-state';
import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import CareBehavior from 'i2web/models/care-behavior';
import Errors from 'i2web/plugins/errors';
import Notifications from 'i2web/plugins/notifications';
import Place from 'i2web/models/place';
import SidePanel from 'i2web/plugins/side-panel';
import Subsystem from 'i2web/models/subsystem';
import view from './edit-panel.stache';

import { formatDevicesStatus, formatDevicesOpenStatus, formatDurationStatus, formatTemperatureRangeStatus, formatTimeStatus, formatTimeWindowsStatus } from 'i2web/helpers/behavior';

const REQUIRED_FIELD = '<span class="required-field">Required</span>';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Object} careBehavior
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description The associated careBehavior being edited
     */
    careBehavior: {
      type: '*',
      set(behavior) {
        if (behavior) {
          this.attr('formBehavior', new CareBehavior(behavior));
        }
        return behavior;
      },
    },
    /**
     * @property {boolean} confirmingDelete
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Toggles delete confirmation overlay
     */
    confirmingDelete: {
      value: false,
    },
    /**
     * @property {Boolean} disableSave
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Indicates if any required fields have yet to be set
     */
    disableSave: {
      get() {
        const fields = this.attr('template.fields').attr();
        return this.attr('panelExpanded') || !!_.find(fields, ((f) => {
          return this.getFieldStatus(f.sortKey) === REQUIRED_FIELD;
        }));
      },
    },
    /**
     * @property {String} editFieldType
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Field type currently being edited and shown in the right side panel
     */
    editFieldType: {
      type: 'string',
    },
    /**
     * @property {CareBehavior} careBehavior
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description An observable CareBehavior being edited
     */
    formBehavior: {
      Type: CareBehavior,
    },
    /**
     * @property {String} formError
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Holds the error string for any failed save
     */
    formError: {
      type: 'string',
    },
    /**
     * @property {Boolean} isNew
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Indicates if the panel has been opened in the context of adding a new care behavior
     */
    isNew: {
      get() {
        const behaviorId = this.attr('formBehavior.id');
        return !behaviorId;
      },
    },
    /**
     * @property {Boolean} isReadOnly
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Indicates if the panel contents should be read-only; shows details for unavailable templates
     */
    isReadOnly: {
      get() {
        return !this.attr('formBehavior');
      },
    },
    /**
     * @property {Boolean} panelExpanded
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Whether the side panel is double width
     */
    panelExpanded: {
      type: 'boolean',
      value: false,
      set(expanded) {
        $('.panel-container')[(expanded) ? 'addClass' : 'removeClass']('is-double');
        return expanded;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Where the displayed care information is configured
     */
    place: {
      Type: Place,
      get() {
        return AppState().attr('place');
      },
    },
    /**
     * @property {HTMLBool} showSchedule
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description Allows the status page to open the timewindows panel
     * by clicking the schedule icon
     */
    showSchedule: {
      type: 'htmlbool',
      set(showSchedule) {
        if (showSchedule) this.editField('timeWindows');
        return showSchedule;
      },
    },
    /**
     * @property {Object} sortedTemplateFields
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description The sorted collection of fields to display for editing
     */
    sortedTemplateFields: {
      get() {
        const fields = this.attr('template.fields').attr();
        return _.sortBy(fields, ((f) => { return f.sortKey; }));
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description The associated subsystem, this should be a subsystem with the subcare capability
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Object} template
     * @parent i2web/components/subsystem/care/behaviors/edit-panel
     * @description The care behavior template from which we will create a new behavior
     */
    template: {
      type: '*',
      set(template) {
        return template;
      },
    },
  },
  /**
   * @function cancelDelete
   * @parent i2web/components/subsystem/care/behaviors/edit-panel
   * @description Cancels deletion
   */
  cancelDelete() {
    this.attr('confirmingDelete', false);
  },
  /**
   * @function confirmDelete
   * @parent i2web/components/subsystem/care/behaviors/edit-panel
   * @description Starts the process of confirming deletion
   */
  confirmDelete() {
    this.attr('confirmingDelete', true);
  },
  /**
   * @function deleteBehavior
   * @parent i2web/components/subsystem/care/behaviors/edit-panel
   * @description Removes the care behavior from the platform
   */
  deleteBehavior() {
    if (this.attr('formBehavior.id')) {
      const subsystem = this.attr('subsystem');
      subsystem.RemoveBehavior(this.attr('formBehavior.id'))
        .then(() => {
          Notifications.success(`${this.attr('formBehavior.name')} was removed.`, 'icon-app-care-heart-2');
          SidePanel.close();
        }).catch(Errors.log);
    }
  },
  /**
   * @function doneEditingField
   * @parent i2web/components/subsystem/care/behaviors/edit-panel
   * @description Closes the right hand side panel
   */
  doneEditingField() {
    this.attr('panelExpanded', false);
    this.removeAttr('formError');
    this.attr('editFieldType', null);
  },
  /**
   * @function editField
   * @parent i2web/components/subsystem/care/behaviors/edit-panel
   * @param fieldType
   * @description Opens the right side panel and sets the attribute that
   * controls which component is rendered in the panel
   */
  editField(fieldType) {
    this.attr('panelExpanded', true);
    this.attr('editFieldType', fieldType);
  },
  /**
   * @property {String} getFieldStatus
   * @parent i2web/components/subsystem/care/behaviors/edit-panel
   * @param fieldKey
   * @description Shows the current behavior's status for the specific field
   */
  getFieldStatus(fieldKey) {
    if (this.attr('isReadOnly')) {
      return '';
    }

    switch (fieldKey) {
      case 'devices':
        return formatDevicesStatus(this.attr('formBehavior'), this.attr('template.availableDevices'), REQUIRED_FIELD);
      case 'devicesOpenCount':
        return formatDevicesOpenStatus(this.attr('formBehavior'), this.attr('template.availableDevices'), REQUIRED_FIELD);
      case 'duration':
        return formatDurationStatus(this.attr('formBehavior'), this.attr('template.fields.duration.unit'), REQUIRED_FIELD);
      case 'temperatureRange':
        return formatTemperatureRangeStatus(this.attr('formBehavior'), REQUIRED_FIELD);
      case 'time':
        return formatTimeStatus(this.attr('formBehavior'), this.attr('place.place:tzId'), 'h:mm A', REQUIRED_FIELD);
      case 'timeWindows':
        return formatTimeWindowsStatus(this.attr('formBehavior'), '24/7');
      default:
        return REQUIRED_FIELD;
    }
  },
  /**
   * @function saveCareBehavior
   * @description Saves the care behavior to the platform
   */
  saveCareBehavior() {
    const subsystem = this.attr('subsystem');
    const behavior = this.attr('formBehavior').attr();

    this.removeAttr('formError');
    let saveMethod = this.attr('isNew') ? subsystem.AddBehavior : subsystem.UpdateBehavior;
    saveMethod = saveMethod.bind(subsystem);

    saveMethod(behavior)
      .then(() => {
        SidePanel.close();
        Notifications.success(`'${this.attr('formBehavior.name')}' has been ${this.attr('isNew') ? 'added' : 'saved'}.`,
          'icon-app-care-heart-2');
      })
      .catch((e) => {
        if (e.code === 'care.name_in_use') {
          this.attr('formError', 'Care Behavior name must be unique.');
        } else if (e.code === 'care.window_duration_too_short') {
          this.attr('formError', 'Error saving Care Behavior. There is a conflict between chosen duration and scheduled monitoring times.');
        } else {
          this.attr('formError', 'Error saving Care Behavior. Please try again.');
          Errors.log(e);
        }
      });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-care-behaviors-edit-panel',
  viewModel: ViewModel,
  view,
});
