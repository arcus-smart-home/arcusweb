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
 * @module {Object} i2web/cornea/bridge Bridge
 * @parent app.cornea
 *
 * Makes Arcus 2 platform requests.
 */
import $ from 'jquery';
import 'i2web/plugins/jquery.ajax.promise';
import Cornea from './cornea';
import PropertyAliases from './property-aliases';
import config from 'i2web/config';
import _trimEnd from 'lodash/trimEnd';
$.support.cors = true;

/**
 * @function formatMessage
 *
 * Formats a message.
 * @param {String} type The type of the message.
 * @param {String} destination The destination of the message.
 * @param {Object} attrs The parameters/attributes that will be sent with the request.
 * @return {String}
 */
const formatMessage = (type, destination, attrs) => {
  return {
    type,
    headers: {
      isRequest: true,
      destination,
    },
    payload: {
      messageType: type,
      attributes: attrs || {},
    },
  };
};

const Bridge = {
  /**
   * @function request
   *
   * Uses Cornea to make a request. Some properties of model objects use 'reserved'
   * properties, so on sending a request we want to unalias those properties, and
   * when we receive an object from the platform we want to alias those reserved properties.
   * @param {String} type The type of the message.
   * @param {String} destination The destination of the message.
   * @param {Object} attrs The parameters/attributes that will be sent with the request.
   * @return {Promise}
   */
  request: (type, destination, attrs) => {
    const unalias = PropertyAliases.unalias[type];
    if (unalias) {
      unalias(attrs.context);
    }

    const message = formatMessage(type, destination, attrs);
    return Cornea.send(message).then((response) => {
      const alias = PropertyAliases.alias[type];
      if (alias) {
        alias(response);
      }
      return response;
    });
  },
  /**
   * @function restfulRequest
   *
   * Uses AJAX to make a restful request.
   * @param {String} type The type of the message.
   * @param {String} destination The destination of the message.
   * @param {Object} attrs The parameters/attributes that will be sent with the request.
   * @return {Promise}
   */
  restfulRequest: (type, destination, attrs) => {
    const message = formatMessage(type, destination, attrs);

    // TODO: due to a bug in Edge (Access Denied for content-type header) we cannot send `contentType`.
    // Bug is reported here: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10584749/
    // Issue: https://eyeris.atlassian.net/browse/ITWO-9180

    return new Promise((resolve, reject) => {
      $.post({
        url: `${_trimEnd(config.apiUrl, '/')}/${type.replace(':', '/')}`,
        data: JSON.stringify(message),
        dataType: 'json',
        xhrFields: {
          withCredentials: true,
        },
        headers: {
          'X-Client-Version': config.version,
        },
      }).then((res) => {
        resolve(res.payload.attributes);
      }).catch((e) => {
        if (e && e.responseJSON) {
          reject(e.responseJSON.payload.attributes);
        } else {
          reject((e && e.responseText) || e);
        }
      });
    });
  },
};
// Expose bridge globally so you can make requests outside of models.
// This will be removed in production builds by steal
//!steal-remove-start
window.Bridge = Bridge;
//!steal-remove-start

export default Bridge;
