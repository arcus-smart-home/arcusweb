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

import Control from 'can-control';
import { isIOS, isAndroid } from 'i2web/helpers/global';
import isTouchscreen from 'i2web/plugins/is-touchscreen';

const USE_TOUCH = isTouchscreen();

// We need some document-level event handling for dealing with button hovers on mobile. There is no
// better place to put it because we do not have an app-level component.
const DocumentControl = Control.extend({
  init() {
    if (!USE_TOUCH) {
      document.documentElement.classList.add('no-touch');
    }
    if (isIOS()) {
      document.documentElement.classList.add('ios');
    }
    if (isAndroid()) {
      document.documentElement.classList.add('android');
    }
  },
  onTouchStart(el) {
    el.classList.add('hover');
  },
  onTouchMove(el, ev) {
    ev.preventDefault();
  },
  onTouchEnd(el) {
    try {
      el.blur();
    } catch (e) {
      // do nothing.  Sometimes on IE you can't blur, like when going to fullscreen
    }
    el.classList.remove('hover');
  },

  [`[class^="btn"] ${USE_TOUCH ? 'touchstart' : 'mouseover'}`]: 'onTouchStart',
  [`[class^="btn"] ${USE_TOUCH ? 'touchend' : 'mouseout'}`]: 'onTouchEnd',
  '[class^="btn"] click': 'onTouchEnd',
  '[class^="btn"] touchmove': 'onTouchMove',
});

export default new DocumentControl(document.documentElement);
