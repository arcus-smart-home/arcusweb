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

/**
 * @module {Class} i2web/cornea/backoff Backoff
 * @parent app.cornea
 *
 * Implements an exponential backoff algorithm.
 * Tries to invoke `callback` after `initial` ms, doubling the time it waits until it
 * reaches `max`.
 * It is the responsibility of the client to cancel the backoff if the `callback` suceeds in what it is trying to do.
 *
 * @group i2web/cornea/backoff.properties 0 properties
 *
 * @signature new Backoff(options)
 *
 * @param {Object} options
 *   @option {Number} [initial=100] The initial backoff time in ms.
 *   @option {Number} [max=10000] The maximum backoff time in ms.
 *   @option {Function} [callback=function(){}] The callback to invoke on each timeout.
 */
const defaults = {
  initial: 100,
  max: 30 * 1000, // 30 seconds max
  callback() {},
};

/**
 * @property {Number} i2web/cornea/backoff.properties.timeout timeout
 * @parent i2web/cornea/backoff.properties
 *
 * The current timer id.
 **/
/**
 * @property {Boolean} i2web/cornea/backoff.properties.cancelled cancelled
 * @parent i2web/cornea/backoff.properties
 *
 * Whether the backoff has been cancelled.
 **/
/**
 * @property {Number} i2web/cornea/backoff.properties.delay delay
 * @parent i2web/cornea/backoff.properties
 *
 * The current delay.
 **/

export default class Backoff {
  constructor(options) {
    this.options = Object.assign(defaults, options);
    this.timeout = null;
    this.cancelled = false;
    this.delay = null;
  }
/** @prototype */

  /**
   * @function log
   *
   * Log a message to the console if not in production.
   */
  log(...args) {
    if (!System.isEnv('production')) {
      args.unshift('Cornea Backoff:');
      console.log(...args); // eslint-disable-line no-console
    }
  }

  /**
   * @function start
   *
   * Start the backoff algortihm.
   */
  start() {
    this.log('Starting');
    this.cancelled = false;
    this.continue();
  }

  /**
   * @function cancel
   *
   * Cancel the backoff algortihm.
   */
  cancel() {
    this.log('Cancelling');
    this.cancelled = true;
    this.reset();
  }

  /**
   * @function reset
   *
   * Clear the current timeout.
   */
  reset() {
    this.delay = null;
    clearTimeout(this.timeout);
    this.timeout = null;
  }

  /**
   * @function getDelay
   *
   * Compute the new backoff delay.
   */
  getDelay() {
    const newDelay = this.delay ? this.delay * 2 : this.options.initial;
    this.delay = newDelay < this.options.max ? newDelay : this.options.max;
    return this.delay;
  }

  /**
   * @function continue
   *
   * Invokes callback and continues the timer.
   * Called after each timeout.
   */
  continue() {
    if (this.cancelled) {
      return;
    }

    const cb = this.options.callback;
    const baseDelay = this.getDelay();
    const offset = baseDelay * 0.2;

    // set the delay to the base backed-off delay time +- 20%
    // calculated as (random * (max - min)) + min
    // example: 10s delay, 2s offset
    // delay = (random * (12 - 8)) + 8 = (random * 4) + 8 = random value between 0+8 to 4+8 = random value between 8 and 12
    const delay = (Math.random() * ((baseDelay + offset) - (baseDelay - offset))) + (baseDelay - offset);

    this.log('Invoking callback in', delay, 'ms');
    this.timeout = setTimeout(() => {
      cb();
    }, delay);
  }
}
