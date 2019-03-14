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
 * @module {Class} i2web/fixtures/router Router
 * @parent app.fixtures
 * @group i2web/fixtures/router.properties 0 properties
 *
 * @signature `new Router()`
 *
 * Creates a router to handle incoming socket messages.
 *
 * ## Use
 *
 * Each incoming message has its destination parsed to determine it's route address.
 * The address is used to lookup the route that will handle the request.
 * For example: A destination of `SERV:person:123` has an address of `SERV:person:`.
 *
 * Each route handler also has a collection of methods that correspond to the types of messages
 * it can handle.
 *
 * ## Adding Routes
 * You add routes to the router using `add()`. When a route is added its `init()` method is used to
 * create an instance of that route. At a minimum the route instance has to specify
 * an `address` that it handles. Any other properties on the instance are considered method handlers.
 *
 * The following route would handle any message with an address of `SERV:myroute:`.
 * The only message type the route handles is `myroute:doStuff`, any other message type
 * will not be handled and result in an error.
 * const myRoute = {
 *   init() {
 *     return {
 *       address: 'SERV:myroute:',
 *       'myroute:doStuff': function() { ... }
 *     };
 *   }
 * };
 * ```
 *
 * ## Shared State
 * Each instance of the `Router` has a `state` Object that can be used to persist
 * values across messages and route instances.
 */

import routerUtils from './util';
import _ from 'lodash';

export default class Router {
  constructor() {
    /**
     * @property {Object} i2web/fixtures/router.properties.routes routes
     *
     * The route handlers this router has.
    */
    this.routes = {};
    /**
     * @property {Object} i2web/fixtures/router.properties.state state
     *
     * A free-for-all Object that can be used to share stateful information with route handlers.
    */
    this.state = {};
  }
  /** @prototype */
  /**
   * @function add
   *
   * Adds a route instance.
   * @param {i2web/fixtures/route} route The handler
   */
  add(route) {
    const addRoute = (inst, addr) => {
      this.routes[addr] = {
        module: route,
        route: inst,
      };
    };

    const instance = route.init();
    if (_.isArray(instance.address)) {
      instance.address.forEach((address) => {
        addRoute(instance, address);
      });
    } else {
      addRoute(instance, instance.address);
    }

    this.routes[instance.address] = {
      module: route,
      route: instance,
    };
  }
  /**
   * @function get
   *
   * Retrieves a route instance by its address.
   * @param {String} destination The destination of the message
   * @return {i2web/fixtures/route}
   */
  get(destination) {
    const routeAddress = routerUtils.getRouteAddress(destination);
    return routeAddress && this.routes[routeAddress] && this.routes[routeAddress].route;
  }
  /**
   * @function reset
   *
   * Resets all route instances.
   * @param {String} destination The destination of the message
   * @return {i2web/fixtures/route}
   */
  reset() {
    _.each(this.routes, (route) => {
      route.route = route.module.init();
    });
  }
  /**
   * @function handleMessage
   *
   * Route a message to its handler and return the formatted response.
   * @param {Object} message
   * @return {Object}
   */
  handleMessage(message) {
    let messageObj = {};
    try {
      messageObj = JSON.parse(message);
    } catch (e) {
      // TODO: Send back an error
      return undefined;
    }

    const destination = routerUtils.getDestination(messageObj);
    const method = routerUtils.getMethod(messageObj);
    const correlationId = routerUtils.getCorrelationId(messageObj);
    const attributes = routerUtils.getAttributes(messageObj);
    let response = {};

    const route = this.get(destination);

    if (route && route[method]) {
      response = route[method].call(this, attributes);
    }

    // If the destination does not have a handler, close the connection
    if (!route) {
      console.warn(`No route found for ${destination}:${method}`);
      // Curtis: If this happens in a test, the rest of the WS requests
      // will go to a real URL. So we settle for a warning
      return routerUtils.buildResponse(messageObj, null, routerUtils.notImplemented());
    }

    // If the type of message is not supported, respond with an Error
    if (!route[method]) {
      response = {
        messageType: 'Error',
        attributes: {
          code: 'UnsupportedMessageType',
          message: 'Driver was unable to handle the message',
        },
      };
    }
    return routerUtils.buildResponse(messageObj, correlationId, response);
  }
}
