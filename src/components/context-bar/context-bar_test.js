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
import fixture from 'can-fixture/';
import assert from 'chai';
import loginAndRender from 'i2web/test/util/loginAndRender';
import './context-bar';
import canViewModel from 'can-view-model';
import AlarmsConfig from 'config/alarms.json';
import CareSubsystem from 'i2web/models/capability/CareSubsystem';
import IncidentData from 'i2web/models/fixtures/data/incident/incident.json';

let cleanupAfterRender;
let appState;

describe('i2web/components/context-bar', function favorite() {
  before(function before() {
    fixture.reset();
  });

  const template = `
    <arcus-context-bar>
      No Incident
    </arcus-context-bar>
  `;

  beforeEach(function beforeEach(done) {
    loginAndRender({
      renderTo: '#test-area',
      template,
      scope: { },
      appScope: {
        careAlarmState: CareSubsystem.ALARMSTATE_READY,
        currentIncident: undefined,
      },
    }).then(({ cleanup }) => {
      appState = canViewModel('html');
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

  describe('rendering without incident', function rendering() {
    it('renders the content provided when without incident', function rendersContent() {
      assert.equal($('.context-bar').text().trim(), 'No Incident', 'the content is rendered');
    });

    describe('rendering with security incident', function securityRendering() {
      it('renders with police class', function policeClass() {
        appState.attr('currentIncident', IncidentData[0]);
        assert.ok($('.context-bar').hasClass('police'), 'security has police class');
      });
      it('renders with alarm icon', function alarmIcon() {
        const config = AlarmsConfig.security;
        const icon = config.icon;
        appState.attr('currentIncident', IncidentData[0]);
        assert.ok($('.context-bar i').hasClass(icon), 'security has alarm icon');
      });
      it('renders with security text', function securityText() {
        const text = `${AlarmsConfig.security.displayName} Alarm`;
        appState.attr('currentIncident', IncidentData[0]);
        assert.equal($('.context-bar h2').text().trim(), text, 'security alarm is rendered');
      });
    });
    describe('rendering with panic incident', function panicRendering() {
      it('renders with panic class', function panicClass() {
        appState.attr('currentIncident', IncidentData[2]);
        assert.ok($('.context-bar').hasClass('panic'), 'panic has panic class');
      });
      it('renders with alarm icon', function alarmIcon() {
        const config = AlarmsConfig.panic;
        const icon = config.icon;
        appState.attr('currentIncident', IncidentData[2]);
        assert.ok($('.context-bar i').hasClass(icon), 'panic has alarm icon');
      });
      it('renders with panic text', function panicText() {
        const text = `${AlarmsConfig.panic.displayName} Alarm`;
        appState.attr('currentIncident', IncidentData[2]);
        assert.equal($('.context-bar h2').text().trim(), text, 'panic alarm is rendered');
      });
    });
    describe('rendering with smoke incident', function smokeRendering() {
      it('renders with fire class', function fireClass() {
        appState.attr('currentIncident', IncidentData[3]);
        assert.ok($('.context-bar').hasClass('fire'), 'smoke has fire class');
      });
      it('renders with smoke icon', function smokeIcon() {
        const config = AlarmsConfig.smoke;
        const icon = config.icon;
        appState.attr('currentIncident', IncidentData[3]);
        assert.ok($('.context-bar i').hasClass(icon), 'smoke has smoke icon');
      });
      it('renders with smoke text', function smokeText() {
        const text = `${AlarmsConfig.smoke.displayName} Alarm`;
        appState.attr('currentIncident', IncidentData[3]);
        assert.equal($('.context-bar h2').text().trim(), text, 'smoke alarm is rendered');
      });
    });
    describe('rendering with co incident', function coRendering() {
      it('renders with fire class', function fireClass() {
        appState.attr('currentIncident', IncidentData[4]);
        assert.ok($('.context-bar').hasClass('fire'), 'co has fire class');
      });
      it('renders with co icon', function smokeIcon() {
        const config = AlarmsConfig.co;
        const icon = config.icon;
        appState.attr('currentIncident', IncidentData[4]);
        assert.ok($('.context-bar i').hasClass(icon), 'co has co smoke icon');
      });
      it('renders with co text', function coText() {
        const text = `${AlarmsConfig.co.displayName} Alarm`;
        appState.attr('currentIncident', IncidentData[4]);
        assert.equal($('.context-bar h2').text().trim(), text, 'co alarm is rendered');
      });
    });
    describe('rendering with water leak incident', function waterRendering() {
      it('renders with water class', function waterClass() {
        appState.attr('currentIncident', IncidentData[5]);
        assert.ok($('.context-bar').hasClass('water'), 'water leak has water class');
      });
      it('renders with water leak icon', function smokeIcon() {
        const config = AlarmsConfig.water;
        const icon = config.icon;
        appState.attr('currentIncident', IncidentData[5]);
        assert.ok($('.context-bar i').hasClass(icon), 'water leak has water leak icon');
      });
      it('renders with water leak text', function waterLeakText() {
        const text = `${AlarmsConfig.water.displayName} Alarm`;
        appState.attr('currentIncident', IncidentData[5]);
        assert.equal($('.context-bar h2').text().trim(), text, 'water leak alarm is rendered');
      });
    });
    describe('rendering with care alarm', function careRendering() {
      it('renders with care class', function careClass() {
        appState.attr('careAlarmState', CareSubsystem.ALARMSTATE_ALERT);
        assert.ok($('.context-bar').hasClass('care'), 'care alarm has care class');
      });
      it('renders with care heart icon', function careIcon() {
        const config = AlarmsConfig.care;
        const icon = config.icon;
        appState.attr('careAlarmState', CareSubsystem.ALARMSTATE_ALERT);
        assert.ok($('.context-bar i').hasClass(icon), 'care has care icon');
      });
      it('renders with care text', function careText() {
        const text = `${AlarmsConfig.care.displayName} Alarm`;
        appState.attr('careAlarmState', CareSubsystem.ALARMSTATE_ALERT);
        assert.equal($('.context-bar h2').text().trim(), text, 'care alarm is rendered');
      });
    });
    describe('rendering alarm priorities', function priorityRendering() {
      it('shall update when higher priority alarm occurs', function higher() {
        // water leak
        appState.attr('currentIncident', IncidentData[5]);
        assert.ok($('.context-bar').hasClass('water'), 'water leak has water class');
        // care
        appState.attr('careAlarmState', CareSubsystem.ALARMSTATE_ALERT);
        assert.ok($('.context-bar').hasClass('care'), 'care alarm has care class');
      });
      it('shall NOT update when lower priority alarms occurs', function lower() {
        // care
        appState.attr('careAlarmState', CareSubsystem.ALARMSTATE_ALERT);
        assert.ok($('.context-bar').hasClass('care'), 'care alarm has care class');
        // CO
        appState.attr('currentIncident', IncidentData[4]);
        assert.ok($('.context-bar').hasClass('fire'), 'co has fire class');
      });
    });
  });
});
