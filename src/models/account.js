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
 * @module {canMap} i2web/models/account Account
 * @parent app.models
 *
 * Model of a account.
 */
import 'can-map-define';
import 'can-construct-super';
import { ModelConnection } from './base';
import mixinCapabilitiesBase from './mixinCapabilitiesBase';
import makeCloneable from 'i2web/connections/cloneable';
import AccountCapability from 'i2web/models/capability/Account';

const Account = mixinCapabilitiesBase.extend({
  /**
   * @property {Object} i2web/models/account.static.metadata metadata
   *   @option {String} namespace The namespace used for API requests.
   *   @option {String} destination The destination template used for API requests.
   * @parent i2web/models/account.static
   *
   * Cornea connection metadata.
   */
  metadata: {
    namespace: 'account',
    destination: 'SERV:{namespace}:{base:id}',
  },
}, {
  init() {
    this._super(arguments);
    if (!this.attr('base:caps')) {
      this.mixin(AccountCapability);
    }
  },
});

export const AccountConnection = ModelConnection('account', 'base:address', Account);
Account.connection = AccountConnection;
makeCloneable(Account);

export default Account;
