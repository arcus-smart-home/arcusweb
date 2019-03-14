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
import each from 'can-util/js/each/';
import getIdProps from 'can-connect/helpers/get-id-props';

// makes a clone by wiring all of it's properties to read from ._original[prop]
function makeClone(Type) {
  if (Type.prototype instanceof canMap) {
    const idProp = getIdProps(Type.connection)[0];
    const definition = {
      define: {
        _original: {
          Type,
        },
      },
      save() {
        const data = this.serialize();
        data[idProp] = this._original[idProp];
        this._original.serialize();
        return this._original.constructor.connection.updateData(data).then(() => {
          Type.connection.updatedInstance(this._original, data);
        });
      },
    };

    each(Type.prototype.define, (def, prop) => {
      definition.define[prop] = def;
    });
    const Clone = Type.extend(definition);

    Type.prototype.clone = function clone() {
      const props = this.serialize();
      delete props[idProp];
      props._original = this;
      return new Clone(props);
    };

    return Clone;
  }

  return null;
}

// implemented as a layer overtop of makeClone so that we can easily use it overtop of the can-connect-clonable module if we start using it
// ideally cloned models wouldn't overwrite the '.save()' function for their behavior since it's changing the expectation of how .save() works
// during a rewrite it might also be clearer to modify .clone().save() usages (of which there are only a handful) to handle this explicitly rather than use this wrapper to handle it
export default function makeCloneableWithStrictHandling(Type) {
  const CloneType = makeClone(Type);
  const oldSave = CloneType.prototype.save;

  CloneType.prototype.save = function cloneSaveWithStrictHandling() {
    const p = oldSave.apply(this, arguments);
    return new Promise((resolve, reject) => {
      p.then(function wrapperResolve() { resolve.apply(this, arguments); })
       .catch(function wrapperReject(e) {
         if (e === 'no changes to save') {
           resolve();
         } else {
           reject.apply(this, arguments);
         }
       });
    });
  };
}
