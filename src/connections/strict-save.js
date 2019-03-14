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
 * @module {Class} i2web/connections/strict-save strict-save
 * @parent app.connections
 *
 * Implements a can-connect behavior that wraps the underlying save behaviour and presents two different interfaces.
 *
 * The underlying connection rejects a .save() when there are no changes to save, allowing consumers to know when a save
 * request has not actually occurred. This is important when setting a state during a save that awaits a response.
 *
 * However the application has thus far been built to expect such saves to be resolved. In order maintain the behaviour
 * of .save() up until this change, this behaviour wraps the underlying .save() and resolves when the underlying rejects
 * for reason of no changes needing to be saved.
 *
 * This behaviour also exposes a new method, .strictSave() which presents the behavior of the underlying connection.
 * This allows consumers to know when a save request has not actually occurred for reason of lack of changes to be saved.
 * ```
 */
import connect from 'can-connect';

export default connect.behavior('strict-save', function strictSaveBehavior(baseBehavior) {
  const connection = this;
  const strictSave = baseBehavior.save;

  // add strictSave to connection type
  this.Map.prototype.strictSave = function mapStrictSave(resolve, reject) {
    return strictSave.call(connection, this).then(resolve, reject);
  };

  // add strictSave & wrapping save to connection object
  return {
    // resolve when there were no changes to save
    save() {
      return new Promise((resolve, reject) => {
        function wrappingResolve() { resolve.apply(this, arguments); }
        function wrappingReject(e) {
          if (e === 'no changes to save') {
            resolve();
          } else {
            reject.apply(this, arguments);
          }
        }

        strictSave.apply(this, arguments).then(wrappingResolve).catch(wrappingReject);
      });
    },
    strictSave,
  };
});
