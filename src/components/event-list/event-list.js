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

import _ from 'lodash';
import moment from 'moment/';
import Component from 'can-component';
import canMap from 'can-map';
import canList from 'can-list';
import Errors from 'i2web/plugins/errors';
import 'can-map-define';
import view from './event-list.stache';

const PREMIUM_HISTORY_RANGE = 14;

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/card
     * @description The associated subsystem, this should be a subsystem with the subcare capability
     */
    care: {
      type: 'boolean',
    },
    /**
     * @property {Array} events
     * @parent i2web/components/event-list
     *
     * The relevant events from a source.
     */
    events: {
      Type: canList,
      value: [],
    },
    /**
     * @property {canMap} place
     * @parent i2web/components/event-list
     *
     * The place for which history events are being displayed.
     */
    place: {
      Type: canMap,
    },
    /**
     * @property {function} retrieveEvents
     * @parent i2web/components/event-list
     *
     * The parent component provides the function to use in the refreshHistory
     * function promise list.
     */
    retrieveEvents: {
      Type: Function,
    },
  },
  /**
   * @function refreshHistory
   * @parent i2web/components/event-list
   * Refresh the history items
   */
  refreshHistory() {
    const retrieveEvents = this.attr('retrieveEvents');
    const place = this.attr('place');
    if (retrieveEvents && place) {
      const earliestEvent = (place.attr('isPremium'))
        ? moment().subtract(PREMIUM_HISTORY_RANGE * 24, 'hours').valueOf()
        : moment().subtract(24, 'hours').valueOf();
      retrieveEvents().then(({ results }) => {
        // remove the old events - this unbinds the shouldRenderDate function
        this._lastRenderedEvent = null;
        this.removeAttr('events');

        // set the new events
        this.attr('events', _.filter(results, item => item.timestamp > earliestEvent));
      }).catch((e) => {
        this.attr('events', []);
        Errors.log(e, true);
      });
    }
  },
});

export default Component.extend({
  tag: 'arcus-event-list',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      this.viewModel.refreshHistory();
    },
  },
  helpers: {
    /**
     * @function shouldRenderDate
     * @parent i2web/components/event-list
     * @param {Event} event
     *
     * @description
     * Determines whether or not to render the block if the date is different than
     * the previously rendered one
     *
     * @return {HTML} The scope block
     */
    shouldRenderDate(event, options) {
      event = event.isComputed && event(); // eslint-disable-line no-param-reassign

      if (!this._lastRenderedEvent) {
        this._lastRenderedEvent = event;
        return options.fn({ event });
      }

      const formerTimestamp = moment(this._lastRenderedEvent.attr('timestamp')).format('YYYY MM DD');
      const currentTimestamp = moment(event.attr('timestamp')).format('YYYY MM DD');

      if (formerTimestamp !== currentTimestamp) {
        this._lastRenderedEvent = event;
        return options.fn({ event });
      }

      return options.inverse();
    },
  },
});
