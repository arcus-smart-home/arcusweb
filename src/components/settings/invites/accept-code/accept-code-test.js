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

import assert from 'chai';
import canViewModel from 'can-view-model';
import F from 'funcunit';
import stache from 'can-stache';
import './accept-code';

describe('i2web/components/settings/invites/accept-code', function acceptCode() {
  const getContainer = () => document.querySelector('#test-area');
  const template = stache('<arcus-settings-invites-accept-code />');

  const codeInputSel = '.model__code';
  const emailInputSel = '.model__email';

  beforeEach(function beforeEach(done) {
    const el = getContainer();
    el.appendChild(template({}));
    F('arcus-settings-invites-accept-code').exists(() => done());
  });

  afterEach(function afterEach() {
    const el = getContainer();
    while (el.firstChild) el.removeChild(el.firstChild);
  });

  it('renders form to enter invitation code and email', function enterInviteCode() {
    assert.isNotNull(
      document.querySelector(codeInputSel),
      'should render input to collect invitation code',
    );
    assert.isNotNull(
      document.querySelector(emailInputSel),
      'should render input to collect invitation email',
    );
  });

  it('focus out of empty inputs trigger validations', function presenceValidations(done) {
    F(codeInputSel).click();
    F('body').click();
    F(`.is-invalid ${codeInputSel}`).exists('input should be in invalid state');

    F(emailInputSel).click();
    F('body').click();
    F(`.is-invalid ${emailInputSel}`).exists('input should be in invalid state');

    F(() => done());
  });

  it('email field should be validated', function validEmail(done) {
    F(emailInputSel).type('foo@bar');
    F('body').click();
    F(`.is-invalid ${emailInputSel}`).exists('input should be in invalid state');

    F(emailInputSel).type('').type('foo@bar.com');
    F('body').click();
    F(`.is-invalid ${emailInputSel}`).missing('input should not be invalid');

    F(() => done());
  });

  xit('shows error message when code / email is not found', function notFound(done) {
    const vm = canViewModel('arcus-settings-invites-accept-code');

    vm.attr('acceptInvitation', function acceptInvitation() {
      const error = new Error('Uh-oh, something went wrong!');
      error.code = 'request.destination.notfound';
      return Promise.reject({ code: 'request.destination.notfound' });
    });

    F(codeInputSel).type('1234');
    F(emailInputSel).type('foo@bar.com');
    F('.btn-submit:enabled').exists().click();

    F('.form-error').text(/invitation code not recognized/i, 'shows code not found error');
    F(() => done());
  });

  it('shows error message for invalid codes', function invalid(done) {
    const vm = canViewModel('arcus-settings-invites-accept-code');

    vm.attr('acceptInvitation', function acceptInvitation() {
      return Promise.reject({});
    });

    F(codeInputSel).type('1234');
    F(emailInputSel).type('foo@bar.com');
    F('.btn-submit:enabled').exists().click();

    F('.form-error').text(/invitation not valid/i, 'shows invalid code error');
    F(() => done());
  });

  xit('transition to pin code fields if accept invitation succeeds', function transition(done) {
    const vm = canViewModel('arcus-settings-invites-accept-code');

    vm.attr('acceptInvitation', function acceptInvitation() {
      return Promise.resolve();
    });

    F(codeInputSel).type('1234');
    F(emailInputSel).type('foo@bar.com');
    F('.btn-submit').exists().click();

    F('arcus-form-change-pin').size(1, 'should render change pin form');
    F('form.enter-invite-code').missing('should remove invite code form');

    F(() => done());
  });
});
