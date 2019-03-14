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

import _ from 'lodash';
import config from 'i2web/config';
import fixture from 'can-fixture';
import routerUtils from '../../util';
import productData from 'i2web/models/fixtures/data/product.json';

export default {
  init() {
    const data = _.cloneDeep(productData);

    fixture(`POST ${config.apiUrl}/prodcat/GetProducts`, (request, response) => {
      const correlationId = routerUtils.getCorrelationId(request.data);
      response(200, routerUtils.buildResponse(request, correlationId, {
        attributes: { products: data },
        messageType: 'prodcat:GetProductsResponse',
      }));
    });

    return {
      address: 'SERV:prodcat',
    };
  },
};
