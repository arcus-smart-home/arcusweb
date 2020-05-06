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

import canMap from 'can-map';
import addAppState from 'i2web/test/util/addAppState';
import renderTemplate from 'i2web/test/util/renderTemplate';
import stache from 'can-stache';
import fixture from 'can-fixture/';
import 'i2web/models/fixtures/';
import auth from 'i2web/models/auth';
import appViewModel from 'i2web/app';
import PlaceManager from 'i2web/models/place-manager';
import Cornea from 'i2web/cornea/';
import 'i2web/plugins/debug';
import types from 'can-types';
import userData from 'i2web/models/fixtures/data/user.json';

types.DefaultMap = canMap;

const defaults = {
  fixtures: true,
  isPublic: false,
  renderTo: 'body', // any jQuery selector will work
  template: stache('<strong>{{message}}</strong>'), // Can be an element ID, text or stache template
  scope: {},
  appScope: {},
  username: userData[0].username,
  password: userData[0].password,
};

export default function loginAndRender(options) {
  const config = Object.assign(defaults, options);

  // setup appState
  let appState = new canMap(config.appScope);
  if (!config.fixtures) {
    appState = new appViewModel(config.appScope);
  }

  const cleanupAppState = addAppState(appState);
  const { render, cleanupRender } = renderTemplate(config.renderTo, config.template, config.scope);

  // Make sure fixtures are on
  fixture.on = config.fixtures;

  const cleanup = function cleanup() {
    return new Promise((resolve) => {
      cleanupAppState();
      cleanupRender();
      auth.once('authentication:logout', () => {
        fixture.reset();
        Cornea.removeAllListeners();
        resolve();
      });
      auth.logout();
    });
  };

  return steal.done().then(() => {
    // Since we might use this in a beforeEach, check if we
    // are authenticated before attempting to authenticate
    if (auth.authenticated) {
      render(config);
      return Promise.resolve({ cleanup, appState });
    }

    return new Promise((resolve, reject) => {
      auth.once('authentication:success', (sessionObject) => {
        const session = new canMap(sessionObject);
        const renderAndResolve = () => {
          render(config);
          resolve({ cleanup, appState });
        };

        if (!config.fixtures) {
          PlaceManager.activePlaceFromSession(session)
            .then(() => {
              renderAndResolve();
            })
            .catch(() => {
              console.error(arguments);
            });
        } else {
          renderAndResolve();
        }
      });

      auth.authenticate().catch(() => {
        auth.login(config.username, config.password, config.isPublic).catch(() => {
          reject(cleanup);
        });
      });
    });
  });
}
