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

import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import view from './terms.stache';
import Errors from 'i2web/plugins/errors';
import Person from 'i2web/models/person';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {canMap} session
     * @parent i2web/components/terms
     *
     * current session, based on person. When session ends, person is removed as well
     */
    session: {
      Type: canMap,
    },
    /**
     * @property {Person} person
     * @parent i2web/components/terms
     *
     * The default person.
     */
    person: {
      Type: Person,
    },
    /**
     * @property {Boolean} showTermsPopup
     * @parent i2web/components/terms
     *
     * Whether to show the Terms popup
     */
    showTermsPopup: {
      get() {
        const session = this.attr('session');
        if (session) {
          // only show the terms popup if requires consent is true for either privacy or TaC
          return session.attr('requiresPrivacyPolicyConsent') || session.attr('requiresTermsAndConditionsConsent');
        }
        return false;
      },
    },
    /**
     * @property {Boolean} acceptingTerms
     * @parent i2web/components/terms
     *
     * Whether the user is in the process of accepting the terms and privacy policy
     */
    acceptingTerms: {
      value: false,
    },
  },
  /**
  * @function acceptTerms
  * @parent i2web/components/terms
  *
  * Accept the Terms and Privacy policy
  */
  acceptTerms(vm, el, ev) {
    ev.preventDefault();
    this.attr('acceptingTerms', true);
    const promises = [];
    promises.push(this.attr('person').AcceptPolicy('PRIVACY'));
    promises.push(this.attr('person').AcceptPolicy('TERMS'));

    // handle errors around term acceptance
    Promise.all(promises).then(() => {
      this.attr('acceptingTerms', false);
      // we don't receive change events for the session, so manually set these to false
      this.attr('session').attr('requiresPrivacyPolicyConsent', false);
      this.attr('session').attr('requiresTermsAndConditionsConsent', false);
    }).catch(e => Errors.log(e, true));
  },
});

export default Component.extend({
  tag: 'arcus-terms',
  viewModel: ViewModel,
  view,
});
