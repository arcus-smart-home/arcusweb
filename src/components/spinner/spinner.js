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
import view from './spinner.stache';
import isTouchscreen from 'i2web/plugins/is-touchscreen';

const USE_TOUCH = isTouchscreen();

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Number} value
     * @parent i2web/components/spinner
     * @description Raw value
     */
    value: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {String} formattedValue
     * @parent i2web/components/spinner
     * @description Value after it's been run through the formatter
     */
    formattedValue: {
      type: 'string',
      get() {
        if (typeof this.attr('formatter') === 'function') {
          return this.attr('formatter')(this.attr('value'));
        }
        return this.attr('value') || this.attr('min');
      },
    },
    /**
     * @property {Number} min
     * @parent i2web/components/spinner
     * @description Minimum value
     */
    min: {
      type: 'number',
      set(min) {
        if (this.attr('value') < min) {
          this.attr('value', min);
        }
        return min;
      },
    },
    /**
     * @property {Number} max
     * @parent i2web/components/spinner
     * @description Maximum value
     */
    max: {
      type: 'number',
      set(max) {
        if (this.attr('value') > max) {
          this.attr('value', max);
        }
        return max;
      },
    },
    /**
     * @property {Number} step
     * @parent i2web/components/spinner
     * @description The increment that will happen when you click the arrows
     */
    step: {
      type: 'number',
      value: 1,
    },
    /**
     * @property {Number} incrementStep
     * @parent i2web/components/spinner
     * @description The increment that will happen when you click the arrows, if defined, will
     * overrule the step attribute
     */
    incrementStep: {
      value: undefined,
    },
    /**
     * @property {Number} decrementStep
     * @parent i2web/components/spinner
     * @description The decrement that will happen when you click the arrows, if defined, will
     * overrule the step attribute
     */
    decrementStep: {
      value: undefined,
    },
    /**
     * @property {Function} formatter
     * @parent i2web/components/spinner
     * @description Format the value for display
     */
    formatter: {
      value: undefined,
    },
    /**
     * @property {Boolean} cycle
     * @parent i2web/components/spinner
     * @description If true, once the number exceeds the min or max bounds, it will cycle back (max->min, min->max)
     */
    cycle: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {Boolean} disabled
     * @parent i2web/components/spinner
     * @description If true, disables the spinner buttons
     */
    disabled: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {Boolean} shouldDisableMax
     * @parent i2web/components/spinner
     * @description Determines if the max button should be disabled based on various state variables
     */
    shouldDisableMax: {
      type: 'htmlbool',
      get() {
        if (this.attr('disabled')) {
          return true;
        }
        if (!this.attr('cycle') && this.attr('max') === this.attr('value')) {
          return true;
        }
        return false;
      },
    },
    /**
     * @property {Boolean} shouldDisableMin
     * @parent i2web/components/spinner
     * @description Determines if the min button should be disabled based on various state variables
     */
    shouldDisableMin: {
      type: 'htmlbool',
      get() {
        if (this.attr('disabled')) {
          return true;
        }
        if (!this.attr('cycle') && this.attr('min') === this.attr('value')) {
          return true;
        }
        return false;
      },
    },
  },
  /**
   * @function increment
   * @parent i2web/components/spinner
   * @description Increments the value
   */
  increment() {
    if (this.attr('disabled')) {
      // if disabled, we just don't perform this action
      return;
    }
    const step = this.attr('incrementStep') !== undefined ? this.attr('incrementStep') : this.attr('step');
    let newVal = this.attr('value') + step;
    if (newVal > this.attr('max')) {
      if (!this.attr('cycle')) {
        return;
      }
      newVal = this.attr('min');
    }

    // If the value is somehow below the minimum allowed value of the spinner, set it to the
    // minimum value
    if (newVal < this.attr('min')) {
      newVal = this.attr('min');
    }
    this.attr('value', newVal);
  },
  /**
   * @function decrement
   * @parent i2web/components/spinner
   * @description Decrements the value
   */
  decrement() {
    if (this.attr('disabled')) {
      // if disabled, we just don't perform this action
      return;
    }
    const step = this.attr('decrementStep') !== undefined ? this.attr('decrementStep') : this.attr('step');
    let newVal = this.attr('value') - step;
    if (newVal < this.attr('min')) {
      if (!this.attr('cycle')) {
        return;
      }
      newVal = this.attr('max');
    }

    // If the value is somehow above the maximum allowed value of the spinner, set it to the
    // maximum value
    if (newVal > this.attr('max')) {
      newVal = this.attr('max');
    }
    this.attr('value', newVal);
  },
});

const touchTimeout = 200;
export default Component.extend({
  tag: 'arcus-spinner',
  viewModel: ViewModel,
  view,
  events: {
    [`.up ${USE_TOUCH ? 'touchstart' : 'mousedown'}`]: function incrementValue() {
      this.holdingIncrement = true;
      this.interval = window.setInterval(() => {
        this.checkForTouch();
      }, touchTimeout);
    },
    [`.down ${USE_TOUCH ? 'touchstart' : 'mousedown'}`]: function decrementValue() {
      this.holdingDecrement = true;
      this.interval = window.setInterval(() => {
        this.checkForTouch();
      }, touchTimeout);
    },
    [`{document} ${USE_TOUCH ? 'touchend' : 'mouseup'}`]: function stopDecrement() {
      window.clearInterval(this.interval);
      this.holdingIncrement = false;
      this.holdingDecrement = false;
    },
    '.down click': function down() {
      this.viewModel.decrement();
    },
    '.up click': function up() {
      this.viewModel.increment();
    },
    checkForTouch() {
      if (this.holdingIncrement) this.viewModel.increment();
      if (this.holdingDecrement) this.viewModel.decrement();
    },
  },
});
