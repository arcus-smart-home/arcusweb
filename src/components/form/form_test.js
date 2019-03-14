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
import F from 'funcunit';
import assert from 'chai';

import CanMap from 'can-map';
import CanList from 'can-list';
import 'can-map-define';
import 'can-stache-bindings';
import 'can-stache-converters';
import stache from 'can-stache';
import 'semantic-ui-dropdown-canjs';

import fixture from 'can-fixture/';
import loginAndRender from 'i2web/test/util/loginAndRender';
import { FormComponent, FormViewModel, FormEvents } from './form';
import canViewModel from 'can-view-model';

import 'i2web/components/spinner/';


const viewModel = FormViewModel.extend({
  define: {
    constraints: {
      get() {
        return new CanMap({
          // required field tests
          textInputRequired: {
            presence: true,
          },
          textInputConditionallyRequired: {
            presence: this.attr('isTextInputConditionallyRequired'),
          },
          textAreaRequired: {
            presence: true,
          },
          selectInputRequired: {
            presence: true,
          },
          'nestedObject.namespace:prop': {
            presence: true,
          },
          // equality/password
          'nestedObject.equality1': {},
          'nestedObject.equality2': {
            equality: {
              attribute: 'nestedObject.equality1',
            },
          },
          // custom validators
          creditCardNumber: {
            cardNumber: true,
          },
          password: {
            length: {
              minimum: 8,
            },
            oneLetterOneNumber: true,
            noSpaces: true,
          },
        });
      },
    },
    textInputRequired: {
      value: '',
    },
    textInputConditionallyRequired: {
      value: '',
    },
    isTextInputConditionallyRequired: {
      value: false,
    },
    textAreaRequired: {
      value: '',
    },
    selectInputRequired: {
      value: '',
    },
    nestedObject: {
      value: {
        'namespace:prop': '',
        equality1: '',
        equality2: '',
      },
    },
    password: {
      value: '',
    },
    creditCardNumber: {
      value: '',
    },
    spinner: {
      value: 10,
    },
    checkbox: {
      value: false,
    },
    radio: {
      value: undefined,
    },
  },
});

let cleanupAfterRender;

FormComponent.extend({
  tag: 'arcus-validation-base-test-component',
  viewModel,
  view: stache(`
    {{textInput("textInputRequired", "Text Input Required")}}
    {{textInput("nestedObject.namespace:prop", "Nested Object Property Required")}}
    {{textInput("textInputConditionallyRequired", "Text Input Conditionally Required")}}
    <!--<select id="foo" {($value)}="foo" class="dropdown search" semantic-dropdown full-text-search="exact">
      <option value="">State</option>
      <option value="AL">Alabama</option>
      <option value="AK">Alaska</option>
      <option value="AZ">Arizona</option>
      <option value="AR">Arkansas</option>
      <option value="CA">California</option>
      <option value="CO">Colorado</option>
      <option value="CT">Connecticut</option>
      <option value="DE">Delaware</option>
      <option value="DC">District Of Columbia</option>
    </select>-->
    {{textArea("textAreaRequired", "Text Area")}}
    <h2>Equality:</h2>
    {{textInput("nestedObject.equality1", "Input")}}
    {{textInput("nestedObject.equality2", "Confirm Input")}}
    <h2>Custom Validators:</h2>
    {{textInput("password", "Password", type="password")}}
    {{textInput("creditCardNumber", "Credit Card Number", attributes="key-mask='9999-9999-9999-9999'")}}
    <h2>Other elements that should trigger hasChanges:</h2>
    <arcus-spinner {(value)}="spinner" min="0" max="100" step="10" />
    <div class="radio-wrapper">
      <label for="checkbox">Checkbox</label>
      <input class="radio-checkbox" type="checkbox" id="checkbox" {($checked)}="checkbox" />
      <div class="check"></div>
    </div>
    <ul>
      <li class="radio-wrapper">
        <input type="radio" {($checked)}="equal(~radio, 'yes')" id="yes" />
        <label for="yes">Radio 1 (yes)</label>
        <div class="check"></div>
      </li>
      <li class="radio-wrapper">
        <input type="radio" {($checked)}="equal(~radio, 'no')" id="no" />
        <label for="no">Radio 2 (no)</label>
        <div class="check"></div>
      </li>
    </ul>
  `),
  events: FormEvents,
});

let vm = {};
describe('i2web/components/form', function form() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-validation-base-test-component />',
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      vm = canViewModel($('arcus-validation-base-test-component')[0]);
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  afterEach(function afterEach(done) {
    cleanupAfterRender().then(() => {
      fixture.reset();
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  describe('initialization', () => {
    it('all fields flagged as not visited', () => {
      assert.lengthOf(CanMap.keys(vm.attr('_visited')), 0, 'no fields are flagged as visited');
    });
    it('all fields flagged as not changed', () => {
      assert.lengthOf(CanMap.keys(vm.attr('_changed')), 0, 'no fields are flagged as _changed');
    });
    it('form should not indicate changes', () => {
      assert.isNotOk(vm.attr('_anyFieldHasChanges'), '_anyFieldHasChanges is false by default');
      assert.isNotOk(vm.hasChanges(), 'hasChanges is false by default');
    });
    it('shall not have any validation errors', () => {
      assert.lengthOf(CanMap.keys(vm.attr('_validationErrors')), 0, 'there are no validation errors');
    });
  });

  describe('ViewModel methods', () => {
    it('_requiredFields', () => {
      const requiredFields = [
        'textInputRequired',
        'textAreaRequired',
        'selectInputRequired',
        'nestedObject.namespace:prop',
      ];
      assert.deepEqual(vm.attr('_requiredFields').sort().attr(), requiredFields.sort(), '_requiredFields match');
      vm.attr('isTextInputConditionallyRequired', true);
      requiredFields.push('textInputConditionallyRequired');
      assert.deepEqual(vm.attr('_requiredFields').sort().attr(), requiredFields.sort(), '_requiredFields match and is computed');
    });
    it('_equalityRelations', () => {
      const equalityRelations = {
        'nestedObject.equality1': ['nestedObject.equality2'],
      };
      assert.deepEqual(vm.attr('_equalityRelations').attr(), equalityRelations, '_equalityRelations match');
      vm.attr('constraints').attr('equality3', {
        equality: {
          attribute: 'nestedObject.equality1',
        },
      });
      equalityRelations['nestedObject.equality1'].push('equality3');
      assert.deepEqual(vm.attr('_equalityRelations').attr(), equalityRelations, '_equalityRelations match and is computed');
    });
    it('_constrainedFields', () => {
      const contstrainedFields = [
        'textInputRequired',
        'textInputConditionallyRequired',
        'textAreaRequired',
        'selectInputRequired',
        'nestedObject.namespace:prop',
        'nestedObject.equality1',
        'nestedObject.equality2',
        'password',
        'creditCardNumber',
      ];
      assert.deepEqual(vm.attr('_constrainedFields').sort(), contstrainedFields.sort(), '_constrainedFields match');
      vm.attr('constraints').attr({
        newField: {
          presence: true,
        },
      }, false);
      contstrainedFields.push('newField');
      assert.deepEqual(vm.attr('_constrainedFields').sort(), contstrainedFields.sort(), '_constrainedFields match and is computed');
    });
    it('_convertFieldNameToDotNotation', () => {
      assert.equal(vm._convertFieldNameToDotNotation('prop'), 'prop');
      assert.equal(vm._convertFieldNameToDotNotation(`['prop']`), 'prop');
      assert.equal(vm._convertFieldNameToDotNotation(`nested['prop']`), 'nested.prop');
      assert.equal(vm._convertFieldNameToDotNotation(`nested['prop1']['prop2']`), 'nested.prop1.prop2');

      // non-string props
      assert.equal(vm._convertFieldNameToDotNotation('0'), '0');
      assert.equal(vm._convertFieldNameToDotNotation(`[0]`), '0');
      assert.equal(vm._convertFieldNameToDotNotation(`nested[0]`), 'nested.0');
      assert.equal(vm._convertFieldNameToDotNotation(`nested['prop1'][0]`), 'nested.prop1.0');
    });
    it.skip('formValidates', () => {
      // not tested, because it's really just a combination of the validate and hasValidationErrors tests
    });
    it('hasConstraints', () => {
      assert.isOk(vm.hasConstraints('textInputRequired'), 'identifies constraints');
      assert.isNotOk(vm.hasConstraints('foo'), 'doesn\'t misidenify non-constraints');
      assert.isNotOk(vm.hasConstraints(), 'fails with no constraint passed');
    });
    it('validate', () => {
      vm.resetErrors();
      vm.attr('constraints').attr({}, true);
      // no validation errors if no constraints
      vm.attr('foo', '');
      vm.attr('bar', '');
      vm.validate();
      assert.isNotOk(vm.hasValidationErrors(), 'no errors if no constraints');
      vm.validate(['foo', 'bar']);
      assert.isNotOk(vm.hasValidationErrors(), 'no errors for specific fields if no constraints');
      // validation errors if there are constraints for attr
      vm.attr('constraints').attr({
        foo: { presence: true },
        bar: { presence: true },
      }, true);
      vm.attr('foo', '123');
      vm.attr('bar', '123');
      vm.validate();
      assert.isNotOk(vm.hasValidationErrors(), 'no errors if are constraints that are met');
      vm.validate(['foo', 'bar']);
      assert.isNotOk(vm.hasValidationErrors(), 'no errors for specific fields whose constraints are met');
      vm.attr('foo', '');
      vm.validate();
      assert.isOk(vm.hasValidationErrors(), 'errors if are constraints that are not met');
      vm.validate(['foo', 'bar']);
      assert.isOk(vm.hasValidationErrors(), 'errors for specific fields whose constraints are not met');
      // test canList
      vm.attr('foo', '123');
      vm.attr('bar', '123');
      vm.validate();
      vm.validate(new CanList(['foo', 'bar']));
      assert.isNotOk(vm.hasValidationErrors(), 'no errors for specific fields whose constraints are met');
      vm.attr('foo', '');
      vm.validate(new CanList(['foo', 'bar']));
      assert.isOk(vm.hasValidationErrors(), 'errors for specific fields whose constraints are not met');
    });
    it('validateSingle', () => {
      vm.resetErrors();
      vm.attr('constraints', {});
      // no validation errors if no attr
      vm.validateSingle('');
      assert.isNotOk(vm.hasValidationErrors(), 'no errors if no attr');
      // no validation errors if no constraints for attr
      vm.validateSingle('', 'foo');
      assert.isNotOk(vm.hasValidationErrors(), 'no errors if no constraints for attr');
      // errors if there are constraints for attr
      vm.attr('constraints').attr({ foo: { presence: true } }, true);
      vm.validateSingle('', 'foo');
      assert.isOk(vm.hasValidationErrors(), 'errors if there are non-matched constraints for attr');
    });
    it('hasChanges', () => {
      assert.isNotOk(vm.hasChanges(), 'works with no changes');
      assert.isNotOk(vm.hasChanges(['a']), 'no false positives with one field');
      vm.attr('_anyFieldHasChanges', true);
      vm.attr('_changed').attr('a', true);
      assert.isOk(vm.hasChanges(), 'works with one change');
      assert.isOk(vm.hasChanges(['a']), 'works with one change by field');
      assert.isNotOk(vm.hasChanges(['b']), 'no false positives with one field');
      vm.attr('_changed').attr('b', true);
      assert.isOk(vm.hasChanges(), 'works with multiple changes');
      assert.isOk(vm.hasChanges(['a']), 'works with one change by field');
      assert.isOk(vm.hasChanges(['a', 'b']), 'works witih multiple changes by field');
      vm.attr('_changed').attr('a', false);
      assert.isNotOk(vm.hasChanges(['a']), 'works with one change by field when false');
      assert.isOk(vm.hasChanges(['b']), 'works with changed field when another one is false');
      // test canList
      assert.isNotOk(vm.hasChanges(new CanList(['a'])), 'works with one change by field when false');
      assert.isOk(vm.hasChanges(new CanList(['b'])), 'works with changed field when another one is false');
    });
    it('hasValidationErrors', () => {
      assert.isNotOk(vm.hasValidationErrors(), 'works with no errors');
      assert.isNotOk(vm.hasValidationErrors(['a']), 'no false positives with one field');
      vm.attr('_validationErrors').attr('a', ['errorMessage']);
      assert.isOk(vm.hasValidationErrors(), 'works with one error');
      assert.isOk(vm.hasValidationErrors(['a']), 'works with one error by field');
      assert.isNotOk(vm.hasValidationErrors(['b']), 'no false positives with one field');
      vm.attr('_validationErrors').attr('b', ['errorMessage']);
      assert.isOk(vm.hasValidationErrors(), 'works with multiple errors');
      assert.isOk(vm.hasValidationErrors(['a']), 'works with one error by field');
      assert.isOk(vm.hasValidationErrors(['a', 'b']), 'works witih multiple errors by field');
      // test CanList
      assert.isOk(vm.hasValidationErrors(new CanList(['a'])), 'works with one error by field');
      assert.isOk(vm.hasValidationErrors(new CanList(['a', 'b'])), 'works witih multiple errors by field');
    });
    it('resetForm', () => {
      vm.attr('formError', 'error message');
      vm.attr('_validationErrors', {
        a: ['errorMessage'],
      });
      vm.attr('_visited', {
        a: true,
        b: true,
        c: false,
      });
      vm.attr('_changed', {
        a: true,
        b: true,
        c: false,
      });
      vm.resetForm();
      assert.isNotOk(vm.attr('formError'), 'form error is empty');
      assert.deepEqual(vm.attr('_validationErrors').attr(), {}, '_validationErrors is empty');
      assert.deepEqual(vm.attr('_visited').attr(), { a: false, b: false, c: false }, '_visited is reset');
      assert.deepEqual(vm.attr('_changed').attr(), { a: false, b: false, c: false }, '_changed is reset');
    });
    it('resetErrors', () => {
      vm.attr('formError', 'error message');
      vm.attr('_validationErrors', {
        foo: ['errorMessage'],
      });
      vm.resetErrors();
      assert.isNotOk(vm.attr('formError'), 'form error is empty');
      assert.deepEqual(vm.attr('_validationErrors').attr(), {}, '_validationErrors is empty');
    });
    it('resetVisited', () => {
      vm.attr('_visited', {
        a: true,
        b: true,
        c: false,
      });
      vm.resetVisited();
      assert.deepEqual(vm.attr('_visited').attr(), { a: false, b: false, c: false }, '_visited is reset');
    });
    it('resetChanged', () => {
      vm.attr('_changed', {
        a: true,
        b: true,
        c: false,
      });
      vm.resetChanged();
      assert.deepEqual(vm.attr('_changed').attr(), { a: false, b: false, c: false }, '_changed is reset');
    });
  });

  describe('rendering', () => {
    it('shall be rendered on the page', () => {
      assert.lengthOf($('arcus-validation-base-test-component'), 1, 'there is one component rendered');
    });
    it('shall render 6 text inputs', () => {
      assert.lengthOf($('arcus-validation-base-test-component input[type="text"]'), 6, 'there are six inputs rendered');
    });
    it('shall render 1 password input', () => {
      assert.lengthOf($('arcus-validation-base-test-component input[type="password"]'), 1, 'there is one password input rendered');
    });
    it('shall render 2 radio inputs', () => {
      assert.lengthOf($('arcus-validation-base-test-component input[type="radio"]'), 2, 'there are two radio inputs rendered');
    });
    it('shall render 1 checkbox', () => {
      assert.lengthOf($('arcus-validation-base-test-component input[type="checkbox"]'), 1, 'there is one checkbox rendered');
    });
    it.skip('shall render 1 selects', () => {
      assert.lengthOf($('arcus-validation-base-test-component select'), 1, 'there is one select rendered');
    });
    it('shall render 1 text area', () => {
      assert.lengthOf($('arcus-validation-base-test-component textarea'), 1, 'there is one textarea rendered');
    });

    it('shall have no errors by default', () => {
      assert.lengthOf($('arcus-validation-base-test-component p.error'), 0, 'there are no error messages');
      assert.isNotOk($('arcus-validation-base-test-component div.input-wrapper').hasClass('is-invalid'), 'should not have is-invalid class');
    });
  });

  describe('interactions', () => {
    it('input[type="text/password"]', (done) => {
      const field = 'textInputRequired';
      const selector = `.${field}`;
      vm.attr('constraints').attr({ [field]: { presence: true } }, true);
      F(selector).type('someText', () => {
        assert.isOk(vm.attr('_visited').attr(field), 'field is marked as visited');
        assert.isOk(vm.attr('_changed').attr(field), 'field is marked as changed');
        assert.isOk(vm.hasChanges(), 'form is marked as having changes');
        F('body').click(() => {
          assert.isNotOk(vm.hasValidationErrors([field]), 'field is validated with no errors');
          F(selector).type('', () => {
            F('body').click(() => {
              assert.isOk(vm.hasValidationErrors([field]), 'field is validated with errors');
              assert.lengthOf($('arcus-validation-base-test-component p.error'), 1, 'there is an error messages');
              assert.isOk($('arcus-validation-base-test-component div.input-wrapper').hasClass('is-invalid'), 'should have is-invalid class');
              done();
            });
          });
        });
      });
    });
    it.skip('select', () => {
      // add later once select bug is fixed
    });
    it('textearea', (done) => {
      const field = 'textAreaRequired';
      const selector = `.${field}`;
      vm.attr('constraints').attr({ [field]: { presence: true } }, true);
      F(selector).type('someText', () => {
        assert.isOk(vm.attr('_visited').attr(field), 'field is marked as visited');
        assert.isOk(vm.attr('_changed').attr(field), 'field is marked as changed');
        assert.isOk(vm.hasChanges(), 'form is marked as having changes');
        F('body').click(() => {
          assert.isNotOk(vm.hasValidationErrors([field]), 'field is validated');
          F(selector).type('', () => {
            F('body').click(() => {
              assert.isOk(vm.hasValidationErrors([field]), 'field is validated');
              assert.lengthOf($('arcus-validation-base-test-component p.error'), 1, 'there is an error messages');
              assert.isOk($('arcus-validation-base-test-component div.input-wrapper').hasClass('is-invalid'), 'should have is-invalid class');
              done();
            });
          });
        });
      });
    });
    it.skip('arcus-spinner', (done) => {
      // TODO debug why this doesn't work in Phantom
      vm.attr('constraints').attr({ spinner: { presence: true } }, true);
      F('arcus-spinner .down').click(() => {
        assert.isNotOk(vm.hasValidationErrors(['spinner']), 'spinner is validated (kind of - no errors displayed though)');
        assert.isOk(vm.attr('_visited').attr('spinner'), 'spinner is marked as visited');
        assert.isOk(vm.attr('_changed').attr('spinner'), 'spin is marked as changed');
        assert.isOk(vm.hasChanges(), 'form is marked as having changes');
        done();
      });
    });
    it('input[type="checkbox"]', (done) => {
      vm.attr('constraints').attr({ checkbox: { presence: true } }, true);
      F('#checkbox').click(() => {
        assert.isNotOk(vm.hasValidationErrors(['checkbox']), 'checkbox is NOT validated (not supported)');
        assert.isNotOk(vm.attr('_visited').attr('checkbox'), 'checkbox is NOT marked as visited (not supported)');
        assert.isNotOk(vm.attr('_changed').attr('checkbox'), 'checkbox is NOT marked as changed');
        assert.isOk(vm.hasChanges(), 'form is marked as having changes');
        done();
      });
    });
    it('input[type="radio"]', (done) => {
      vm.attr('constraints').attr({ radio: { presence: true } }, true);
      F('#yes').click(() => {
        assert.isNotOk(vm.hasValidationErrors(['radio']), 'radio is NOT validated (not supported)');
        assert.isNotOk(vm.attr('_visited').attr('radio'), 'radio is NOT marked as visited (not supported)');
        assert.isNotOk(vm.attr('_changed').attr('radio'), 'radio is NOT marked as changed (not supported)');
        assert.isOk(vm.hasChanges(), 'form is marked as having changes');
        done();
      });
    });
  });

  describe('validation rules', () => {
    const validPassword = 'abcd1234';
    const fieldName = 'foo';
    beforeEach(() => {
      vm.resetForm();
    });

    it('validates presence', () => {
      vm.attr('constraints').attr({ foo: { presence: true } }, true);
      vm.validateSingle(validPassword, fieldName);
      assert.isNotOk(vm.hasValidationErrors([fieldName]), 'field has no errors with valid input');
      vm.validateSingle('', fieldName);
      assert.isOk(vm.hasValidationErrors([fieldName]), 'field has an error with empty input');
    });

    it('validates length', function validateLength() {
      vm.attr('constraints').attr({ foo: { length: { minimum: 6 } } }, true);
      vm.validateSingle(validPassword, fieldName);
      assert.isNotOk(vm.hasValidationErrors([fieldName]), 'field has no errors with valid input');
      vm.validateSingle('123', fieldName);
      assert.isOk(vm.hasValidationErrors([fieldName]), 'field has an error with short input');
      vm.validateSingle('', fieldName);
      assert.isOk(vm.hasValidationErrors([fieldName]), 'field has an error with no input');
    });

    it('validates oneLetterOneNumber', function validateOneLetterOneNumber() {
      vm.attr('constraints').attr({ foo: { oneLetterOneNumber: true } }, true);
      vm.validateSingle(validPassword, fieldName);
      assert.isNotOk(vm.hasValidationErrors([fieldName]), 'field has no errors with valid input');
      vm.validateSingle('123', fieldName);
      assert.isOk(vm.hasValidationErrors([fieldName]), 'field has an error with input not containing both a number and letter');
      // this should validate, since empty strings should only be invalid if there is a length or presence constraint as well
      vm.validateSingle('', fieldName);
      assert.isNotOk(vm.hasValidationErrors([fieldName]), 'field has no error with no input');
    });

    it('validates noSpaces', function validateNoSpaces() {
      vm.attr('constraints').attr({ foo: { noSpaces: true } }, true);
      vm.validateSingle(validPassword, fieldName);
      assert.isNotOk(vm.hasValidationErrors([fieldName]), 'field has no errors with valid input');
      vm.validateSingle('bad input', fieldName);
      assert.isOk(vm.hasValidationErrors([fieldName]), 'field has an error with input containing spaces');
      // this should validate, since empty strings should only be invalid if there is a length or presence constraint as well
      vm.validateSingle('', fieldName);
      assert.isNotOk(vm.hasValidationErrors([fieldName]), 'field has no error with no input');
    });

    it('validates exclusion', function validateExclusion() {
      vm.attr('constraints').attr({ foo: { exclusion: { within: ['bar'] } } }, true);
      vm.validateSingle(validPassword, fieldName);
      assert.isNotOk(vm.hasValidationErrors([fieldName]), 'field has no errors with valid input');
      vm.validateSingle('bar', fieldName);
      assert.isOk(vm.hasValidationErrors([fieldName]), 'field has an error with input that should be excluded');
      // this should validate, since empty strings should only be invalid if there is a length or presence constraint as well
      vm.validateSingle('', fieldName);
      assert.isNotOk(vm.hasValidationErrors([fieldName]), 'field has no error with no input');
    });

    it('validates equality', function validateEquality() {
      vm.attr('constraints').attr({ bar: { equality: { attribute: fieldName } } }, true);
      // foo and bar are empty -> no error
      vm.attr(fieldName, '');
      vm.validateSingle('', 'bar');
      assert.isNotOk(vm.hasValidationErrors(['bar']), 'both fields empty');
      // foo is set, bar not visited -> no error
      vm.attr(fieldName, validPassword);
      vm.validateSingle(validPassword, fieldName);
      assert.isNotOk(vm.hasValidationErrors(['bar']), 'foo set, bar not visited');
      // foo is set, bar visited -> error
      vm.attr('_visited').attr('bar', true);
      vm.validateSingle(validPassword, fieldName);
      assert.isOk(vm.hasValidationErrors(['bar']), 'foo set, bar visited');
      // bar is set, foo is empty -> error
      vm.attr(fieldName, '');
      vm.validateSingle(validPassword, 'bar');
      assert.isOk(vm.hasValidationErrors(['bar']), 'bar set, foo is empty');
      // bar is set, foo === bar -> no error
      vm.attr(fieldName, validPassword);
      vm.validateSingle(validPassword, 'bar');
      assert.isNotOk(vm.hasValidationErrors(['bar']), 'bar set, foo === bar');
    });
  });
});
