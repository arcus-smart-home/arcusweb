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
import routerUtils from '../util';

export default function mixinBase(data) {
  return {
    'base:GetAttributes': function baseGetAttributes(params) {
      const entity = _.find(data, ['base:id', params.id]);
      if (!entity) {
        return routerUtils.requestDestinationNotFound(params.id);
      }

      return {
        messageType: 'base:GetAttributesResponse',
        attributes: entity,
      };
    },
    'base:SetAttributes': function baseSetAttributes(params) {
      const entity = _.find(data, ['base:id', params.id]);
      if (!entity) {
        return routerUtils.requestDestinationNotFound(params.id);
      }

      Object.assign(entity, _.omit(params, ['id']));

      return routerUtils.emptyResponse();
    },
    'base:AddTags': function baseAddTags(params) {
      const entity = _.find(data, ['base:id', params.id]);
      if (!entity) {
        return routerUtils.requestDestinationNotFound(params.id);
      }

      Array.prototype.push.apply(entity['base:tags'], params.tags);

      return routerUtils.emptyResponse();
    },
    'base:RemoveTags': function baseRemoveTags(params) {
      const entity = _.find(data, ['base:id', params.id]);
      if (!entity) {
        return routerUtils.requestDestinationNotFound(params.id);
      }

      entity['base:tags'] = entity['base:tags'].filter((tag) => {
        return params.tags.indexOf(tag) === -1;
      });

      return routerUtils.emptyResponse();
    },
  };
}
