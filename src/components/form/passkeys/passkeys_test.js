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

import 'mocha/mocha';
import assert from 'chai';
import sinon from 'sinon';
import Passkey from 'i2web/models/passkey';
import SidePanel from 'i2web/plugins/side-panel';
import { ViewModel } from './passkeys';

describe('i2web/components/form/passkeys', function passkeys() {
  let sandbox;
  let vm;
  const event = { preventDefault() {} };

  beforeEach(function beforeEach() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(SidePanel, 'close');
    vm = new ViewModel();
  });

  afterEach(function afterEach() {
    sandbox.restore();
  });

  it('loads the passkeys', function loads() {
    sandbox.stub(Passkey, 'list').returns(Promise.resolve([{ id: 'credential-1', name: 'Laptop', created: 1 }]));

    return vm.loadPasskeys().then(() => {
      assert.equal(vm.attr('passkeys.length'), 1);
      assert.equal(vm.attr('passkeys.0.name'), 'Laptop');
    });
  });

  it('shows an error when the passkeys cannot be loaded', function loadFails() {
    sandbox.stub(Passkey, 'list').returns(Promise.reject({ status: 500 }));

    return vm.loadPasskeys().then(() => {
      assert.equal(vm.attr('passkeys.length'), 0);
      assert.equal(vm.attr('formError'), 'Your passkeys could not be loaded. Please try again later.');
    });
  });

  it('removes the marked passkeys, treating ones already gone as removed', function removes() {
    const remove = sandbox.stub(Passkey, 'remove');
    remove.withArgs('credential-1').returns(Promise.resolve({}));
    remove.withArgs('credential-2').returns(Promise.reject({ status: 404 }));
    vm.attr('removedPasskeys').push({ id: 'credential-1' }, { id: 'credential-2' });

    vm.removePasskeys(vm, null, event);

    return new Promise(resolve => setTimeout(resolve)).then(() => {
      assert.deepEqual(remove.args.map(args => args[0]), ['credential-1', 'credential-2']);
      assert.isTrue(SidePanel.close.calledOnce);
      assert.isNotOk(vm.attr('formError'));
    });
  });

  it('keeps the panel open when a removal fails', function removeFails() {
    sandbox.stub(Passkey, 'remove').returns(Promise.reject({ status: 500 }));
    vm.attr('removedPasskeys').push({ id: 'credential-1' });

    vm.removePasskeys(vm, null, event);

    return new Promise(resolve => setTimeout(resolve)).then(() => {
      assert.isFalse(SidePanel.close.called);
      assert.equal(vm.attr('formError'), 'Some passkeys could not be removed. Please try again.');
    });
  });
});
