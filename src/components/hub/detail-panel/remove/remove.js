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

import 'can-map-define';
import { FormComponent, FormViewModel } from 'i2web/components/form/';
import Hub from 'i2web/models/hub';
import Notifications from 'i2web/plugins/notifications';
import SidePanel from 'i2web/plugins/side-panel';
import view from './remove.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/hub/detail-panel/remove
     * @description Form validation constraints
     */
    constraints: {
      value: {
        remove: {
          presence: {
            message: 'Field cannot be blank',
          },
          format: {
            pattern: /REMOVE/i,
            message: 'You must type REMOVE to continue',
          },
        },
      },
    },
    /**
     * @property {Hub} hub
     * @parent i2web/components/hub/detail-panel/remove
     * @description Hub that will be removed.
     */
    hub: {
      Type: Hub,
    },
    /**
     * @property {string} remove
     * @parent i2web/components/hub/detail-panel/remove
     * @description Confirmation string to remove hub
     */
    remove: {
      type: 'string',
    },
    /**
     * @property {boolean} removeHubInProgress
     * @parent i2web/components/hub/detail-panel/remove
     * @description Indicates that the user initiated a hub remove request,
     * intended to be two-way bound
     */
    removeHubInProgress: {
      type: 'boolean',
    },
    /**
     * @property {boolean} showConfirm
     * @parent i2web/components/hub/detail-panel/remove
     * @description Whether or not to show the confirmation panel
     */
    showConfirm: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} showRemoveForm
     * @parent i2web/components/hub/detail-panel/remove
     * @description Whether or not to show the form for removal,
     * intended to be two-way bound
     */
    showRemoveForm: {
      type: 'boolean',
    },
  },
  /**
   * @function cancelRemove
   * @parent i2web/components/hub/detail-panel/remove
   * @description Cancels the hub removal process
   */
  cancelRemove() {
    this.attr({
      removeHubInProgress: false,
      showRemoveForm: false,
    });
  },
  /**
   * @function confirmRemove
   * @parent i2web/components/hub/detail-panel/remove
   * @description Click handler to prompt confirming the removal of hub
   */
  confirmRemove(vm, el, ev) {
    ev.preventDefault();
    ev.stopImmediatePropagation();

    if (this.formValidates()) {
      this.attr('showConfirm', true);
    }
  },
  /**
   * @function removeHub
   * @parent i2web/components/hub/detail-panel/remove
   * @description Click handler to remove the hub
   */
  removeHub(vm, el, ev) {
    ev.preventDefault();
    ev.stopImmediatePropagation();

    this.attr('saving', true);

    const hub = this.attr('hub');
    const hubName = hub.attr('hub:name');
    hub.Delete().then(() => {
      this.attr('saving', false);
      this.attr('showConfirm', false);
      SidePanel.close();
      const message = `${hubName} has been successfully removed.`;
      Notifications.success(message);
    }).catch((e) => {
      this.attr('saving', false);
      this.attr('formError', `${e.message}. Please try again later. If you continue to have problems, please call Arcus support.`);
    });
  },
});

export default FormComponent.extend({
  tag: 'arcus-hub-detail-panel-remove',
  viewModel: ViewModel,
  view,
});
