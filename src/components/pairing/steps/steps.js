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
import Component from 'can-component';
import CanMap from 'can-map';
import { first, last, trim, words } from 'lodash';
import { FormViewModel } from 'i2web/components/form/';
import getAppState from 'i2web/plugins/get-app-state';
import 'can-map-define';
import reduce from 'lodash/reduce';
import { getRedirectionURL } from 'i2web/helpers/global';
import view from './steps.stache';
import StepFormValidationConfig from 'config/pairing-step-form-validation';
import StepFormAttributesConfig from 'config/pairing-step-form-attributes';
import canObservation from 'can-observation';

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {Object} config
     * @parent i2web/components/pairing/steps
     * @description product pairing configuration from productcatalog or hardcoded record
     */
    config: { Type: CanMap },
    /**
     * @property {Function} onAbandonPairingSteps
     * @parent i2web/components/pairing/steps
     * @description the function called when the 'Back' button is pressed on the very first pairing step
     */
    onAbandonPairingSteps: { Type: Function },
    /**
     * @property {FormViewModel} formType
     * @parent i2web/components/pairing/steps
     * @description a dynamically created type extending FormViewModel, based on the field information provided in
     * the pairing config.
     */
    formType: {
      get() {
        const formDef = this.attr('config.form');
        if (formDef) {
          // create validation constraints for every key mentioned in the form definition
          const constraints = reduce(
            formDef,
            (ret, inputDef) => {
              ret[inputDef.name] = this.getInputConstraints(inputDef);
              return ret;
            },
            {},
          );

          // create property definitions with default values for every key mentioned in the form definition
          const valueDefinitions = reduce(
            formDef,
            (ret, inputDef) => {
              ret[inputDef.name] = { value: inputDef.value };
              return ret;
            },
            {},
          );

          // build can-define-map config object
          const define = Object.assign(
            { constraints: { value: constraints } },
            valueDefinitions,
          );

          return FormViewModel.extend({ define });
        }

        return null;
      },
    },
    /**
     * @property {CanMap} form
     * @parent i2web/components/pairing/steps
     * @description the model backing the form shown during the pairing steps
     */
    form: {
      Type: CanMap,
      get() {
        const formDefinition = this.attr('config.form');
        const FormType = this.attr('formType');

        if (formDefinition && FormType) {
          return new FormType();
        }

        return null;
      },
    },
    /**
     * @property {Object} formAttrs
     * @parent i2web/components/pairing/steps
     * @description Custom element attributes for particular form input elements. Represented as a
     * map of input name to attribute string.
     */
    formAttrs: {
      get() {
        // copy hardcoded attrs to new object so we don't modify the original
        const attrs = Object.assign({}, StepFormAttributesConfig);
        return attrs;
      },
    },
    /**
     * @property {Array<string>} formValues
     * @parent i2web/components/pairing/steps
     * @description Values from the pairing steps form. Provided for compatibility with prior implementation.
     * In the future form data should be accessed directly on the form model.
     */
    formValues: {
      get() {
        const form = this.attr('form');
        return form ? form.serializeData() : {};
      },
    },
    /**
     * @property {Number} currentStepIndex
     * @parent i2web/components/pairing/steps
     * @description current index of the step of the pairing config
     */
    currentStepIndex: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {Object} currentStep
     * @parent i2web/components/pairing/steps
     * @description current step definition of the pairing config
     */
    currentStep: {
      get() {
        return this.attr(`config.steps.${this.attr('currentStepIndex')}`);
      },
    },
    /**
     * @property {string} currentStepIllustrationURL
     * @parent i2web/components/pairing/steps
     * @description url of image to be shown in current paring step
     */
    currentStepIllustrationURL: {
      get() {
        const baseUrl = getAppState().attr('session.secureStaticResourceBaseUrl');
        const productId = this.attr('product.product:id');
        const stepId = this.attr('currentStep.order');
        return `${baseUrl}/o/products/${productId}/pair/pair${stepId}_large-ios-2x.png`;
      },
    },
    /**
     * @property {Boolean} currentStepHasLink
     * @parent i2web/components/pairing/steps
     * @description Whether the current step has link text or url
     */
    currentStepHasLink: {
      get() {
        const step = this.attr('currentStep');
        return step && step.attr('linkText') && step.attr('linkUrl');
      },
    },
    /**
     * @property {String} stepLinkUrl
     * @parent i2web/components/pairing/steps
     * @description The URL provided for a step. For hubs needs to be looked up
     * on the support site.
     */
    stepLinkUrl: {
      get() {
        const link = this.attr('currentStep.linkUrl');
        return (link && link.includes('http'))
          ? link
          : getRedirectionURL(link);
      },
    },
    /**
     * @property {boolean} isFinishedSteps
     * @parent i2web/components/pairing/steps
     * @description boolean to set to true once 'next' button clicked on last step
     */
    isFinishedSteps: { type: 'boolean' },
    /**
     * @property {boolean} isSubmitting
     * @parent i2web/components/pairing/steps
     * @description indicate when we're in the process of form submission so our validation
     * can change from per-field to entire form.
     */
    isSubmitting: { type: 'boolean' },
    /**
     * @property {boolean} isFormShown
     * @parent i2web/components/pairing/steps
     * @description indicating if this is the step where the form should be shown
     */
    isFormShown: {
      get() {
        const formDefinition = this.attr('config.form');
        const isLastStep = this.attr('currentStepIndex') === this.attr('config.steps.length') - 1;
        return isLastStep && formDefinition && formDefinition.length > 0;
      },
    },
    /**
     * @property {Boolean} onlyLastStep
     * @parent i2web/components/pairing/steps
     * @description Show only the last step in the pairing steps
     */
    onlyLastStep: {
      type: 'htmlbool',
      value: false,
      set(value) {
        if (value) {
          this.attr('currentStepIndex', this.attr('config.steps.length') - 1);
        }
        return value;
      },
    },
    /**
     * @property {boolean} isFormValid
     * @parent i2web/components/pairing/steps
     * @description indicate if the form view model is valid
     */
    isFormValid: {
      get() {
        const form = this.attr('form');
        const isSubmitting = this.attr('isSubmitting');
        const formKeys = this.config.form.attr().filter(f => f.type !== 'HIDDEN').map(f => f.name);
        const validKeys = formKeys.map((key) => {
          // do validation for a field if it has been visited or we tried to submit the form
          const doValidation = form.attr(`_visited.${key}`) || isSubmitting;
          let isValid = false;

          if (doValidation) {
            form.validateSingle(form.attr(key), key);
            canObservation.ignore(() => { // don't create observation on validation error map
              isValid = !form.hasValidationErrors([key]);
            })();
          }

          return isValid;
        });

        // && together the results of all the individual validations
        return validKeys.reduce((ret, val) => ret && val, true);
      },
    },
    /**
     * @property {Object} product
     * @parent i2web/components/pairing/steps
     * @description product model
     */
    product: { Type: CanMap },
    /**
     * @property {string} imageClass
     * @parent i2web/components/pairing/steps
     * @description Class to be applied to the container for an illustration
    */
    imageClass: {
      type: 'string',
      value: 'missing-illustration',
    },
    /**
     * @property {String} title
     * @parent i2web/components/pairing/steps/
     * @description The title to be shown on the pairing page
     */
    title: {
      get() {
        const vendor = this.attr('product.product:vendor');
        const short = this.attr('product.product:shortName');

        if (vendor && short) {
          const shortNameWords = words(short);

          const title = (last(words(vendor)) === first(shortNameWords))
            ? `${vendor} ${trim(short.replace(first(shortNameWords), ''))}`
            : `${vendor} ${short}`;

          return `${title} Pairing Steps`;
        }

        return 'Pairing Steps';
      },
    },
    /**
     * @property {String} title
     * @parent i2web/components/pairing/steps/
     * @description The link to the tutorial video for pairing the device
     */
    tutorialVideo: {
      get() {
        const tutorial = this.attr('config.video');
        if (!tutorial) return undefined;
        return (tutorial.includes('http'))
          ? tutorial
          : getRedirectionURL(tutorial);
      },
    },
  },
  /**
   * @property {function} goNext
   * @parent i2web/components/pairing/steps
   * @description increment step or set finished flag
   */
  goNext() {
    if (this.attr('isFormShown')) {
      // indicate we are doing a form submit while checking validation
      this.attr('isSubmitting', true);
      if (!this.attr('isFormValid')) { return; }
      this.attr('isSubmitting', false);
    }

    if (this.attr('currentStepIndex') < this.attr('config.steps.length') - 1) {
      this.attr('currentStepIndex', ++this.currentStepIndex);
    } else {
      this.attr('isFinishedSteps', true);
    }
  },
  /**
   * @property {function} goPrevious
   * @parent i2web/components/pairing/steps
   * @description return to previous step or go back through browser history if at first step;
   * if onAbandonPairingSteps is defined, invoke this instead when pressing back at first step
   */
  goPrevious() {
    if (this.currentStepIndex === 0) {
      if (this.attr('onAbandonPairingSteps')) {
        this.attr('onAbandonPairingSteps')();
      } else {
        window.history.back();
      }
    } else {
      this.attr('currentStepIndex', --this.currentStepIndex);
    }
  },
  /**
   * @property {function} imageFound
   * @parent i2web/components/pairing/steps
   * @description Callback for when the iamge is fully loaded
   */
  imageFound() {
    this.attr('imageClass', 'illustration');
  },
  /**
   * @property {function} imageNotFound
   * @parent i2web/components/pairing/steps
   * @description Error handler for the image cannot be loaded
   */
  imageNotFound() {
    this.attr('imageClass', 'missing-illustration');
  },
  /**
   * @property {function} getInputConstraints
   * @parent i2web/components/pairing/steps
   * @description return the validation constraints of a particular form input
   */
  getInputConstraints(input) {
    const hardcodedConsts = StepFormValidationConfig[input.name];
    const platformConsts = (input.required || input.maxlen || input.minlen) ? {
      presence: input.required,
      length: {
        maximum: input.maxlen,
        minimum: input.minlen,
        tooShort: 'is required',
        tooLong: 'is required',
      },
    } : null;
    return hardcodedConsts || platformConsts || {};
  },
});

export default Component.extend({
  tag: 'arcus-pairing-steps',
  viewModel: ViewModel,
  view,
  events: {
    '{viewModel} currentStepIndex': function onStepChange() {
      $('html, body').scrollTop(0);
    },
    '{viewModel} isFormShown': function isFormShown() {
      setTimeout(() => {
        const input = document.querySelector('input[type=text]');
        if (input) { input.focus(); }
      }, 0);
    },
    '{document.body} keyup': function handleEnterKey(el, ev) {
      if (ev.keyCode === 13 || ev.key === 'Enter') { // if enter key
        this.viewModel.goNext();
      }
    },
    'input blur': function trackInputVisitation(el) {
      const key = el.getAttribute('data-key');

      if (key) {
        this.viewModel.attr(`form._visited.${key}`, true);
      }
    },
  },
});
