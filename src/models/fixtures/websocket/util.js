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
 * @module {Object} i2web/fixtures/router-utils Router Utilities
 * @parent app.fixtures
 *
 * A collection of utilities for fixture routing.
 */
const routerUtils = {
  /**
   * @function emptyResponse
   *
   * An empty response. Signifies a successful request where no response is needed.
   * @return {Object}
   */
  emptyResponse() {
    return {
      messageType: 'EmptyMessage',
      attributes: {},
    };
  },
  /**
   * @function closeResponse
   *
   * A response that will make the server close the socket connection with event code 1006.
   * @return {Object}
   */
  closeResponse() {
    return {
      messageType: 'close',
      attributes: {
        code: 1006,
      },
    };
  },
  /**
   * @function notFoundResponse
   *
   * A response for when a resource cannot be found.
   * @return {Object}
   */
  notFoundResponse() {
    return this.closeResponse();
  },
  /**
   * @function nullPointerResponse
   *
   * A response for NullPointerException.
   * @return {Object}
   */
  nullPointerResponse() {
    return {
      messageType: 'Error',
      attributes: {
        code: 'NullPointerException',
        message: 'NullPointerException',
      },
    };
  },
  /**
   * @function notImplemented
   *
   * A response for any fixture methods that are not implemented.
   * @return {Object}
   */
  notImplemented() {
    return {
      messageType: 'Error',
      attributes: {
        code: 'not.implemented',
        message: `The fixture for this request has not been implemented yet`,
      },
    };
  },
  /**
   * @function requestDetinationNotFound
   *
   * A response for when a destination cannot be found.
   * @param {Object} destination The origination message destination.
   * @return {Object}
   */
  requestDestinationNotFound(destination) {
    return {
      messageType: 'Error',
      attributes: {
        code: 'request.destination.notfound',
        message: `No object addressed [${destination}] was found`,
      },
    };
  },
  /**
   * @function buildResponse
   *
   * Takes a raw response and formats it.
   * @param {Object} request The original request.
   * @param {String} correlationId The original correlation id.
   * @param {String} responseData The response.
   * @return {Object}
   */
  buildResponse(request, correlationId, responseData) {
    const response = {
      headers: {
        isRequest: false,
        source: this.getDestination(request),
      },
      payload: responseData,
      type: responseData.messageType,
    };

    if (correlationId) {
      response.headers.correlationId = correlationId;
    }

    return response;
  },
  /**
   * @function getDestination
   *
   * Extracts the destination from a message.
   * @param {Object} message A message object.
   * @return {String}
   */
  getDestination(message) {
    return message.headers.destination;
  },
  /**
   * @function getMethod
   *
   * Extracts the method from a message.
   * @param {Object} message A message object.
   * @return {String}
   */
  getMethod(message) {
    return message.type;
  },
  /**
   * @function getAttributes
   *
   * Extracts the attributes from a message.
   * @param {Object} message A message object.
   * @return {String}
   */
  getAttributes(message) {
    const attributes = {};
    const destinationParts = message.headers.destination.split(':');
    if (destinationParts.length === 3) {
      attributes.id = destinationParts[2];
    }
    Object.assign(attributes, message.payload.attributes);
    return attributes;
  },
  /**
   * @function getCorrelationId
   *
   * Extracts the correlation id from a message.
   * @param {Object} message A message object.
   * @return {String}
   */
  getCorrelationId(message) {
    return message.headers.correlationId;
  },
  /**
   * @function getRouteAddress
   *
   * Creates a route address from a message destination.
   * @param {String} destination A message destination.
   * @return {String}
   */
  getRouteAddress(destination) {
    const parts = destination.split(':');
    let address = `${parts[0]}:${parts[1]}`;
    // Remove the trailing `:` if there is no id
    // This prevents conflicts between services and API like SERV:person.
    if (parts[2] !== '') {
      address += ':';
    }
    return address;
  },
};

export default routerUtils;
