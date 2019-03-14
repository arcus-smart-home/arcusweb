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
import $ from 'jquery';
import fixture from 'can-fixture/';
import canViewModel from 'can-view-model';
import loginAndRender from 'i2web/test/util/loginAndRender';
import moment from 'moment';
import Place from 'i2web/models/place';
import PlaceData from 'i2web/models/fixtures/data/place/place.json';
import './event-list';

let EVENTS = { results: [] };
const template = '<arcus-event-list {retrieve-events}="@retrieveEvents" {place}="place" />';
let vm;
let cleanupAfterRender;

describe('i2web/components/event-list', () => {
  before(function before() {
    fixture.reset();
  });
  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template,
      scope: {
        page: 'home',
        place: new Place(PlaceData[0]),
        retrieveEvents: function retrieveEvents() {
          return Promise.resolve(EVENTS);
        },
      },
      appScope: {
        session: {},
      },
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      vm = canViewModel($('arcus-event-list')[0]);
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

  describe('rendering', function rendering() {
    it('shall be rendered to the page with events', function showEventList(done) {
      EVENTS = {
        results: [{
          subjectName: 'Subject Name',
          longMessage: 'Long Message number 1',
          startDate: moment().toDate(),
          timestamp: moment().toDate(),
        }, {
          subjectName: 'Subject Name 2',
          longMessage: 'Long Message number 2',
          startDate: moment().subtract(1, 'day').toDate(),
          timestamp: moment().subtract(1, 'day').toDate(),
        }],
      };
      vm.refreshHistory();
      setTimeout(() => {
        assert.lengthOf($('.event-item'), EVENTS.results.length, 'the component rendered with events');
        done();
      }, 0);
    });

    it('shall render a heading of "Today" if the latest event occurred today', function showEventList(done) {
      EVENTS = {
        results: [{
          subjectName: 'Subject Name',
          longMessage: 'Long Message number 1',
          startDate: moment().toDate(),
          timestamp: moment().toDate(),
        }],
      };
      vm.refreshHistory();
      setTimeout(() => {
        assert.equal($('.history-timestamp small').text(), 'Today', 'the component rendered with the correct heading');
        done();
      }, 0);
    });

    it('shall render a heading of "Yesterday" if the latest event occured yesterday', function showEventList(done) {
      const oneDayAgo = moment().subtract(1, 'day');
      EVENTS = {
        results: [{
          subjectName: 'Subject Name',
          longMessage: 'Long Message number 1',
          startDate: oneDayAgo.toDate(),
          timestamp: oneDayAgo.toDate(),
        }],
      };
      vm.refreshHistory();
      setTimeout(() => {
        assert.equal($('.history-timestamp small').text(), 'Yesterday', 'the component rendered with the correct heading');
        done();
      }, 0);
    });

    it('shall render a heading with the date of the latest event if the latest event occured more than a day ago', function showEventList(done) {
      const twoDaysAgo = moment().subtract(2, 'day');
      EVENTS = {
        results: [{
          subjectName: 'Subject Name',
          longMessage: 'Long Message number 1',
          startDate: twoDaysAgo.toDate(),
          timestamp: twoDaysAgo.toDate(),
        }],
      };
      vm.refreshHistory();
      setTimeout(() => {
        assert.equal($('.history-timestamp small').text(), twoDaysAgo.format('ddd MMM DD'), 'the component rendered with the correct heading');
        done();
      }, 0);
    });
  });
});
