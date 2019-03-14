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
import view from './pin-code.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
    * @property {String} pin
    * @parent i2web/components/pin-code
    * The 4 digit pin code
    */
    pin: {
      type: 'string',
      get() {
        const pinOne = this.attr('firstDigit') || '';
        const pinTwo = this.attr('secondDigit') || '';
        const pinThree = this.attr('thirdDigit') || '';
        const pinFour = this.attr('fourthDigit') || '';

        return `${pinOne}${pinTwo}${pinThree}${pinFour}`;
      },
      set(pin) {
        if (pin !== undefined) {
          this.attr('firstDigit', pin.length >= 1 ? pin[0] : '');
          this.attr('secondDigit', pin.length >= 2 ? pin[1] : '');
          this.attr('thirdDigit', pin.length >= 3 ? pin[2] : '');
          this.attr('fourthDigit', pin.length >= 4 ? pin[3] : '');
        }

        return pin || '';
      },
    },
    /**
    * @property {String} firstDigit
    * @parent i2web/components/pin-code
    * The first digit of the pin code
    */
    firstDigit: {
      type: 'string',
      value: '',
    },
    /**
    * @property {String} secondDigit
    * @parent i2web/components/pin-code
    * The second digit of the pin code
    */
    secondDigit: {
      type: 'string',
      value: '',
    },
    /**
    * @property {String} thirdDigit
    * @parent i2web/components/pin-code
    * The third digit of the pin code
    */
    thirdDigit: {
      type: 'string',
      value: '',
    },
    /**
    * @property {String} fourthDigit
    * @parent i2web/components/pin-code
    * The fourth digit of the pin code
    */
    fourthDigit: {
      type: 'string',
      value: '',
    },
  },
});

export default Component.extend({
  tag: 'arcus-pin-code',
  viewModel: ViewModel,
  view,
  events: {
  /**
   * @function onKeyUp
   * @parent i2web/components/pin-code
   * Event that fires on keyup, if backspace is hit, it will attempt to focus
   * on the previous element otherwise it will focus on the next one. If there is
   * no element to focus on, it will blur instead.
   */
    'input[type=password] keyup': function onKeyUp(el, ev) {
      const goBackwards = ev.which === 8;
      const focusElement = el[goBackwards ? 'previousElementSibling' : 'nextElementSibling'];

      if (focusElement) {
        focusElement.focus();
      } else {
        el.blur();
        el.focus();
      }
    },
  },
});
