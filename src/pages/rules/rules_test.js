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
import canMap from 'can-map';
import canRoute from 'can-route';
import fixture from 'can-fixture/';
import F from 'funcunit';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import Place from 'i2web/models/place';
import Rule from 'i2web/models/rule';
import RuleTemplate from 'i2web/models/rule-template';
import PlacesData from 'i2web/models/fixtures/data/place/place.json';
import RuleData from 'i2web/models/fixtures/data/rule/rules.json';
import RuleTemplateData from 'i2web/models/fixtures/data/rule/templates.json';
import './rules';

let cleanupAfterRender;
let viewModel;

describe('i2web/pages/rules', function favorite() {
  before(function before() {
    fixture.reset();
  });

  beforeEach(function beforeEach(done) {
    viewModel = new canMap({
      place: new Place(PlacesData[0]),
      rules: new Rule.List([]),
      ruleTemplates: new RuleTemplate.List(RuleTemplateData.ruleTemplates),
    });
    canRoute.attr({
      page: 'rules',
    });
    loginAndRender({
      renderTo: '#test-area',
      template: '<arcus-page-rules {place}="place" {(rules)}="rules" {templates}="ruleTemplates" />',
      scope: viewModel,
      appScope: {
      },
    }).then(({ cleanup }) => {
      cleanupAfterRender = cleanup;
      done();
    }).catch(() => {
      console.error(arguments);
    });
  });

  afterEach(function after(done) {
    cleanupAfterRender().then(() => {
      done();
    }).catch(() => {
      console.error(arguments);
    });
  });

  describe('rendering', function rendering() {
    it('shall be rendered on the page', function isRendered() {
      assert.lengthOf($('arcus-page-rules'), 1, 'arcus-page-rules is rendered');
    });

    it('shall render MY RULES as the default content', function myRulesDefault() {
      assert.lengthOf($('.active'), 1, 'only 1 active class');
      assert($('.active').attr('id') === 'my-rules', 'MY RULES is active');
    });

    it('shall display information text below button in MY RULES when rule length is 0', function noRules() {
      assert.lengthOf($('.my-rules-instructions > h2'), 1, 'my rules header displayed');
      assert.lengthOf($('.my-rules-instructions p'), 1, 'small text display');
    });

    it('shall not display information text below button in MY RULES when rule length is > 0', function someRules(done) {
      const placeID = PlacesData[0]['base:id'];
      const rules = new Rule.List(RuleData[placeID].rules);
      viewModel.attr('rules', new Rule.List(rules));
      setTimeout(() => {
        assert.lengthOf($('.my-rules-instructions p'), 0, 'small text display');
        done();
      }, 0);
    });

    it('My Rules shall NOT render arcus-rules-my-list if rules.length == 0', function doNotRender(done) {
      setTimeout(() => {
        assert.lengthOf($('arcus-rules-my-list'), 0, 'arcus-rules-my-list NOT displayed');
        done();
      }, 0);
    });

    it('My Rules shall render one arcus-rules-my-list component if rules.length > 0', function renderMyList(done) {
      const placeID = PlacesData[0]['base:id'];
      const rules = new Rule.List(RuleData[placeID].rules);
      viewModel.attr('rules', new Rule.List(rules));
      setTimeout(() => {
        assert.lengthOf($('arcus-rules-my-list'), 1, 'arcus-rules-my-list displayed');
        done();
      }, 0);
    });
  });

  describe('interaction', function interaction() {
    it('When the "ADD A RULE" is selected, but button is active', function renderText(done) {
      F('#add-rules').click(() => {
        assert.lengthOf($('.active'), 1, 'only 1 active class');
        assert($('.active').attr('id') === 'add-rules', 'ADD RULES is active');
        done();
      });
    });
  });
});
