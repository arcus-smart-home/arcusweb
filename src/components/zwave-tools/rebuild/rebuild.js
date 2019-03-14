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

import Component from 'can-component';
import CanMap from 'can-map';
import 'can-map-define';
import getAppState from 'i2web/plugins/get-app-state';
import view from './rebuild.stache';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {boolean} showModal
     * @parent i2web/components/zwave-tools/rebuild
     *
     * When to show the rebuild modal. Controlled by open() & close().
     */
    showModal: {
      value: false,
    },
    /**
     * @property {string} mode
     * @parent i2web/components/zwave-tools/rebuild
     *
     * Codename for set of ad copy and controls to display. Possible values are 'rebuild',
     * 'confirm-cancel' & 'success'. Controlled by the ui and changes to the platform
     * rebuild state.
     */
    mode: {
      value: 'rebuild',
    },
    /**
     * @property {boolean} isCancelInProgress
     * @parent i2web/components/zwave-tools/rebuild
     *
     * If a cancel has been started but the platform hasn't yet stopped the rebuild.
     * Controlled by cancelHeal() and changes to the platform rebuild state.
     */
    isCancelInProgress: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isHealInProgress
     * @parent i2web/components/zwave-tools/rebuild
     *
     * If a heal has been started and it hasn't yet completed or been canceled.
     */
    isHealInProgress: {
      get() {
        return getAppState().attr('hub.hubzwave:healInProgress');
      },
    },
    /**
     * @property {Number} healPercent
     * @parent i2web/components/zwave-tools/rebuild
     *
     * The percentage of the heal that has been completed.
     */
    healPercent: {
      get() {
        return (this.attr('mode') === 'success') ? 100
          : Math.round((getAppState().attr('hub.hubzwave:healPercent') || 0) * 100);
      },
    },
    /**
     * @property {string} headerText
     * @parent i2web/components/zwave-tools/rebuild
     *
     * The content of the modal header
     */
    headerText: {
      get() {
        switch (this.attr('mode')) {
          case 'rebuild':
            return 'Rebuilding...';
          case 'confirm-cancel':
            return 'Are You Sure?';
          case 'success':
            return 'Success!';
          default:
            return '';
        }
      },
    },
    /**
     * @property {boolean} showCloseContinue,
     * @parent i2web/components/zwave-tools/rebuild
     *
     * If the close button should be shown
     */
    showCloseContinue: {
      get() {
        return this.attr('mode') === 'confirm-cancel'
          || this.attr('mode') === 'rebuild';
      },
    },
    /**
     * @property {string} showCancel
     * @parent i2web/components/zwave-tools/rebuild
     *
     * If the cancel button should be shown.
     */
    showCancel: {
      get() {
        return this.attr('mode') === 'confirm-cancel'
          || this.attr('mode') === 'rebuild';
      },
    },
  },
  /**
   * @property {Function} cancelHeal
   * @parent i2web/components/zwave-tools/rebuild
   *
   * Make the cancel call on the bridge and indicate the cancel is now in progress.
   */
  cancelHeal() {
    getAppState().attr('hub').CancelHeal();
    this.attr('isCancelInProgress', true);
  },
  /**
   * @property {Function} startHeal
   * @parent i2web/components/zwave-tools/rebuild
   *
   * Make the heal call on the bridge.
   */
  startHeal() {
    getAppState().attr('hub').Heal(false, null);
  },
  /**
   * @property {Function} open
   * @parent i2web/components/zwave-tools/rebuild
   *
   * Open the component.
   */
  open() {
    this.attr('mode', 'rebuild');
    this.attr('showModal', true);
  },
  /**
   * @property {Function} close
   * @parent i2web/components/zwave-tools/rebuild
   *
   * Close the component.
   */
  close() {
    this.attr('showModal', false);
  },
  /**
   * @property {Function} setMode
   * @parent i2web/components/zwave-tools/rebuild
   *
   * Set the mode on the view model.
   */
  setMode(mode) {
    this.attr('mode', mode);
  },
});

export default Component.extend({
  tag: 'arcus-zwave-tools-rebuild',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel} showModal': function showModalChange(vm, ev, val) {
      if (val && vm.attr('isHealInProgress') === false) {
        vm.startHeal();
      }
    },
    '{viewModel} isHealInProgress': function healPromiseChange(vm, ev, val) {
      if (val) { // when heal starts
        vm.attr('mode', 'rebuild'); // move to rebuild mode
      } else if (vm.attr('isCancelInProgress')) { // when heal ends during an on-going cancel
        vm.attr('isCancelInProgress', false); // cancel is over
        vm.close(); // close modal
      } else { // when heal ends and there was no on-going cancel
        vm.attr('mode', 'success');  // show success view
      }
    },
  },
});
