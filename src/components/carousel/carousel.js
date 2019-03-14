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
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import Swiper from 'swiper/dist/js/swiper';
import 'swiper/dist/css/swiper.css';
import view from './carousel.stache';
import WatchElementResize from 'watch-element-resize';
import _ from 'lodash';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Object} slider
     * @parent i2web/components/carousel
     * carousel object
     */
    carousel: {
      type: '*',
    },
    /**
     * @property {Object} container
     * @parent i2web/components/carousel
     * HTML element representing the container
     */
    container: {
      type: '*',
    },
    /**
     * @property {Boolean} slideByPage
     * @parent i2web/components/carousel
     * Whether to group the items by page or not
     */
    slideByPage: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {Boolean} nav
     * @parent i2web/components/carousel
     * Whether nav (aka the tiny dots) should be included or not
     */
    nav: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {Integer} childWidth
     * @parent i2web/components/carousel
     * Width of a child element
     */
    childWidth: {
      get() {
        return +this.attr('container')
        .children()
        .children()
        .first()
        .outerWidth(true);
      },
    },
    /**
     * @property {number} containerWidth
     * @parent i2web/components/carousel
     * Width of the carousel container
     */
    containerWidth: {
      set(newVal) {
        if (newVal !== this.attr('containerWidth') && this.attr('carousel') && this.attr('slideByPage')) {
          const slidesToShow = Math.floor(newVal / this.attr('childWidth'));
          this.attr('carousel').params.slidesPerGroup = slidesToShow;
          this.attr('carousel').update();
        }
        return newVal;
      },
    },
    /**
     * @property {Object} watchForResize
     * @parent i2web/components/carousel
     * The resize watcher, this property is needed so that we can removeListeners
     * when the carousel is destroyed
     */
    watchForResize: {
      type: '*',
    },
  },
  /**
   * @function initCarousel
   * @parent i2web/components/carousel
   * Initializes the carousel
   */
  initCarousel() {
    const spaceBetween = 20;
    const config = {
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      spaceBetween,
      slidesPerView: this.attr('slideByPage') ? 'auto' : 1,
      observer: true,
      simulateTouch: false,
    };

    if (this.attr('nav')) {
      Object.assign(config, {
        pagination: '.swiper-pagination',
        paginationClickable: true,
      });
    }

    this.attr('carousel', new Swiper(this.attr('container'), config));
    // Need to enable touch control by default for mobile use, won't do anything
    // on non-touch devices.
    this.attr('carousel').enableTouchControl();
  },
  /**
   * @function destroyCarousel
   * @parent i2web/components/carousel
   * Destroys the carousel
   */
  destroyCarousel() {
    if (this.attr('carousel')) {
      this.attr('carousel').off('slideChangeEnd');
      this.attr('carousel').destroy();
      this.attr('watchForResize').removeListener();
    }
  },
});

export default Component.extend({
  tag: 'arcus-carousel',
  viewModel: ViewModel,
  view,
  events: {
    inserted(el) {
      this.viewModel.attr('container', $(el).find('.swiper-container'));
      this.viewModel.initCarousel();
      this.viewModel.attr('carousel').on('slideChangeEnd', (e) => {
        $(this.element).trigger('slideChanged', e);
      });

      const watchSize = new WatchElementResize(el);
      watchSize.on('resize', _.debounce((ev) => {
        this.viewModel.attr('containerWidth', ev.element.offset.width);
        this.viewModel.attr('carousel').onResize(true);
      }, 100));
      // so we can remove the above resize listener later
      this.viewModel.attr('watchForResize', watchSize);
    },
    '{element} beforeremove': function beforeRemove() {
      this.viewModel.destroyCarousel();
    },
  },
});
