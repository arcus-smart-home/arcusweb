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

import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import view from './countdown.stache';
import moment from 'moment';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {number} to
     * @parent i2web/components/countdown
     * @description Timestamp in which we're counting down until
     */
    to: {
      type: 'number',
      set(to) {
        this.cancel();
        if (to) {
          let seconds = moment().diff(to, 'seconds') * -1;
          if (seconds > 0) {
            this.attr('countdownId', setInterval(() => {
              this.attr('text', this.format(seconds -= 1));
              if (seconds === 0) {
                this.cancel();
              }
            }, 1000));
            this.attr('text', this.format(seconds));
          }
        }
        return to;
      },
    },
    countdownId: {
      type: '*',
    },
  },
  format(seconds) {
    return (this.formatter) ? this.formatter(seconds) : `${seconds} <sup>S</sup>`;
  },
  /**
   * @function cancel
   * @parent i2web/components/countdown
   * @description Cancels the countdown
   */
  cancel() {
    if (this.attr('countdownId')) {
      clearInterval(this.attr('countdownId'));
      this.attr('countdownId', undefined);
    }
    this.attr('text', '');
  },
  /**
   * @property {string} text
   * @parent i2web/components/countdown
   * @description Time remaining (formatted). If empty, no time remaining.
   */
  text: '',
});

export default Component.extend({
  tag: 'arcus-countdown',
  viewModel: ViewModel,
  view,
  events: {
    removed() {
      const vm = this.viewModel;
      if (vm.attr('countdownId')) {
        clearInterval(vm.attr('countdownId'));
        vm.attr('countdownId', undefined);
      }
    },
  },
});
