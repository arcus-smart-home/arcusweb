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
 * @module {Class} i2web/cornea/library Library
 * @parent app.cornea
 *
 * WebSocket library for communicating with the Arcus 2 platform.
 * Will actively try to reconnect using exponential backoff if the connection is not cleanly closed.
 * Extends EventEmmiter.
 *
 * @group i2web/cornea/library.properties 0 properties
 */
import nodeUuid from 'node-uuid';
import events from 'events';
import Backoff from './backoff';
import { isMobileSafari, isDesktopSafari, desktopSafariVersion } from 'i2web/helpers/global';
import $ from 'jquery';

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/*
 * Safari 10.1.0 and 10.1.1 has a buffering issue with Websockets
 * and cannot handle a large number of request messages added
 * synchronously.  For those platforms, queue the addition of
 * all messages with jQuery.queue(); for all other platforms,
 * send requests synchronously for best performance.
 */
const queueIfPlatformRequires = (() => {
  const queue = (execFn) => {
    $(window).queue((next) => {
      execFn();
      setTimeout(next, 1);
    });
  };

  if (isDesktopSafari()) {
    const [major, minor, patch] = desktopSafariVersion().split('.');
    if (+major === 10 && +minor === 1 && (!patch || +patch === 1)) {
      return queue;
    }
  }
  if (isMobileSafari()) {
    return queue;
  }
  return execFn => execFn();
})();


/**
 * @property {Promise} i2web/cornea/library.properties.connected connected
 * @parent i2web/cornea/library.properties
 *
 * Whether the WebSocket is connected.
 **/
/**
 * @property {Object} i2web/cornea/library.properties.connectionPromise connectionPromise
 * @parent i2web/cornea/library.properties
 *
 * Stores the resolve/reject functions for the connected Promise.
 **/
/**
 * @property {WebSocket} i2web/cornea/library.properties.socket socket
 * @parent i2web/cornea/library.properties
 *
 * The current WebSocket instance.
 **/
/**
 * @property {Boolean} i2web/cornea/library.properties.reconnecting reconnecting
 * @parent i2web/cornea/library.properties
 *
 * Whether the library is attempting to reconnect.
 **/
/**
 * @property {Boolean} i2web/cornea/library.properties.connecting connecting
 * @parent i2web/cornea/library.properties
 *
 * Whether the WebSocket is connecting.
 **/
/**
 * @property {Boolean} i2web/cornea/library.properties.wasConnected wasConnected
 * @parent i2web/cornea/library.properties
 *
 * Whether the WebSocket is wasConnected at some point.
 * Useful for determining if reconnection should happen.
 **/
/**
 * @property {i2web/cornea/backoff} i2web/cornea/library.properties.backoff backoff
 * @parent i2web/cornea/library.properties
 *
 * Controls the reconnection backoff.
 **/
/**
 * @property {Object} i2web/cornea/library.properties.requests requests
 * @parent i2web/cornea/library.properties
 *
 * Map that tracks all active requests.
 **/
class Cornea extends events.EventEmitter {
  /** @prototype */
  constructor() {
    super();
    // Can be set to 0 to allow for unlimited number of listeners per a single event; set to 50 initially
    // https://nodejs.org/docs/latest-v5.x/api/events.html#events_emitter_setmaxlisteners_n
    this.setMaxListeners(50);
    this.resetState();
  }

  /**
   * @function resetState
   *
   * Resets the internal state of Cornea.
   */
  resetState() {
    this.id = null;
    this.connected = null;
    this.connectionPromise = null;
    this.socket = null;
    this.reconnecting = null;
    this.connecting = null;
    this.wasConnected = false;
    this.backoff = null;
    this.requests = {};
  }

  /**
   * @function initialize
   *
   * Begins the WebSocket connection process.
   * @param {String} url The WebSocket url.
   */
  initialize(url) {
    if (typeof url !== 'string') {
      throw new Error('URL must be defined to establish a web socket connection');
    }

    if (!('WebSocket' in window && window.WebSocket !== undefined)) {
      throw new Error('WebSockets not supported in the current browser. Please update your browser to a newer version.');
    }

    if (!this.backoff) {
      this.backoff = new Backoff({
        initial: 100,
        max: 30000,
        callback: this.connect.bind(this),
      });
    }

    this.url = url;

    // If there is already a connection open, close it and let this new one happen
    if (!this.socket) {
      this.connect();
    }
    return this.connected;
  }
  /**
   * @function log
   *
   * Log a message to the console if not in production.
   */
  log(type, ...args) {
    if (!System.isEnv('production')) {
      args.unshift(`Cornea ${type}`);
      console.log(...args); // eslint-disable-line no-console
    }
  }
  /**
   * @function connect
   *
   * Attempt to connect to the url provided.
   * If the connection is successful event handlers are attached to the WebSocket instance.
   * @return {Promise} deferred that will resolve with the WebSocket instance when successful.
   */
  connect() {
    const url = this.url;

    this.log('Connecting...');
    this.connecting = true;

    if (!this.connected) {
      this.connected = new Promise((resolve, reject) => {
        this.connectionPromise = {
          resolve,
          reject,
        };
      });
    }
    this.socket = new window.WebSocket(url);

    this.socket.onopen = () => {
      this.connectionPromise.resolve();
      this.onOpen();
    };

    this.socket.onerror = (ev) => {
      if (this.connectionPromise) {
        this.connectionPromise.reject();
      }
      this.onError(ev);
    };

    // Setup event handling
    ['close', 'message'].forEach((name) => {
      this.socket[`on${name}`] = this[`on${capitalize(name)}`].bind(this);
    });

    return this.connected.then(this.onConnected.bind(this));
  }

  /**
   * @function onConnected
   *
   * Called when the WebSocket instance is connected.
   * Stops reconnection process (if active).
   */
  onConnected() {
    this.log('Connected!');
    this.connecting = false;
    this.stopReconnect();
  }

  /**
   * @function stopReconnect
   *
   * Cancels the backoff and clears the reconnecting flag.
   */
  stopReconnect() {
    this.reconnecting = false;
    if (this.backoff) {
      this.backoff.cancel();
    }
  }

  /**
   * @function reconnect
   *
   * Attempts to reconnect to the web scoket API using an exponential backoff.
   */
  reconnect() {
    if (this.reconnecting) {
      return;
    }
    this.reconnecting = true;
    this.log('Attempting to reconnect...');
    this.backoff.start();
  }

  /**
   * @function send
   *
   * Sends a message via the WebSocket instance.
   * Stringifies JSON payloads.
   * @param {String|Object} msg payload to send to server.
   * @param {Promise} deferred representing the status of sending the message.
   */
  send(msg) {
    return new Promise((resolve, reject) => {
      const socket = this.socket;
      // The socket hasn't been created if we entered in an invalid URL. But
      // we also want to make sure the state of the socket is one that can
      // send messages.
      if (!socket || socket.readyState !== window.WebSocket.OPEN) {
        // We could queue messages to be sent when a connection is re-established
        const errorMessage = this.getErrorMessage(`Wait a moment... we're getting things ready for you.`, msg);
        reject(errorMessage.payload.attributes);
        return;
      }
      this.connected.then(() => {
        const uuid = nodeUuid.v1();
        const currentId = this.id;
        msg.headers.correlationId = uuid;
        this.requests[uuid] = {
          resolve,
          reject,
          timeout: setTimeout(() => {
            // Only reject if the connection that made the request is still open
            if (this.id === currentId) {
              const timeoutMessage = this.getErrorMessage('Oops, there seems to be a problem connecting right now.', msg);
              reject(timeoutMessage.payload.attributes);
            }
          }, this.timeout),
        };
        this.log(`--> ${msg.type}`, msg);
        const payload = typeof msg === 'object' ? JSON.stringify(msg) : msg;

        queueIfPlatformRequires(() => {
          try {
            socket.send(payload);
          } catch (e) {
            this.log('Error', e);
            reject(e);
          }
        });
      }).catch(e => reject(e));
    });
  }

  /**
   * @function close
   *
   * Close the connection.
   */
  close() {
    this.log('Closing Connection');
    this.stopReconnect();

    if (!this.socket) {
      return;
    }
    this.socket.close();
  }

  /**
   * @function onOpen
   *
   * onopen handler of the WebSocket instance.
   */
  onOpen() {
    this.id = nodeUuid.v1();
    this.wasConnected = true;
    this.log('Connected');
  }

  /**
   * @function getEventSubject
   *
   * Parse the source for the id, namespace and address of an object.
   * @param {String} source.
   * @return {Object}
   */
  getEventSubject(source) {
    if (!source) {
      return null;
    }
    const parts = source.split(':');

    // the hub has the id structure of SERV:LWF-5229:hub
    // so we need to adjust the parts
    if (parts[0] === 'SERV' && parts[2] === 'hub') {
      return {
        id: parts[1],
        namespace: parts[2],
        address: source,
      };
    }

    // the namespace of a subsystem is its group name
    // therefore we need to check if the namespace starts with sub or
    // is cellbackup (since it doesn't start with sub)
    if (parts[1].indexOf('sub') === 0 || parts[1] === 'cellbackup') {
      parts[1] = 'sub';
    }

    return {
      id: parts[2],
      namespace: parts[1],
      address: source,
    };
  }

  /**
   * @function onMessage
   *
   * onmessage handler for the WebSocket instance.
   * Emits an event with the payload (parsed JSON or String).
   * @param {MessageEvent} ev
   */
  onMessage(ev) {
    if (!this.socket) {
      return;
    }

    // Crude check to see if payload is JSON or a String
    const message = ev.data[0] === '{' || ev.data[0] === '[' ? JSON.parse(ev.data) : ev.data;

    this.log(`<-- ${message.type}`, message);

    const eventType = message.type;
    const subject = this.getEventSubject(message.headers.source);
    const uuid = message.headers.correlationId;
    const request = this.requests[uuid];
    if (request) {
      if (eventType === 'Error') {
        if (message.payload.code === 'error.unauthorized') {
          this.emit('sess unauthorized', {});
        }
        request.reject(message.payload.attributes);
      } else {
        clearTimeout(request.timeout);
        request.resolve(message.payload.attributes);
      }
    }

    if (subject) {
      this.emit(`${subject.namespace} ${eventType}`, Object.assign({ 'base:address': subject.address }, message.payload.attributes));
    } else {
      this.emit(eventType, message.payload.attributes);
    }
  }

  /**
   * @function onError
   *
   * onerror handler for the WebSocket instance.
   * @param {Event} ev
   */
  onError(ev) {
    this.log('Error', ev);
  }

   /**
   * @function getTimeoutMessage
   *
   * Return a formatted message.
   * @param {Object} originalMessage The request that has caused the error.
   * @return {Object}
   */
  getErrorMessage(errorMessage, originalMessage) {
    return {
      type: 'Error',
      headers: {
        isRequest: false,
        destination: originalMessage.headers.destination,
      },
      payload: {
        messageType: 'Error',
        attributes: {
          type: 'Error',
          message: errorMessage,
        },
      },
    };
  }

  /**
   * @function onClose
   *
   * Handles the closing of the socket connection.
   * Attempts to reconnect if the closure was unclean.
   * @param {CloseEvent} ev
   */
  onClose(ev) {
    this.log('Connection Closed', ev);
    this.emit('WebSocketClosed', ev);
    this.connected = false;

    // 1000 means a normal close, 4001 means session ended
    // anything else is abnormal and triggers a reconnection
    if (![1000, 4001].includes(ev.code)) {
      if (this.reconnecting) {
        // Continuing trying to reconnect
        this.backoff.continue();
      } else if (this.wasConnected) {
        // Try to reconnect if we are not already
        this.reconnect();
      } else {
        this.cleanup();
      }
    } else {
      this.cleanup();
      if (ev.code === 4001) {
        this.emit('sess unauthorized');
      }
    }
  }

  /**
   * @function cleanup
   *
   * Closes the current WebSocket and cleans up the properties used to track state.
   */
  cleanup() {
    this.close();
    this.resetState();
  }
}

const instance = new Cornea();
instance.timeout = 50 * 1000;

export default instance;
