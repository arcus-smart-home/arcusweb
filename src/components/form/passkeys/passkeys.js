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
import canList from 'can-list';
import canMap from 'can-map';
import 'can-map-define';
import Component from 'can-component';
import Passkey from 'i2web/models/passkey';
import SidePanel from 'i2web/plugins/side-panel';
import view from './passkeys.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {canList} passkeys
     * @parent i2web/components/form/passkeys
     * @description The person's passkeys, or null while they're loading
     */
    passkeys: {
      Type: canList,
      value: null,
    },
    /**
     * @property {canList} removedPasskeys
     * @parent i2web/components/form/passkeys
     * @description The passkeys that will be removed when the form is saved
     */
    removedPasskeys: {
      Value: canList,
    },
  },
  saving: false,
  /**
   * @function loadPasskeys
   * @parent i2web/components/form/passkeys
   */
  loadPasskeys() {
    return Passkey.list().then((passkeys) => {
      this.attr('passkeys', passkeys);
    }).catch(() => {
      this.attr('passkeys', []);
      this.attr('formError', 'Your passkeys could not be loaded. Please try again later.');
    });
  },
  formValidates() {
    return !!this.attr('removedPasskeys').attr('length');
  },
  /**
   * @function removeFromList
   * @parent i2web/components/form/passkeys
   * @param {Object} passkey
   * @param {HTMLElement} el
   * @description Marks a passkey to be removed when the form is saved
   */
  removeFromList(passkey, el) {
    this.attr('removedPasskeys').push(passkey);
    $(el).closest('li').addClass('removed');
  },
  /**
   * @function removePasskeys
   * @parent i2web/components/form/passkeys
   * @description Removes the marked passkeys from the platform
   */
  removePasskeys(vm, el, ev) {
    ev.preventDefault();
    if (this.attr('saving') || !this.formValidates()) {
      return;
    }

    this.attr('saving', true);
    const removals = this.attr('removedPasskeys').attr().map((passkey) => {
      // 404 means the passkey was already removed, e.g. from another browser
      return Passkey.remove(passkey.id).catch((e) => {
        if (e.status !== 404) {
          throw e;
        }
      });
    });
    Promise.all(removals).then(() => {
      this.attr('saving', false);
      SidePanel.close();
    }).catch(() => {
      this.attr('saving', false);
      this.attr('formError', 'Some passkeys could not be removed. Please try again.');
    });
  },
});

export default Component.extend({
  tag: 'arcus-form-passkeys',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      this.viewModel.loadPasskeys();
    },
  },
});
