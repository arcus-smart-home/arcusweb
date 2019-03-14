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
 * @page i2web/fixtures/session Session
 * @parent app.fixtures
 *
 * Fixtures for the `login` and `logout` endpoints.
 */
import fixture from 'can-fixture';
import _ from 'lodash';
import config from 'i2web/config';
import cookieUtils from 'i2web/test/util/cookie';
import userData from './data/user.json';

fixture(`POST ${config.apiUrl}/login`, (request, response) => {
  const user = _.find(userData, ['username', request.data.user]);

  if (!user || user.password !== request.data.password) {
    response(401);
  } else {
    cookieUtils.create('arcusAuthTokenFixture', user.token);
    response(200, { status: 'success' });
  }
});

fixture(`POST ${config.apiUrl}/logout`, (request, response) => {
  cookieUtils.delete('arcusAuthTokenFixture');
  response(401);
});
