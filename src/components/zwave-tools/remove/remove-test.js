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
import assert from 'chai';
import canEvent from 'can-event';
import CanMap from 'can-map';
import F from 'funcunit';
import Hub from 'i2web/models/hub';
import './remove';
import stache from 'can-stache';
import AppState from 'i2web/plugins/get-app-state';

describe('i2web/components/zwave-tools/remove', function zwaveRemove() {
  let scope;
  let hub;
  let actionType;

  beforeEach(function beforeEach(done) {
    AppState().attr('notifications', []);
    hub = new Hub({});
    hub.UnpairingRequest = (at) => {
      actionType = at;
      if (actionType === 'START_UNPAIRING') {
        canEvent.trigger.call(hub, 'hub:state', ['UNPAIRING', 'NORMAL']);
      } else {
        canEvent.trigger.call(hub, 'hub:state', ['NORMAL', 'UNPAIRING']);
      }
      return new Promise(() => {});
    };
    scope = new CanMap({ hub, open: true });
    const tpl = stache(`
      {{#if open}}<arcus-zwave-tools-remove {hub}="hub" {(open)}="open" />{{/if}}
    `);
    $('#test-area').append(tpl(scope));
    F('arcus-zwave-tools-remove').exists(() => done());
  });

  afterEach(function afterEach() {
    $('#test-area').empty();
  });

  describe('rendering', function rendering() {
    it('starts unpairing and renders search view on insert', function insert() {
      assert.equal(actionType, 'START_UNPAIRING');
      assert.equal($('h4').text(), 'Searching...');
    });

    it('cancel on search page, stops unpairing and closes modal', function cancel(done) {
      F('.btn-cancel').exists().click(() => {
        assert.equal(actionType, 'STOP_UNPAIRING');
        assert.notOk(scope.attr('open'));
        assert.notOk($('arcus-zwave-tools-remove').length);
        done();
      });
    });

    it('shows success page if device is removed', function success(done) {
      canEvent.trigger.call(hub, 'hubzwave:numDevices');
      canEvent.trigger.call(hub, 'hub:state', ['NORMAL', 'UNPAIRING']);
      F(() => {
        assert.equal($('h4').text(), 'Success!');
        assert.equal($('.btn').text(), 'Done');
        done();
      });
    });

    it('shows failure view if device not removed after timeout', function timeout(done) {
      canEvent.trigger.call(hub, 'hub:state', ['NORMAL', 'UNPAIRING']);
      F(() => {
        assert.equal($('h4').text(), 'Removal Timed Out');
        assert.equal($('.btn').text(), 'Keep Searching');
        assert.equal($('.btn-cancel').text(), 'Cancel');
        done();
      });
    });
  });
});
