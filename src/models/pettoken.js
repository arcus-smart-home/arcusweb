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

import CanMap from 'can-map';
import CanList from 'can-list';
import Observation from 'can-observation';
import isString from 'lodash/isString';

// create a getter that is a proxy to a property on the pet door device
function createPetTokenGetter(prop) {
  return function pettokenGetter() {
    return this.attr(`device.pettoken:${prop}:pt${this.pettokenIndex}`);
  };
}

// create a setter that is a proxy to a property on the pet door device
function createPetTokenSetter(prop) {
  return function pettokenSetter(value) {
    return this.attr(`device.pettoken:${prop}:pt${this.pettokenIndex}`, value);
  };
}

const petNameSetter = createPetTokenSetter('petName');
const petNameGetter = createPetTokenGetter('petName');

const PetToken = CanMap.extend({
  define: {
    // the id of this pettoken; used in removal
    tokenId: {
      get: createPetTokenGetter('tokenId'),
    },
    // the number of this pettoken; unique number between 1 and number of tokens supported by device
    tokenNum: {
      get: createPetTokenGetter('tokenNum'),
    },
    // the paired state of this pettoken
    paired: {
      get: createPetTokenGetter('paired'),
    },
    // the pet name assigned this pettoken
    petName: {
      get() {
        const value = petNameGetter.call(this);
        return isString(value) && value.length > 0 ? value : `Smart Key ${this.pettokenIndex}`;
      },
      set(newVal) {
        const value = isString(newVal) && newVal.length > 0 ? newVal : `Smart Key ${this.pettokenIndex}`;
        petNameSetter.call(this, value);
      },
    },
  },
});

const PetTokenList = CanList.extend({
  Map: PetToken,

  // get a new PetTokenList that is a proxy for all the pettoken properties on the device
  fromPetDoor(device) {
    const pettokenCount = device.attr('petdoor:numPetTokensSupported');

    if (!pettokenCount) { return null; }

    // get list of pettokens
    const pettokens = new Array(pettokenCount).fill().map((val, i) => {
      return {
        pettokenIndex: i + 1,
        device,
      };
    });

    let pettokenList;
    // ignore unneeded observations created during initial list sort
    // prevents this observations including the value returned from being regenerated when sortIndex changes
    Observation.ignore(() => {
      // create list of pet token models
      pettokenList = new PetTokenList(pettokens);
    })();

    return pettokenList;
  },
}, {
  comparator: 'petName',
});

export { PetTokenList, PetToken, PetToken as default };
