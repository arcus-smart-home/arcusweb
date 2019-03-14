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
import view from './scrubber.stache';
import isTouchscreen from 'i2web/plugins/is-touchscreen';

const USE_TOUCH = isTouchscreen();

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Number} startTime
     * @parent i2web/components/video/scrubber
     * @description The start time of the scrubber in seconds
     */
    startTime: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {Number} endTime
     * @parent i2web/components/video/scrubber
     * @description The end time of the scrubber in seconds
     */
    endTime: {
      type: 'number',
      value: 100,
    },
    /**
     * @property {Number} currentTime
     * @parent i2web/components/video/scrubber
     * @description The current time of the scrubber in seconds
     */
    currentTime: {
      type: 'number',
      value: 0,
      set(currentTime) {
        const startTime = this.attr('startTime');
        const endTime = this.attr('endTime');

        // Time should always always be startTime or higher and endTime and lower
        return Math.max(startTime, Math.min(endTime, currentTime));
      },
    },
  },
});

export default Component.extend({
  tag: 'arcus-scrubber',
  viewModel: ViewModel,
  view,
  events: {
    [`{element} ${USE_TOUCH ? 'touchstart' : 'mousedown'}`]: function handleOnDown(el, ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this._dragging = true;
    },
    [`{element} ${USE_TOUCH ? 'touchmove' : 'mousemove'}`]: function handleOnMove(el, ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (this._dragging) {
        const dimensions = el.getBoundingClientRect();
        const offsetX = ev.clientX - dimensions.left;
        const width = el.offsetWidth;
        const startTime = this.viewModel.attr('startTime');
        const endTime = this.viewModel.attr('endTime');

        // currentTime should not be set to lower than our defined start time
        this.viewModel.attr('currentTime', Math.max(startTime, (offsetX / width) * endTime));
      }
    },

    [`{element} ${USE_TOUCH ? 'touchend' : 'mouseup'}`]: 'handleOnUp',
    [`{document} ${USE_TOUCH ? 'touchend' : 'mouseup'}`]: 'handleOnUp',
    handleOnUp(el, ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this._dragging = false;
    },
    '{element} click': function onScrubberClick(el, ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!this._dragging) {
        const dimensions = el.getBoundingClientRect();
        const offsetX = ev.clientX - dimensions.left;
        const width = el.offsetWidth;
        const startTime = this.viewModel.attr('startTime');
        const endTime = this.viewModel.attr('endTime');

        // currentTime should not be set to lower than our defined end time
        this.viewModel.attr('currentTime', Math.max(startTime, (offsetX / width) * endTime));
      }
    },

    inserted() {
      this.updatePosition();
    },
    '{viewModel} startTime': 'updatePosition',
    '{viewModel} endTime': 'updatePosition',
    '{viewModel} currentTime': 'updatePosition',
    updatePosition() {
      const currentTime = this.viewModel.attr('currentTime');
      const endTime = this.viewModel.attr('endTime');
      const progress = Math.min(currentTime / endTime, 1);
      const progressBar = this.element.querySelector('.progress-bar');
      const handle = this.element.querySelector('.handle');

      progressBar.style.transform = `scaleX(${progress})`;
      handle.style.transform = `translateX(${progressBar.offsetWidth * progress}px)`;
    },
  },
});
