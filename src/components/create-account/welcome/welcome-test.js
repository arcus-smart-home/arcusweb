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

import $ from 'jquery';
import CanMap from 'can-map';
import fixture from 'can-fixture/';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Place from 'i2web/models/place';
import PlaceData from 'i2web/models/fixtures/data/place/place.json';
import './welcome';

let cleanupAfterRender;

const premiumPlace = new Place(PlaceData[0]);
const promonPlace = new Place(PlaceData[3]);

const scope = new CanMap({
  activationAttempts: 0,
  place: premiumPlace,
  subpage: undefined,
});
const appScope = new CanMap({
  supportNumber: '555-555-1212',
});

describe('i2web/components/create-account/welcome', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template: `<arcus-create-account-welcome
        {activation-attempts}="activationAttempts"
        {place}="place"
        {subpage}="subpage"
      />`,
      scope,
      appScope,
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  afterEach(function after(done) {
    cleanupAfterRender().then(() => {
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  describe('rendering', function rendering() {
    it('shall be rendered on the page', function isRendered() {
      assert.isAtLeast($('arcus-create-account-welcome').children().length, 1, 'arcus-create-account-welcome is rendered');
    });
    it('shall render a header of Welcome to Arcus if basic or premium', function basicPremium() {
      scope.attr('place', premiumPlace);

      const shouldBe = 'Home Smart Home. Welcome to Arcus!';
      const is = document.querySelector('arcus-create-account-welcome h1').innerHTML.trim();
      assert.equal(is, shouldBe, 'header is Home Smart Home for basic/premium');
    });
    it('shall render a header of Welcome to Pro Monitoring if promon', function proMon() {
      scope.attr('place', promonPlace);

      const shouldBe = 'Welcome to Professional Monitoring!';
      const is = document.querySelector('arcus-create-account-welcome h1').innerHTML.trim();
      assert.equal(is, shouldBe, 'header welcomes User to promon');
    });
    describe('from web', function fromWeb() {
      it('shall render instructions about device pairing', function devicePairingInstructions() {
        const shouldBe = 'Now that you have created an account, let\'s get your devices set up!';
        const is = document.querySelector('arcus-create-account-welcome .instructions').childNodes[0].wholeText.trim();
        assert.equal(is, shouldBe, 'instructions are about pairing devices');
      });
      it('button shall display correct text', function pairHubButton() {
        const shouldBe = 'Let\'s Get Started';
        const is = document.querySelector('arcus-create-account-welcome button').innerHTML.trim();
        assert.exists(is, 'button exists');
        assert.equal(is, shouldBe, 'button guides the User to pair hub');
      });
      it('shall have a link to route the User to the dashboard', function dashboardLink() {
        const link = document.querySelector('arcus-create-account-welcome a');
        assert.exists(link, 'link to dashboard exists');
        assert.equal(link.innerHTML.trim(), 'Take me to the Dashboard');
      });
    });
    describe('from mobile', function fromMobile() {
      it('shall render instructions about device pairing using mobile device', function devicePairingInstructions() {
        scope.attr('subpage', 'ios');

        const shouldBe = 'Next Step: Return to the Arcus Mobile App to Pair your devices.';
        const is = document.querySelector('arcus-create-account-welcome .instructions').innerHTML.trim();
        assert.equal(is, shouldBe, 'instructions are about pairing devices on mobile device');
      });
      it('button shall display "Return to Mobile App"', function pairHubButton() {
        // scope.attr('subpage', 'ios');

        const shouldBe = 'Return to Mobile App';
        const is = document.querySelector('arcus-create-account-welcome button').innerHTML.trim();
        // assert.exists(is, 'button exists');
        assert.equal(is, shouldBe, 'button guides the User to return to mobile device');
      });
      it('shall NOT show the continue section of the component', function doNotContinue() {
        scope.attr('subpage', 'ios');

        const cont = document.querySelector('arcus-create-account-welcome .continue');
        assert.notExists(cont, 'do not show continue when coming from mobile');
      });
    });
    describe('account activation', function unableToActive() {
      it('shall render a header with Account Problems if activation attempts', function basicPremium() {
        scope.attr('activationAttempts', 1);
        assert.equal(
          document
            .querySelector('arcus-create-account-welcome > h1')
            .innerHTML
            .trim(),
          'Oops',
          'inform the user there are problems with her account'
        );
        assert.equal(
          document
            .querySelector('arcus-create-account-welcome > .instructions')
            .innerHTML
            .trim(),
          'There was a problem activating your account.',
          'inform the user there are problems with her account',
        );
      });
      it('button shall display "Retry"', function pairHubButton() {
        scope.attr('activationAttempts', 1);

        const shouldBe = 'Retry';
        const is = document.querySelector('arcus-create-account-welcome button').innerHTML.trim();
        assert.exists(is, 'button exists');
        assert.equal(is, shouldBe, 'retry to activate the account');
      });
      it('shall render instructions about contacting support', function contactSupport() {
        scope.attr('activationAttempts', 2);

        const supportNumber = document.querySelector('arcus-create-account-welcome .instructions arcus-support-number');
        assert.exists(supportNumber, 'call support if greater than 1 activation attempt');

        const button = document.querySelector('arcus-create-account-welcome button');
        assert.notExists(button, 'button does not exist');
      });
      it('shall NOT show the continue section of the component', function doNotContinue() {
        scope.attr('activationAttempts', 1);

        const cont = document.querySelector('arcus-create-account-welcome .continue');
        assert.notExists(cont, 'do not show continue when there are activation attempts');
      });
    });
  });
});
