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
import view from './change-pin.stache';

import Person from 'i2web/models/person';

/**
 * @module {canMap} i2web/components/form/change-pin Change Pin
 * @parent i2web/components/form
 * @description Change Pin form
 */
export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/form/change-pin
     * @description Form validation constraints, keyed by field name
     */
    constraints: {
      value: {
        pinCode: {
          presence: true,
          format: {
            pattern: /^\d{4}$/i,
            message: 'must be 4 digits',
          },
          length: {
            minimum: 4,
            maximum: 4,
            message: 'must be 4 characters in length',
          },
        },
        confirmPinCode: {
          equality: {
            attribute: 'pinCode',
            message: '^Pin codes do not match',
          },
        },
      },
    },
    /**
     * @property {string} pincode
     * @parent i2web/components/form/change-pin
     * @description Pin code requires a length of 4
     */
    pinCode: {
      type: 'string',
    },
    /**
     * @property {String} confirmPinCode
     * @parent i2web/components/form/change-pin
     * @description confirmPinCode must match pinCode
     */
    confirmPinCode: {
      type: 'string',
    },
    /**
    * @property {string} description
    * @parent i2web/components/form/change-pin
    * @description Optionally provide an alternative description to the change pin form copy.
    */
    description: {
      value: 'PIN codes are used to disarm your alarm, unlock doors, and more. For Professional Monitoring customers, the Monitoring Station will need to verify your PIN code in the event of an alarm.',
    },
    /**
    * @property {string} header
    * @parent i2web/components/form/change-pin
    *
    * @description Optionally provide a large header to the change pin form; no default value.
    */
    header: {
      type: 'string',
    },
    /**
     * @property {htmlbool} hideCancelButton
     * @parent i2web/components/form/change-pin
     * @description Indicates if the cancel button should be hidden, for example, when we need
     * to force the user to add a pin.
     */
    hideCancelButton: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {function} onSave
     * @parent i2web/components/form/change-pin
     * @description Accept an onClose method as an optional parameter for the component;
     * if specified, invoke this method after the pin is successfully changed
     */
    onSave: {},
    /**
    * @property {Person} person
    * @parent i2web/components/form/change-pin
    * @description Person whose pin is being changed
    */
    person: {
      Type: Person,
    },
    /**
    * @property {string} placeId
    * @parent i2web/components/form/change-pin
    * @description The base id of the place at which pin is being changed
    */
    placeId: {
      type: 'string',
    },
    /**
     * @property {string} subheader
     * @parent i2web/components/form/change-pin
     * @description Optionally provide an alternative subheader to the change pin form. Defaults
     * to "Change PIN Code"
     */
    subheader: {
      value: 'Change PIN Code',
    },
  },
  /**
  * @property {Boolean} saving
  * @parent i2web/components/form/change-pin
  * @description whether the form is being saved
  */
  saving: false,
  /**
  * @function changePinCode
  * @parent i2web/components/form/change-pin
  *
  * @param vm
  * @param el
  * @param ev
  */
  changePinCode(vm, el, ev) {
    ev.preventDefault();

    if (!this.hasChanges()) {
      ev.stopPropagation();
      return;
    }

    if (this.formValidates()) {
      this.attr('saving', true);
      const request = this.attr('person').ChangePinV2(this.attr('placeId'), this.attr('pinCode'));
      request.then((result) => {
        this.attr('saving', false);
        if (result.success) {
          if (this.attr('onSave')) {
            this.attr('onSave')();
          } else {
            this.closePanel();
          }
        }
      }).catch((e) => {
        this.attr('saving', false);
        if (e.statusText === 'Unauthorized') {
          this.attr('formError', 'You are not currently authorized to change this PIN.');
        } else if (e.code === 'pin.notUniqueAtPlace') {
          this.attr('formError', 'Someone already has the PIN code that you entered. Please assign a unique PIN code for this person.');
        } else {
          this.attr('formError', e.message || e);
        }
      });
    }
  },
});

export default FormComponent.extend({
  tag: 'arcus-form-change-pin',
  viewModel: ViewModel,
  view,
});
