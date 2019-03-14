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
import _truncate from 'lodash/truncate';
import 'can-map-define';
import { FormComponent, FormViewModel, FormEvents } from 'i2web/components/form/';
import Base from 'i2web/models/base';
import Notifications from 'i2web/plugins/notifications';
import view from './confirm-field.stache';
import Errors from 'i2web/plugins/errors';

/**
 * @module {canMap} i2web/components/form/confirm-field Confirm Field
 * @parent i2web/components/form
 * @description Edits and saves a single field on a single model
 */
export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {Base} model
     * @parent i2web/components/form/confirm-field
     * Model to edit
     */
    model: {
      Type: Base,
    },
    /**
     * @property {string} field
     * @parent i2web/components/form/confirm-field
     * Field on the model we wish to edit
     */
    field: {
      type: 'string',
    },
    /**
     * @property {string} fieldDescription
     * @parent i2web/components/form/confirm-field
     * Field on the model we wish to edit
     */
    fieldDescription: {
      type: 'string',
      value: 'property',
    },
    /**
     * @property {string} property
     * @parent i2web/components/form/confirm-field
     * Virtual property representing the field on the model we wish to edit.
     */
    property: {
      type: 'string',
      get() {
        const model = this.attr('model');
        const field = this.attr('field');

        return model.attr(field);
      },
      set(val) {
        const model = this.attr('model');
        const field = this.attr('field');

        model.attr(field, val);

        return val;
      },
    },
    /**
     * @property {string} newProperty
     * @parent i2web/components/form/confirm-field
     * New value for the property
     */
    newProperty: {
      type: 'string',
    },
    /**
     * @property {boolean} showField
     * @parent i2web/components/form/confirm-field
     * Whether the field is shown.
     */
    showField: {
      type: 'boolean',
      value: false,
      set(val) {
        if (val) {
          this.attr('newProperty', this.attr('property'));
        }

        return val;
      },
    },
    /**
     * @property {string} placeholder
     * @parent i2web/components/form/confirm-field
     * Optional placeholder text to put on the field
     */
    placeholder: {
      value: '',
    },
    /**
     * @property {string} attributes
     * @parent i2web/components/form/confirm-field
     * Optional attributes to add to the field.
     */
    attributes: {
      value: '',
    },
    /**
     * @property {boolean} notifyOnSave
     * @parent i2web/components/form/confirm-field
     * Whether to send a notification on save or not.
     */
    notifyOnSave: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Function} saveFunction
     * @parent i2web/components/form/confirm-field
     * The function used to persist the name change
     */
    saveFunction: {
      type: '*',
      get(lastSetVal) {
        if (lastSetVal) return lastSetVal(this.attr('model'));
        return this.attr('model').save();
      },
    },
  },
  /**
   * @property {boolean} saving
   * @parent i2web/components/form/confirm-field
   * whether the form is being saved
   */
  saving: false,
  /**
   * @function save
   * @parent i2web/components/form/confirm-field
   */
  save(vm, el, ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    if (!this.hasChanges()) {
      el.blur();
      return;
    }

    const newProperty = this.attr('newProperty').trim();
    if (newProperty !== '' && newProperty !== this.attr('property')) {
      this.attr('saving', true);

      // ITWO-11889 - trigger blur before the value change, as otherwise a rename could remove the element from the DOM
      const input = el.querySelector('input');
      if (input) input.blur();

      this.attr('model').attr(this.attr('field'), newProperty);
      this.attr('saveFunction').then(() => {
        const fieldDescription = this.attr('fieldDescription').toLowerCase();
        // We need to manually set changed.newProperty to false otherwise it will assume that
        // the field has new values next time we attempt to save, even if we don't
        this.attr('_changed').attr('newProperty', false);
        if (this.attr('notifyOnSave')) {
          Notifications.success(`Changed ${fieldDescription} to "${_truncate(newProperty, { length: 51 })}."`, 'icon-app-check');
        }
      })
      .catch((e) => {
        if (this.attr('notifyOnSave')) {
          const fieldDescription = this.attr('fieldDescription').toLowerCase();
          let notifyText = this.attr('notificationText');
          if (e || !notifyText) {
            notifyText = `Unable to save ${fieldDescription}. Please try again later.`;
          }
          Notifications.error(notifyText);
        }
        Errors.log(e);
      })
      .then(() => {
        this.attr('saving', false);
      })
      .catch((e) => {
        this.attr('saving', false);
        Errors.log(e);
      });
    } else {
      this.cancel(el);
    }
  },
  /**
   * @function cancel
   * @parent i2web/components/form/confirm-field
   */
  cancel(el) {
    const model = this.attr('model');
    const field = this.attr('field');

    this.attr('property', model.attr(field));
    el.blur();
  },
});

const events = Object.assign({}, FormEvents, {
  inserted() {
    this.viewModel.attr('showField', false);
  },
  'h3 click': function toggleField() {
    this.viewModel.attr('showField', true);
    $(this.element).find('input').focus();
  },
  'input keyup': function onKeyUp(el, ev) {
    if (ev.keyCode === 27) {
      this._escapePressed = true;
      this.viewModel.cancel(el);
    }
  },
  'input blur': function onBlur(el, ev) {
    FormEvents['input blur'].apply(this, arguments);

    // let other blur events run before unrendering input
    setTimeout(() => {
      if (!this._escapePressed) {
        this.viewModel.save(this.viewModel, el, ev);
      } else {
        this._escapePressed = false;
      }
      this.viewModel.attr('showField', false);
    });
  },
});

export default FormComponent.extend({
  tag: 'arcus-form-confirm-field',
  viewModel: ViewModel,
  view,
  events,
});
