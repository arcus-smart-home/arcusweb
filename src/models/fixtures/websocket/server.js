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
 * @module {Function} i2web/fixtures/server Server
 * @parent app.fixtures
 *
 * @signature `startServer()`
 * @return {SocketFixture}
 * Creates a new SocketFixture that can handle incoming messages.
 *
 * ## Use
 * Call the `startServer` function to create a new `Server` which is just an instance
 * of `SocketFixture` with an instance of `Router` that can handle messages.
 *
 * To turn of the fixture call the `stop` method of the returned `SocketFixture`.
 *
 * ```
 * let fixture = startServer();
 * // later...
 * fixture.stop();
 * ```
 *
 * ## onConnection
 * When the client first connects to the server, they will get a `SessionCreated` event
 *
 * ## onMessage
 * When the server receives a message, we defer the handling of that to the router.$
 * The server will either close the connection or send back a response.
 *
 * ## verifyClient
 * Check if there is an auth token cookie
 */
import _ from 'lodash';
import config from 'i2web/config';
import SocketFixture from '../mock-socket/fixture';
import Router from './router';
import cookieUtils from 'i2web/test/util/cookie';
import userData from '../data/user.json';

// base models
import accountRoutes from './routes/account';
import deviceRoutes from './routes/device';
import incidentRoutes from './routes/incident';
import personRoutes from './routes/person';
import placeRoutes from './routes/place';
import promonRoutes from './routes/pro-monitoring-settings';
import ruleRoutes from './routes/rule';
import sceneRoutes from './routes/scene';
import subsystemRoutes from './routes/subsystem';

// services
import personServiceRoutes from './routes/service/PersonService';
import productCatalogRoutes from './routes/service/ProductCatalogService';
import promonServiceRoutes from './routes/service/ProMonitoringService';
import ruleServiceRoutes from './routes/service/RuleService';
import sceneServiceRoutes from './routes/service/SceneService';
import schedulerServiceRoutes from './routes/service/SchedulerService';
import sessionServiceRoutes from './routes/service/SessionService';
import subsystemServiceRoutes from './routes/service/SubsystemService';
import videoServiceRoutes from './routes/service/videoService';

function startServer() {
  const router = new Router();

  // base models
  router.add(accountRoutes);
  router.add(deviceRoutes);
  router.add(incidentRoutes);
  router.add(personRoutes);
  router.add(placeRoutes);
  router.add(promonRoutes);
  router.add(ruleRoutes);
  router.add(sceneRoutes);
  router.add(subsystemRoutes);

  // services
  router.add(personServiceRoutes);
  router.add(productCatalogRoutes);
  router.add(promonServiceRoutes);
  router.add(ruleServiceRoutes);
  router.add(sceneServiceRoutes);
  router.add(schedulerServiceRoutes);
  router.add(sessionServiceRoutes);
  router.add(subsystemServiceRoutes);
  router.add(videoServiceRoutes);

  // Create a SocketFixture
  const fixture = new SocketFixture(`${config.wsUrl}/websocket?v=${config.version}`, {
    onConnection: function onConnect(server) {
      const token = cookieUtils.read('arcusAuthTokenFixture');
      const sessionData = _.find(userData, ['token', token]).session;

      router.state.currentToken = token;
      router.state.currentPerson = sessionData.personId;

      // Allow Cornea to set the onmessage handler before sending the first message
      setTimeout(() => {
        server.send(JSON.stringify({
          type: 'SessionCreated',
          headers: {},
          payload: {
            messageType: 'SessionCreated',
            attributes: sessionData,
          },
        }));
      }, 5);
    },
    onMessage: function onMessage(message) {
      const response = router.handleMessage(message);

      // If router tells us to close the connection, we do so
      if (response.type === 'close') {
        this.close({
          code: response.payload.attributes.code || 1006,
        });
      }

      // Otherwise we send back the response
      this.send(JSON.stringify(response));
    },
    config: {
      verifyClient: () => {
        return !!cookieUtils.read('arcusAuthTokenFixture');
      },
    },
  });
  fixture.reset = router.reset.bind(router);
  return fixture;
}

export default startServer;
