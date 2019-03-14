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
import { ViewModel } from './notifications';
import stache from 'can-stache';
import $ from 'jquery';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'i2web/app.less';
import llx from 'lolex';

// TODO: Rewrite to use renderTemplate util
const template = '<arcus-notifications {events}="events"></arcus-notifications>';

describe('i2web/components/notifications', () => {
  before(function setupMockTimers() {
    this.clock = llx.install();
  });

  after(function teardownMockTimers() {
    this.clock.runToLast();
    this.clock.uninstall();
  });

  afterEach(function afterEach() {
    $('#test-area').empty();
  });

  it('Inits with events', function initWithEvents() {
    const events = [{
      type: 'info',
      message: 'Notification number 2',
    }, {
      type: 'info',
      message: 'This is the notification',
    }];

    const vm = new ViewModel({
      events,
    });

    assert.equal(vm.attr('currentNotification').attr('message'), 'This is the notification', 'The first notification is set instantly.');

    this.clock.tick(5000);
    assert.equal(vm.attr('currentNotification').attr('message'), 'Notification number 2', 'The second notification dequeues after interval timeout.');
  });

  it('Inits without events, then events are added later', function eventsAddedLater() {
    const events = [{
      type: 'info',
      message: 'Notification number 2',
    }, {
      type: 'info',
      message: 'This is the notification',
    }];
    const vm = new ViewModel();

    vm.attr('events', events);
    assert.equal(vm.attr('currentNotification').attr('message'), 'This is the notification', 'The first notification is set instantly.');

    this.clock.tick(5000);
    assert.equal(vm.attr('currentNotification').attr('message'), 'Notification number 2', 'The second notification dequeues after interval timeout.');
  });

  it('Inits without events, then events are added later not all at the same time', function eventsAddedOneByOne() {
    const event1 = {
      type: 'info',
      message: 'Notification number 1',
    };
    const event2 = {
      type: 'info',
      message: 'This is the notification',
    };

    const vm = new ViewModel();
    const renderer = stache(template);
    const fragment = renderer({ events: vm.attr('events'), intervalTime: vm.attr('intervalTime') });
    $('#test-area').append(fragment);

    this.clock.tick(100);
    vm.attr('events').unshift(event1);
    assert.equal($('.notification-container').text().trim(), 'Notification number 1', 'The first notification is set instantly.');

    this.clock.tick(200);
    vm.attr('events').unshift(event2);

    this.clock.tick(4500);
    assert.equal($('.notification-container').text().trim(), 'This is the notification', 'The second notification dequeues after interval timeout.');
  });

  it('Renders messages with HTML', function HTML() {
    const events = [{
      type: 'info',
      message: '<strong>Hello</strong> World',
    }];
    const renderer = stache(template);
    const fragment = renderer({ events });
    $('#test-area').append(fragment);

    const children = $('arcus-notifications .notification-container h3')[0].childNodes;
    assert.equal(children[0].nodeType, 1, 'Hello should be an element');
    assert.equal(children[1].nodeType, 3, 'World should be a text node');
  });

  it('Renders messages with no HTML', function noHTML() {
    const events = [{
      type: 'info',
      message: 'Spoon!',
    }];
    const renderer = stache(template);
    const fragment = renderer({ events });
    $('#test-area').append(fragment);

    const children = $('arcus-notifications .notification-container h3')[0].childNodes;
    assert.equal(children[0].nodeType, 3, 'Spoon! should be a text node');
  });
});
