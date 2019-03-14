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

import assert from 'chai';
import F from 'funcunit';
import loginAndRender from 'i2web/test/util/loginAndRender';
import { ViewModel } from './wizard';
import $ from 'jquery';
import canMap from 'can-map';
import 'i2web/app.less';
import 'can-stache-converters';

const template = `<arcus-wizard {initial-step}="1">
    <arcus-wizard-step header="Professional Monitoring Signup" {is-satisfied}="true" {next-button-label}="'Begin'">
      This is the content for step 1.
    </arcus-wizard-step>
    <arcus-wizard-step header="Confirm Your Address" {is-satisfied}="step2Complete" {next-button-label}="'Next'" {prev-button-label}="'Prev'">
      <input type="checkbox" id="confirmAddress" {($checked)}="equal(~step2Complete, true)">
      <label for="confirmAddress">I confirm the address above is a residential property.</label>
    </arcus-wizard-step>
    <arcus-wizard-step header="Congratulations, You're Done!" {has-no-nav}="true">
      This is the content for step 3.
    </arcus-wizard-step>
  </arcus-wizard>`;
const vm = new ViewModel({
  step2Complete: false,
});
let cleanupAfterRender;
let $buttons;
let $steps;

const querySteps = function querySteps() {
  $steps = $('arcus-wizard-step').children();
};
const queryButtons = function queryButtons() {
  $buttons = $('arcus-wizard > .button-panel').children();
};

// ViewModel unit tests
describe('i2web/components/wizard/arcus-wizard', () => {
  before(function before(done) {
    loginAndRender({
      renderTo: '#test-area',
      template,
      scope: vm,
      appScope: {
        place: new canMap({}),
      },
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      setTimeout(() => {
        done();
      }, 10);
    }).catch(() => {
      console.error(arguments);
    });
  });

  after(function after(done) {
    cleanupAfterRender().then(() => {
      done();
    }).catch(() => {
      console.error(arguments);
      done();
    });
  });

  describe('rendering', function rendering() {
    it('shall render 1 wizard on the page', () => {
      assert.equal($('arcus-wizard').length, 1);
    });
    it('shall render 3 steps on the page', () => {
      assert.equal($('arcus-wizard-step').length, 3);
    });
  });

  describe('interactions', function interactions() {
    it('has one visible step and two hidden steps', () => {
      querySteps();
      assert.isTrue($steps.eq(0).is(':visible'), '1st is visible');
      assert.equal($steps.filter(':hidden').length, 2, '2 steps are hidden');
    });
    it('starts with one button that says "Begin"', () => {
      queryButtons();
      assert.equal($buttons.length, 1, 'has 1 button');
      assert.equal($buttons.eq(0).text().trim(), 'Begin', 'that button is labeled "Begin"');
    });
    it('clicking the next button advances to step 2', (done) => {
      F($buttons.eq(0)).click(() => {
        setTimeout(() => {
          querySteps();
          assert.isTrue($steps.eq(1).is(':visible'), '2nd step is visible');
          assert.equal($steps.filter(':hidden').length, 2, '2 steps are hidden');
          done();
        }, 1);
      });
    });
    it('step 2 has a back button labeled "Prev" and a disabled next button labeled "Next"', () => {
      queryButtons();
      assert.equal($buttons.length, 2, 'has two buttons');
      assert.equal($buttons.eq(0).text().trim(), 'Prev', 'prev button is labeled "Prev"');
      assert.equal($buttons.eq(1).text().trim(), 'Next', 'next button is labeled "Next"');
      assert.isTrue($buttons.eq(1).is(':disabled'), 'next button is disabled');
    });
    it('clicking the previous button goes back to step 1', (done) => {
      F($buttons.eq(0)).click(() => {
        setTimeout(() => {
          querySteps();
          assert.isTrue($steps.eq(0).is(':visible'), '1st step is visible');
          assert.equal($steps.filter(':hidden').length, 2, '2 steps are hidden');

          // advance back to step 2
          F($buttons.eq(0)).click(() => {
            setTimeout(() => {
              done();
            }, 1);
          });
        }, 1);
      });
    });
    it('clicking "Next" while it\'s disabled does not go to step 3', (done) => {
      F($buttons.eq(1)).click(() => {
        setTimeout(() => {
          querySteps();
          assert.isTrue($steps.eq(1).is(':visible'), '2nd step is visible');
          assert.equal($steps.filter(':hidden').length, 2, '2 steps are hidden');
          done();
        }, 1);
      });
    });
    it('checking the box enables the next button', (done) => {
      F($('#confirmAddress')).click(() => {
        queryButtons();
        assert.isTrue($buttons.eq(1).is(':enabled'), 'next button is no longer disabled');
        done();
      });
    });
    it('clicking the next button advances to step 3', (done) => {
      F($buttons.eq(1)).click(() => {
        setTimeout(() => {
          querySteps();
          assert.isTrue($steps.eq(2).is(':visible'), '3rd step is visible');
          assert.equal($steps.filter(':hidden').length, 2, '2 steps are hidden');
          done();
        }, 1);
      });
    });
    it('step 3 has no nav buttons', () => {
      queryButtons();
      assert.equal($buttons.length, 0, 'there are no buttons');
    });
  });
});
