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
import canViewCallbacks from 'can-view-callbacks';
import domEvents from 'can-util/dom/events/events';
import 'can-key-mask';
import 'semantic-ui-sticky/sticky';
import 'semantic-ui-sticky/sticky.css';

/**
 * @module {function} i2web/helpers/sticky-element sticky-element
 * @parent app.helpers
 *
 * @description Fixes an element to the page when it scrolls out of view. By default, it will
 * stick to the body of the page. Should you want to stick to a particular element, you need to
 * provide the selector of the element you wish to stick to.
 *
 * For example, given the following DOM:
 *
 * ```
 * <section class="body">
 *   <header sticky-element="section.body">
 *     <h1>Filters</h1>
 *   </header>
 * </section>
 * <!-- ... //-->
 * <!-- ... //-->
 * <footer>
 * </footer>
 * ```
 *
 * The header element will stick only to the section element with the body class while scrolling
 * and if you scroll past it, it will leave the viewport of the page.
 */
canViewCallbacks.attr('sticky-element', (el) => {
  const context = el.getAttribute('sticky-element') || 'body';
  setTimeout(() => {
    const $placeholder = $(el.getAttribute('sticky-placeholder'));
    $(el).addClass('ui sticky').sticky({
      context,
      observeChanges: true,
    });
    $placeholder.css({
      height: $(el).height(),
      width: $(el).width(),
    });
  }, 100);
});

/**
 * @module {function} i2web/helpers/scroll-to scroll-to
 * @parent app.helpers
 *
 * @description Perfoms scrolling animation to the top of the given element. Supports the following parameter options:
 * - empty, to default 80ms;
 * - static string value, e.g. "250" for 250ms;
 * - scope variable (not observable, is read only once)
 *
 * ```
 * <div scroll-to>Default</div>
 *
 * <div scroll-to="250">Will scroll in 250ms</div>
 *
 * <div scroll-to="scrollTimeout">Will read `scrollTimeout` from the scope</div>
 * ```
 *
 * To perform scrolling only when the given element is off the screen use `scroll-to-if-invisible` flag:
 * ```
 * <div scroll-to="250" scroll-to-if-invisible="true">Scroll only if the element is off the screen</div>
 * ```
 */
canViewCallbacks.attr('scroll-to', (el, attrData) => {
  // TODO: a memory leak here! This attr is being called too many times on user leaving the page, and then
  // when user navigates back N times there is N x handlers existing (like something needs to be unbound).
  // console.log('[attr] scroll-to ...');
  const DEFAULT_TIMEOUT = 80;
  const valueParam = el.getAttribute('scroll-to');
  const shouldCheckVisibility = el.getAttribute('scroll-to-if-invisible') === 'true';
  let timeout;

  // scroll position should account for fixed header at top of the page, else scrolled element
  // will be concealed by the floating headers
  const fixedHeaderHeight = Array.prototype.slice.apply(document.querySelectorAll('arcus-header, .context-bar'))
    .map((header) => { return header.clientHeight; })
    .reduce((ret, val) => { return ret + val; }, 0);

  if (!valueParam) {
    timeout = DEFAULT_TIMEOUT;
  } else if (parseInt(valueParam, 10)) {
    timeout = parseInt(valueParam, 10);
  } else {
    timeout = parseInt(attrData.scope.attr(valueParam), 10) || DEFAULT_TIMEOUT;
  }

  setTimeout(() => {
    // TODO: for now check if the element presents on the page to prevent jumping due to the memory leak (see above).
    if (!el.offsetHeight || (shouldCheckVisibility && el.getBoundingClientRect().top > 0)) {
      return;
    }

    const offsetY = $(el).offset().top - fixedHeaderHeight;
    $('html, body').animate({ scrollTop: offsetY });
  }, timeout);
});

/**
 * @module {function} i2web/helpers/character-count character-count
 * @parent app.helpers
 *
 * @description Displays and limits the amount of characters that can be inputted
 * to the applied input or textarea element. The value passed into the attribute
 * is the number of characters your element can have, at most.
 *
 * This will place a new `p.character-count` element at the bottom of your form
 * element's parent as well as apply a `maxlimit` attribute to the form element
 * with the same value.
 *
 * For example, if you wanted to only allow 500 characters to a text area, you
 * would do the following:
 *
 * ```
 * <div>
 *   <textarea character-count="500" />
 * </div>
 * ```
 *
 * This will render out:
 *
 * ```
 * <div>
 *   <textarea maxlimit="500" character-count="500" />
 *   <p class="character-limit">500 Character Limit</p>
 * </div>
 *
 */
canViewCallbacks.attr('character-count', (el) => {
  let maxCount = +el.getAttribute('character-count') || 25;
  const characterLimit = document.createElement('p');
  const inputElement = el;
  const allowableElements = ['input', 'textarea'];
  const limitText = () => {
    const currentCount = inputElement.value.length;

    if (currentCount > maxCount) {
      inputElement.value = inputElement.value.substring(0, maxCount);
    }
    if (currentCount === 0) {
      characterLimit.textContent = `${maxCount} Character Limit`;
    } else {
      characterLimit.textContent = `${maxCount - currentCount} Characters Remaining`;
    }
  };

  characterLimit.classList.add('character-count');

  // Only set this up for a certain subset of elements.
  if (allowableElements.indexOf(inputElement.tagName.toLowerCase()) !== -1) {
    inputElement.parentNode.appendChild(characterLimit);
    inputElement.setAttribute('maxlength', maxCount);
    inputElement.addEventListener('keydown', limitText);
    inputElement.addEventListener('keyup', limitText);

    limitText();

    domEvents.addEventListener.call(inputElement, 'attributes', (ev) => {
      if (ev.attributeName === 'character-count') {
        maxCount = inputElement.getAttribute('character-count');
        inputElement.setAttribute('maxlength', maxCount);

        limitText();
      }
    });
  }
});
