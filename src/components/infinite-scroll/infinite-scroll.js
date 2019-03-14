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

/* eslint no-continue: 0*/
import Component from 'can-component';
import canMap from 'can-map';
import $ from 'jquery';
import _ from 'lodash';
import 'can-map-define/';
import view from './infinite-scroll.stache';
import Errors from 'i2web/plugins/errors';

// Number of items to instantiate beyond current view in the scroll direction.
const RUNWAY_ITEMS = 30;
// Number of items to instantiate beyond current view in the opposite direction.
const RUNWAY_ITEMS_OPPOSITE = 10;
// The number of pixels of additional length to allow scrolling to.
const SCROLL_RUNWAY = 2000;
// The animation interval (in ms) for fading in content from tombstones.
const ANIMATION_DURATION_MS = 100;

/**
 * @module {Class} i2web/components/infinite-scroll/source Source
 * @parent i2web/components/infinite-scroll
 *
 * Source object that the infinite scroll will fetch data from as well as create
 * the components DOM elements from.
 *
 * # Important Note
 *
 * The templates are strings that get turned into DOM elements via jQuery rather
 * than stache templates. This is done because we utilize DOM recycling rather
 * than live binding templates in order to keep the DOM count down.
 */
export const Source = canMap.extend({
  define: {
    /**
    * @property {String} tombstoneTemplate
    * @parent i2web/components/infinite-scroll/source
    *
    * String representation of the tombstone placeholder template
    */
    tombstoneTemplate: {
      type: 'string',
      value: '',
    },
    /**
    * @property {String} template
    * @parent i2web/components/infinite-scroll/source
    *
    * String representation of the list item template
    */
    template: {
      type: 'string',
      value: '<li class="item"><div class="message"></div></li>',
    },
  },

  init() {
    const tombstoneTmpl = this.attr('tombstoneTemplate');
    const tmpl = this.attr('template');

    this._template = $(tmpl)[0];
    if (!tombstoneTmpl) {
      this._tombstoneTemplate = this._template;
    } else {
      this._tombstoneTemplate = $(tombstoneTmpl)[0];
    }
  },

  /**
  * @function fetch
  * @parent i2web/components/infinite-scroll/source
  *
  * Function that is utilized to fetch the next series of items
  * @param {Number} count Number of items to attempt to fetch
  * @return {Promise}
  */
  fetch(count) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({});
    }

    return Promise.resolve(items);
  },

  /**
  * @function createTombstone
  * @parent i2web/components/infinite-scroll/source
  *
  * Creates a tombstone placeholder based off of the provided template
  * @return {Node}
  */
  createTombstone() {
    const el = this._tombstoneTemplate.cloneNode(true);
    el.classList.add('tombstone');

    return el;
  },

  /**
  * @function render
  * @parent i2web/components/infinite-scroll/source
  *
  * Creates an element for a specific data item. This utilizes DOM recycling by
  * optionally passing in an element. If it doesn't exist, it will clone the
  * template.
  * @param {canMap} item
  * @param {Node} el
  * @return {Node}
  */
  render(prevItem, item, el) {
    const element = el || this._template.cloneNode(true);

    return element;
  },
});

/**
 * @module {Class} i2web/components/infinite-scroll/viewmodel ViewModel
 * @parent i2web/components/infinite-scroll
 *
 */
export const ViewModel = canMap.extend({
  define: {
    /**
    * @property {Source} source
    * @parent i2web/components/infinite-scroll/viewmodel
    *
    * The source to be utilized by the infinite scroller
    */
    source: {
      Type: Source,
    },

    /**
    * @property {Number} limit
    * @parent i2web/components/infinite-scroll/viewmodel
    *
    * The number to limit grabbing new data at a time at.
    */
    limit: {
      type: 'number',
      value: 10,
    },

    /**
    * @property {string} headerDataAttribute
    * @parent i2web/components/infinite-scroll/viewmodel
    *
    * If this exists, it will create a header on the component and attempt to
    * pull that data from list items' datasets. This can be set in the Source's
    * render function. For example, if `headerDataAttribute` is `'lastLetter'`
    * your render function might look like:
    *
    * ```
    * render(item, el) {
    *   const element = el || this._template.cloneNode(true);
    *   element.dataset.lastLetter = item.lastName[0];
    *
    *   return element;
    * }
    * ```
    */
    headerDataAttribute: {
      type: 'string',
    },
    /**
    * @property {string} noItemsMessage
    * @parent i2web/components/infinite-scroll/viewmodel
    *
    * Message we should so if we choose not to render any items.
    */
    noItemsMessage: {
      type: 'string',
      value: 'There are no items',
    },
    /**
     * @property {boolean} itemsScrolled
     * @parent i2web/components/infinite-scroll/viewmodel
     *
     * Flag as to whether there are items scrolled off the screen or not
     */
    itemsScrolled: {
      type: 'boolean',
      value: false,
    },
  },
});

/**
 * @module {Class} i2web/components/infinite-scroll/component Component
 * @parent i2web/components/infinite-scroll
 *
 */
export default Component.extend({
  tag: 'arcus-infinite-scroll',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      this.$el = $(this.element);
      this._scroller = this.$el.find('ul')[0];
      this._scrollRunway = this.$el.find('.runway')[0];
      this._header = this.$el.find('.header-nav h3')[0];
      this._scroller.addEventListener('scroll', this._onScroll.bind(this));

      this.resetScroll();
    },

    /**
     * @function resetScroll
     * @parent i2web/components/infinite-scroll/component
     *
     * Called when the component is first inserted and when our source changes,
     * will reset all the data we need to keep track of
     */
    resetScroll() {
      if (!this.viewModel.source) {
        return;
      }

      this.anchorItem = {
        index: 0,
        offset: 0,
      };
      this.anchorScrollTop = 0;

      this._scrollRunwayEnd = 0;
      this._firstAttachedItem = 0;
      this._lastAttachedItem = 0;
      this._tombstoneSize = 0;
      this._tombstoneWidth = 0;
      this._tombstones = [];
      this._items = [];
      this._loadedItems = 0;
      this._noMoreContent = false;
      this._requestInProgress = false;

      _.forEach(this._scroller.querySelectorAll('li'), (li) => {
        li.remove();
      });

      this._onResize();
    },

    '{.infinite-footer button} click': function scrollToTop() {
      this.anchorScrollTop = 0;
      this._scroller.scrollTop = 0;
      this._onScroll();
    },

    '{viewModel} source': 'resetScroll',
    '{window} resize': '_onResize',

    /**
     * @function _onResize
     * @parent i2web/components/infinite-scroll/component
     *
     * Called when the browser window resizes to adapt to new scroller bounds and
     * layout sizes of items within the scroller.
     */
    _onResize() {
      // TODO: If we already have tombstones attached to the document, it would
      // probably be more efficient to use one of them rather than create a new
      // one to measure.
      const tombstone = this.getTombstone();
      tombstone.style.position = 'absolute';
      this._scroller.appendChild(tombstone);
      tombstone.classList.remove('invisible');
      this._tombstoneSize = tombstone.offsetHeight;
      this._tombstoneWidth = tombstone.offsetWidth;
      this._scroller.removeChild(tombstone);

      // Reset the cached size of items in the scroller as they may no longer be
      // correct after the item content undergoes layout.
      for (let i = 0; i < this._items.length; i++) {
        this._items[i].height = 0;
        this._items[i].width = 0;
      }
      this._onScroll();
    },

    /**
     * @function _onScroll
     * @parent i2web/components/infinite-scroll/component
     *
     * Called when the scroller scrolls. This determines the newly anchored item
     * and offset and then updates the visible elements, requesting more items
     * from the source if we've scrolled past the end of the currently available
     * content.
     */
    _onScroll() {
      const delta = this._scroller.scrollTop - this.anchorScrollTop;
      // Special case, if we get to very top, always scroll to top.
      if (this._scroller.scrollTop === 0) {
        this.viewModel.attr('itemsScrolled', false);
        this.anchorItem = {
          index: 0,
          offset: 0,
        };
      } else {
        this.viewModel.attr('itemsScrolled', true);
        this.anchorItem = this.calculateAnchoredItem(this.anchorItem, delta);
      }
      this.anchorScrollTop = this._scroller.scrollTop;
      const lastScreenItem = this.calculateAnchoredItem(this.anchorItem, this._scroller.offsetHeight);

      if (delta < 0) {
        this.fill(this.anchorItem.index - RUNWAY_ITEMS, lastScreenItem.index + RUNWAY_ITEMS_OPPOSITE);
      } else {
        this.fill(this.anchorItem.index - RUNWAY_ITEMS_OPPOSITE, lastScreenItem.index + RUNWAY_ITEMS);
      }
    },

    /**
     * @function calculateAnchoredItem
     * @parent i2web/components/infinite-scroll/component
     *
     * Calculates the item that should be anchored after scrolling by delta from
     * the initial anchored item.
     * @param {{index: number, offset: number}} initialAnchor The initial position
     *     to scroll from before calculating the new anchor position.
     * @param {number} delta The offset from the initial item to scroll by.
     * @return {{index: number, offset: number}} Returns the new item and offset
     *     scroll should be anchored to.
     */
    calculateAnchoredItem(initialAnchor, delta) {
      let offset = delta;

      if (offset === 0) {
        return initialAnchor;
      }
      offset += initialAnchor.offset;
      let index = initialAnchor.index;
      let tombstones = 0;
      if (offset < 0) {
        while (offset < 0 && index > 0 && this._items[index - 1] && this._items[index - 1].height) {
          offset += this._items[index - 1].height;
          index--;
        }
        tombstones = Math.max(-index, Math.ceil(Math.min(offset, 0) / this._tombstoneSize));
      } else {
        while (offset > 0 && index < this._items.length && this._items[index].height && this._items[index].height < offset) {
          offset -= this._items[index].height;
          index++;
        }
        if (index >= this._items.length || !this._items[index].height) {
          tombstones = Math.floor(Math.max(offset, 0) / this._tombstoneSize);
        }
      }
      index += tombstones;
      offset -= tombstones * this._tombstoneSize;
      return {
        index,
        offset,
      };
    },

    /**
     * @function fill
     * @parent i2web/components/infinite-scroll/component
     *
     * Sets the range of items which should be attached and attaches those items.
     * @param {number} start The first item which should be attached.
     * @param {number} end One past the last item which should be attached.
     */
    fill(start, end) {
      this._firstAttachedItem = Math.max(0, start);
      this._lastAttachedItem = end;
      this.attachContent();
    },

    /**
     * @function getTombstone
     * @parent i2web/components/infinite-scroll/component
     *
     * Creates or returns an existing tombstone ready to be reused.
     * @return {Element} A tombstone element ready to be used.
     */
    getTombstone() {
      const tombstone = this._tombstones.pop();
      if (tombstone) {
        tombstone.classList.remove('invisible');
        tombstone.style.opacity = 1;
        tombstone.style.transform = '';
        tombstone.style.transition = '';
        return tombstone;
      }
      return this.viewModel.source.createTombstone();
    },

    /**
     * @function attachContent
     * @parent i2web/components/infinite-scroll/component
     *
     * Attaches content to the scroller and updates the scroll position if
     * necessary.
     */
    attachContent() {
      // Collect nodes which will no longer be rendered for reuse.
      // TODO: Limit this based on the change in visible items rather than looping
      // over all items.
      let i;
      const unusedNodes = [];

      for (i = 0; i < this._items.length; i++) {
        // Skip the items which should be visible.
        if (i === this._firstAttachedItem) {
          i = this._lastAttachedItem - 1;
          continue;
        }
        if (this._items[i].node) {
          if (this._items[i].node.classList.contains('tombstone')) {
            this._tombstones.push(this._items[i].node);
            this._tombstones[this._tombstones.length - 1].classList.add('invisible');
          } else {
            unusedNodes.push(this._items[i].node);
          }
        }
        this._items[i].node = null;
      }

      const tombstoneAnimations = {};
      // Create DOM nodes.
      for (i = this._firstAttachedItem; i < this._lastAttachedItem; i++) {
        // If we don't have any more content to fetch and we've moved past the
        // number of items we have, we can continue on.
        if (this._noMoreContent && i >= this._items.length) {
          continue;
        }

        while (this._items.length <= i) {
          this._addItem();
        }

        if (this._items[i].node) {
          // if it's a tombstone but we have data, replace it.
          if (this._items[i].node.classList.contains('tombstone') &&
              this._items[i].data) {
            // TODO: Probably best to move items on top of tombstones and fade them in instead.
            if (ANIMATION_DURATION_MS) {
              this._items[i].node.style.zIndex = 1;
              tombstoneAnimations[i] = [this._items[i].node, this._items[i].top - this.anchorScrollTop];
            } else {
              this._items[i].node.classList.add('invisible');
              this._tombstones.push(this._items[i].node);
            }
            this._items[i].node = null;
          } else {
            continue;
          }
        }
        const el = unusedNodes.pop() || this.viewModel.source._template.cloneNode(true);
        const node = this._items[i].data ? this.viewModel.source.render(this._items[i - 1] ? this._items[i - 1].data : undefined, this._items[i].data, el) : this.getTombstone();
        // Maybe don't do this if it's already attached?
        node.style.position = 'absolute';
        this._items[i].top = -1;
        this._scroller.appendChild(node);
        this._items[i].node = node;
      }

      // Remove all unused nodes
      while (unusedNodes.length) {
        this._scroller.removeChild(unusedNodes.pop());
      }

      // Get the height of all nodes which haven't been measured yet.
      for (i = this._firstAttachedItem; i < this._lastAttachedItem; i++) {
        // If we don't have any more content to fetch and we've moved past the
        // number of items we have, we can continue on.
        if (this._noMoreContent && i >= this._items.length) {
          continue;
        }

        // Only cache the height if we have the real contents, not a placeholder.
        if (this._items[i].data && !this._items[i].height) {
          this._items[i].height = this._items[i].node.offsetHeight;
          this._items[i].width = this._items[i].node.offsetWidth;
        }
      }

      // Fix scroll position in case we have realized the heights of elements
      // that we didn't used to know.
      // TODO: We should only need to do this when a height of an item becomes
      // known above.
      this.anchorScrollTop = 0;
      for (i = 0; i < this.anchorItem.index; i++) {
        if (this._items[i]) {
          this.anchorScrollTop += (this._items[i] && this._items[i].height) || this._tombstoneSize;
        }
      }
      this.anchorScrollTop += this.anchorItem.offset;

      // Position all nodes.
      let curPos = this.anchorScrollTop - this.anchorItem.offset;
      i = this.anchorItem.index;
      while (i > this._firstAttachedItem) {
        curPos -= (this._items[i - 1] && this._items[i - 1].height) || this._tombstoneSize;
        i--;
      }
      while (i < this._firstAttachedItem) {
        curPos += (this._items[i] && this._items[i].height) || this._tombstoneSize;
        i++;
      }
      // Set up initial positions for animations.
      _.forIn(tombstoneAnimations, (anim, index) => {
        this._items[index].node.style.transform = `translateY(${this.anchorScrollTop + anim[1]}px) scale(${this._tombstoneWidth / this._items[index].width}, ${this._tombstoneSize / this._items[index].height})`;
        // Call offsetTop on the nodes to be animated to force them to apply current transforms.
        this._items[index].node.offsetTop; // eslint-disable-line no-unused-expressions
        anim[0].offsetTop; // eslint-disable-line no-unused-expressions
        this._items[index].node.style.transition = `transform ${ANIMATION_DURATION_MS}ms`;
      });

      for (i = this._firstAttachedItem; i < this._lastAttachedItem; i++) {
        // If we don't have any more content to fetch and we've moved past the
        // number of items we have, we can continue on.
        if (this._noMoreContent && i >= this._items.length) {
          continue;
        }

        const anim = tombstoneAnimations[i];
        if (anim) {
          anim[0].style.transition = `transform ${ANIMATION_DURATION_MS}ms, opacity ${ANIMATION_DURATION_MS}ms`;
          anim[0].style.transform = `translateY(${curPos}px) scale(${this._items[i].width / this._tombstoneWidth}, ${this._items[i].height / this._tombstoneSize})`;
          anim[0].style.opacity = 0;
        }
        if (curPos !== this._items[i].top) {
          if (!anim) {
            this._items[i].node.style.transition = '';
          }
          this._items[i].node.style.transform = `translateY(${curPos}px)`;
        }
        this._items[i].top = curPos;
        curPos += (this._items[i] && this._items[i].height) || this._tombstoneSize;
      }

      // If we have no more content, the curPos is as far as we want the runway
      // to go to, otherwise, add more runway.
      this._scrollRunwayEnd = this._noMoreContent ? curPos : Math.max(this._scrollRunwayEnd, curPos + SCROLL_RUNWAY);
      this._scrollRunway.style.transform = `translate(0, ${this._scrollRunwayEnd}px)`;
      this._scroller.scrollTop = this.anchorScrollTop;

      if (ANIMATION_DURATION_MS) {
        // TODO: Should probably use transition end, but there are a lot of animations we could be listening to.
        setTimeout(() => {
          _.forIn(tombstoneAnimations, (anim) => {
            anim[0].classList.add('invisible');
            this._tombstones.push(anim[0]);
            // Tombstone can be recycled now.
          });
        }, ANIMATION_DURATION_MS);
      }

      if (this.viewModel.headerDataAttribute && this._items[this.anchorItem.index]) {
        const headerValue = this._items[this.anchorItem.index].node.dataset[this.viewModel.headerDataAttribute];
        this._header.textContent = headerValue || this._header.textContent;
      }

      this.maybeRequestContent();
    },

    /**
     * @function maybeRequestContent
     * @parent i2web/components/infinite-scroll/component
     *
     * Requests additional content if we don't have enough currently.
     */
    maybeRequestContent() {
      // Don't issue another request if one is already in progress as we don't
      // know where to start the next request yet.
      // We also don't issue a request if we've determined there's no more
      // content to be retrieved from the server.
      if (this._requestInProgress || this._noMoreContent) {
        return;
      }
      const itemsNeeded = this._lastAttachedItem - this._loadedItems;
      if (itemsNeeded <= 0) {
        return;
      }
      this._requestInProgress = true;

      this.viewModel.source.fetch(itemsNeeded).then((items) => {
        this.addContent(items, itemsNeeded);
      }).catch((e) => {
        this.addContent([], 0);
        Errors.log(e, true);
      });
    },

    /**
     * @function _addItem
     * @parent i2web/components/infinite-scroll/component
     * Adds an item to the items list.
     */
    _addItem() {
      this._items.push({
        data: null,
        node: null,
        height: 0,
        width: 0,
        top: 0,
      });
    },

    /**
     * @function addContent
     * @parent i2web/components/infinite-scroll/component
     *
     * Adds the given array of items to the items list and then calls
     * attachContent to update the displayed content.
     * @param {Array<Object>} items The array of items to be added to the infinite
     *     scroller list.
     */
    addContent(items, itemsNeeded) {
      this._requestInProgress = false;
      const startIndex = this._items.length;

      if (startIndex === 0 && items.length) {
        this.viewModel.attr('itemsScrolled', false);
      }

      for (let i = 0; i < items.length; i++) {
        if (startIndex <= this._loadedItems) {
          this._addItem();
        }
        this._items[this._loadedItems++].data = items[i];
      }

      // If the number of items we get back are less our limit, we can safely
      // detach unnecessary items and tombstone nodes.
      if (items.length < Math.min(this.viewModel.limit, itemsNeeded)) {
        this._noMoreContent = true;
        this.detachContent();

        // If we have no items whatsoever, we should just not render anything except
        // a message indicating there are no items to be rendered.
        if (!this._items.length && !items.length) {
          _.forEach(this._scroller.querySelectorAll('li'), (li) => {
            li.remove();
          });
          this.viewModel.attr('itemsScrolled', false);
          this._header.textContent = this.viewModel.attr('noItemsMessage');
        }

        // If there are no items returned from the request, we are out of content
        // ne need to generate tombstones and elements for.
        if (!items.length) {
          return;
        }
      }

      this.attachContent();
    },

    /**
     * @function detachContent
     * @parent i2web/components/infinite-scroll/component
     *
     * Pops off any straggling tombstones that don't need to be rendered anymore
     * and attempts to decently position the scroller again
     */
    detachContent() {
      let height = 0;
      let i = 0;

      for (i = this._items.length - 1; this._items[i] && this._items[i].data === null; i--) {
        const item = this._items.pop();

        if (item.node) {
          this._scroller.removeChild(item.node);
          item.node = null;
          height += (item && item.height) || this._tombstoneSize;
        }
      }

      this._scrollRunwayEnd -= height;
      this._scrollRunway.style.transform = `translate(0, ${this._scrollRunwayEnd}px)`;

      height = 0;

      for (i = this._items.length - 1; this._items[i] && height < window.outerHeight; i--) {
        height += (this._items[i] && this._items[i].height) || this._tombstoneSize;
      }

      // If we're at the top, we don't have to do anything, nice huh?
      if (this._scroller.scrollTop !== 0) {
        const scrollTop = this._items[i] ? this._items[i].top : 0;
        this._scroller.scrollTop = scrollTop;
        this.anchorScrollTop = scrollTop;
        this.anchorItem = {
          index: Math.max(0, i),
          offset: 0,
        };
      }
    },
  },
});
