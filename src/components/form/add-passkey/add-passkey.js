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

import { FormComponent, FormViewModel } from 'i2web/components/form/';
import 'can-map-define';
import Passkey from 'i2web/models/passkey';
import view from './add-passkey.stache';

const BROWSERS = [[/Edg/, 'Edge'], [/Firefox|FxiOS/, 'Firefox'], [/Chrome|CriOS/, 'Chrome'], [/Safari/, 'Safari']];
// iPhone and Android user agents also mention Mac OS X and Linux, so they're checked first
const SYSTEMS = [[/iPhone/, 'iPhone'], [/iPad/, 'iPad'], [/Android/, 'Android'], [/CrOS/, 'ChromeOS'], [/Mac OS X/, 'Mac'], [/Windows/, 'Windows'], [/Linux/, 'Linux']];

/**
 * @function suggestedName
 * @parent i2web/components/form/add-passkey
 * @param {String} userAgent
 * @return {String} A starting name for a passkey made in this browser, e.g. "Chrome on Mac"
 */
export function suggestedName(userAgent = window.navigator.userAgent) {
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent));
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent));
  if (browser && system) {
    return `${browser[1]} on ${system[1]}`;
  }
  return (system || browser || [null, 'Passkey'])[1];
}

/**
 * @function addPasskeyErrorMessage
 * @parent i2web/components/form/add-passkey
 * @param {Object} e The rejection from Passkey.register: a DOMException from
 * the browser's passkey prompt, or a jqXHR for HTTP failures
 * @return {String|null} null when the person dismissed the browser's prompt
 */
export function addPasskeyErrorMessage(e) {
  if (e && (e.name === 'NotAllowedError' || e.name === 'AbortError')) {
    return null;
  }
  if (e && e.name === 'InvalidStateError') {
    return 'You already have a passkey for your Arcus account saved here.';
  }
  if (e && e.status === 0) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  if (e && e.status === 404) {
    return 'Passkeys are not available right now.';
  }
  if (e && e.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }
  return 'The passkey could not be added. Please try again.';
}

export const ViewModel = FormViewModel.extend({
  define: {
    constraints: {
      value: {
        name: {
          presence: true,
          length: {
            maximum: 64,
            message: 'must be 64 characters or fewer',
          },
        },
      },
    },
    /**
     * @property {String} name
     * @parent i2web/components/form/add-passkey
     * @description Shown in the list of passkeys
     */
    name: {
      type: 'string',
      value() {
        return suggestedName();
      },
    },
    /**
     * @property {Function} onSave
     * @parent i2web/components/form/add-passkey
     * @description Called with the new passkey once it's saved
     */
    onSave: {},
  },
  saving: false,
  /**
   * @function addPasskey
   * @parent i2web/components/form/add-passkey
   * @description Creates a passkey with the browser and saves it on the platform
   */
  addPasskey(vm, el, ev) {
    ev.preventDefault();
    if (this.attr('saving')) {
      return;
    }

    if (this.formValidates()) {
      this.attr('saving', true);
      this.attr('formError', null);
      Passkey.register(this.attr('name')).then((passkey) => {
        this.attr('saving', false);
        if (this.attr('onSave')) {
          this.attr('onSave')(passkey);
        }
        this.closePanel();
      }).catch((e) => {
        this.attr('saving', false);
        const message = addPasskeyErrorMessage(e);
        if (message) {
          this.attr('formError', message);
        }
      });
    }
  },
});

export default FormComponent.extend({
  tag: 'arcus-form-add-passkey',
  viewModel: ViewModel,
  view,
});
