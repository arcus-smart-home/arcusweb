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
import view from './contact-info.stache';
import Person from 'i2web/models/person';
import Errors from 'i2web/plugins/errors';

/**
 * @module {canMap} i2web/components/form/contact-info Reset Password
 * @parent i2web/components/form
 * @description Reset Password form
 */
export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/form/contact-info
     *
     * @description Form validation constraints
     */
    constraints: {
      value: {
        'formPerson.person:firstName': {
          presence: true,
        },
        'formPerson.person:lastName': {
          presence: true,
        },
        'formPerson.person:email': {
          presence: true,
          email: {
            message: 'is invalid',
          },
        },
        'formPerson.person:mobileNumber': {
          presence: true,
          phoneNumber: true,
        },
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/form/contact-info
     */
    person: {
      Type: Person,
      set(person) {
        if (person) {
          this.attr('formPerson', person.clone());
        }
        return person;
      },
    },
    /**
     * @property {Person} formPerson
     * @parent i2web/pages/form/contact-info
     *
     * A clone of the passed in person model to be used in the view,
     * that way we don't polute the model if we don't save.
     */
    formPerson: {
      Type: Person,
    },
  },
  /**
  * @property {Boolean} saving
  * @parent i2web/components/form/contact-info
  * whether the form is being saved
  */
  saving: false,
  /**
  * @function save
  * @parent i2web/components/form/contact-info
  *
  * @param vm
  * @param el
  * @param ev
  */
  save(vm, el, ev) {
    ev.preventDefault();
    if (!this.hasChanges()) {
      ev.stopPropagation();
      return;
    }

    if (this.formValidates()) {
      this.attr('saving', true);
      this.attr('formPerson').save().then(() => {
        this.attr('saving', false);
        this.closePanel();
      })
      .catch((e) => {
        this.attr('saving', false);
        this.attr('formError', 'Unable to save your contact information. Please try again later.');

        Errors.log(e);
      });
    }
  },
});

export default FormComponent.extend({
  tag: 'arcus-form-contact-info',
  viewModel: ViewModel,
  view,
});
