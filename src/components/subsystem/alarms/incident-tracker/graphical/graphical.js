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
import Component from 'can-component';
import canList from 'can-list';
import canMap from 'can-map';
import 'can-map-define';
import Analytics from 'i2web/plugins/analytics';
import view from './graphical.stache';
import Incident from 'i2web/models/incident';
import IncidentCapability from 'i2web/models/capability/AlarmIncident';
import Swiper from 'swiper/dist/js/swiper';
import getAppState from 'i2web/plugins/get-app-state';
import Errors from 'i2web/plugins/errors';
import SidePanel from 'i2web/plugins/side-panel';
import WatchElementResize from 'watch-element-resize';
import _ from 'lodash';
import './event/';
import './cancel.component';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Incident} incident
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description The incident we are tracking
     */
    incident: {
      Type: Incident,
    },
    /**
     * @property {boolean} isIncidentActive
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Whether the incident we are tracking is active
     */
    isIncidentActive: {
      get() {
        const activeIncident = getAppState().attr('currentIncident');
        const incident = this.attr('incident');

        return activeIncident === incident;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description The current place
     */
    place: {
      get() {
        return getAppState().attr('place');
      },
    },
    /**
     * @property {boolean} showPlaceName
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Whether to show the current place name
     */
    showPlaceName: {
      type: 'htmlbool',
      value: false,
    },
    /**
     * @property {canList} events
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Events to display
     */
    events: {
      get() {
        const incident = this.attr('incident');
        const place = this.attr('place');
        if (place && incident) {
          const events = incident.attr('incident:tracker') || new canList([]);
          if (events.attr('length')) {
            // non-basic users get all events
            if (!place.attr('isBasic')) return events;
            // basic users only get one event, so select the last one
            const lastEvent = events.attr((events.attr('length') - 1));
            return new canList([lastEvent]);
          }
        }
        return new canList([]);
      },
    },
    /**
     * @property {number} activeIndex
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Active event index being shown
     */
    activeIndex: {
      type: 'number',
      value: 0,
    },
    /**
     * @property {boolean} enableConfirmButton
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Defines conditions when the Confirm button is enabled
     */
    enableConfirmButton: {
      get() {
        const incident = this.attr('incident');
        if (incident) {
          return (incident.attr('incident:monitored') &&
                  !incident.attr('incident:confirmed') &&
                  incident.attr('incident:alert') !== IncidentCapability.ALERT_PANIC);
        }
        return false;
      },
    },
    /**
     * @property {boolean} showConfirmButton
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Defines conditions when the Confirm button is shown in the graphical tracker
     */
    showConfirmButton: {
      get() {
        const incident = this.attr('incident');
        const currentIncident = getAppState().attr('currentIncident');
        return incident && incident === currentIncident && incident.attr('incident:monitored');
      },
    },
    /**
     * @property {boolean} showCancelButton
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Defines conditions when the Cancel button is shown
     */
    showCancelButton: {
      get() {
        const incident = this.attr('incident');
        if (incident) {
          return ![IncidentCapability.ALERTSTATE_CANCELLING, IncidentCapability.ALERTSTATE_COMPLETE].includes(incident.attr('incident:alertState'));
        }
        return false;
      },
    },
    /**
     * @property {string} parentClass
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Class names that get added to the parent element
     */
    parentClass: {
      get() {
        const classes = [];

        // is place basic?
        const place = this.attr('place');
        if (place && place.attr('isBasic')) {
          classes.push('basic');
        }

        // incident alert types
        const incident = this.attr('incident');
        const alert = this.attr('incident.incident:alert');
        if (incident && incident.attr('incident:alertState') !== IncidentCapability.ALERTSTATE_COMPLETE) {
          classes.push(`alert-type-${alert}`);
        }

        const classNames = classes.join(' ');
        const $el = $(this.attr('element'));
        $el.attr('class', '');
        $el.addClass(classNames);
        return classNames;
      },
    },
    /**
     * @property {Object} element
     * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
     * @description Container element
     */
    element: {
      type: '*',
    },
    /**
     * @property {number} containerWidth
     * @parent i2web/components/carousel
     * Width of the carousel container
     */
    containerWidth: {
      set(newVal) {
        if (newVal !== this.attr('containerWidth') && this.attr('carousel')) {
          let width = 550;
          let slidesPerView = 2;
          if (newVal < 540) {
            width = 330;
            slidesPerView = 1;
          }
          this.attr('carousel').params.slidesPerView = slidesPerView;
          this.attr('carousel').params.width = width;
          this.attr('carousel').update(true);
        }
        return newVal;
      },
    },
  },
  /**
   * @function slideToLatest
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * @description Determines if this is the last event
   */
  slideToLatest() {
    const carousel = this.attr('carousel');
    const events = this.attr('events');
    if (carousel && events) {
      // because the carousel can take a while to identify new elements, delay the slideTo call a bit
      const newActiveIndex = (events.attr('length') - 1);
      this.attr('activeIndex', newActiveIndex);
      setTimeout(() => {
        carousel.slideTo(newActiveIndex);
      }, 100);
    }
  },
  /**
   * @function isLast
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * @description Determines if this is the last event
   */
  isLastEvent(index) {
    return (index + 1) === this.attr('events.length');
  },
  /**
   * @function isActive
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * @description Determines if this is the active event
   */
  isActiveEvent(index) {
    const carousel = this.attr('carousel');
    if (carousel) {
      return index === this.attr('activeIndex');
    }
    return false;
  },
  /**
   * @function initCarousel
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * Initializes the carousel
   */
  initCarousel() {
    const config = {
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      slidesPerView: 2,
      width: 550,
      observer: true,
      simulateTouch: false,
      centeredSlides: true,
    };

    // set the initial slide if we already have events
    const events = this.attr('events');
    if (events.length > 1) {
      const activeIndex = (events.length - 1);
      config.initialSlide = activeIndex;
      this.attr('activeIndex', activeIndex);
    }

    const carousel = new Swiper(this.attr('container'), config);
    // Need to enable touch control by default for mobile use, won't do anything on non-touch devices.
    carousel.enableTouchControl();
    carousel.on('onSlideChangeEnd', () => {
      this.attr('activeIndex', this.attr('carousel').activeIndex);
    });
    this.attr('carousel', carousel);
  },
  /**
   * @function destroyCarousel
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * Destroys the carousel
   */
  destroyCarousel() {
    if (this.attr('carousel')) {
      this.attr('carousel').destroy();
    }
  },
  /**
   * @property {boolean} verifying
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * @description Whether we are in a verifying state
   */
  verifying: false,
  /**
   * @function verifyIncident
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * @description Verifies the incident with the platform
   */
  verifyIncident() {
    if (this.attr('enableConfirmButton')) {
      this.attr('verifying', true);
      this.attr('incident').Verify().then(() => {
        Analytics.tag('alarms.tracker.confirmed');
        this.attr('verifying', false);
      }).catch((e) => {
        this.attr('verifying', false);
        Errors.log(e);
      });
    }
  },
  /**
   * @property {boolean} cancelling
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * @description Whether we are in a cancelling state
   */
  cancelling: false,
  /**
   * @function cancelIncident
   * @parent i2web/components/subsystem/alarms/incident-tracker/graphical
   * @description Attempts to cancel the incident with the platform
   */
  cancelIncident() {
    this.attr('cancelling', true);
    this.attr('incident').Cancel().then((cancellationNotes) => {
      Analytics.tag('alarms.tracker.canceled');
      this.attr('cancelling', false);
      if (cancellationNotes.warningMessage) {
        SidePanel.right('<arcus-subsystem-alarms-event-tracker-graphical-cancel {title}="warningTitle" {message}="warningMessage" />', {
          warningTitle: cancellationNotes.warningTitle,
          warningMessage: cancellationNotes.warningMessage,
        });
      }
    }).catch((e) => {
      this.attr('cancelling', false);
      if (e && e.code === 'UnknownDevice') {
        const messagePart1 = 'Arcus cannot stop sounds in your home until you reconnect the Hub.';
        const messagePart2 = 'For your safety, the Monitoring Station will call to assist, then attempt to dispatch authorities if unanswered. To cancel dispatch, call %s';
        const offlineMessage = this.attr('place.isPromon') ? `${messagePart1}<br><br>${messagePart2}` : messagePart1;
        SidePanel.right('<arcus-subsystem-alarms-event-tracker-graphical-cancel {title}="warningTitle" {message}="warningMessage" />', {
          warningTitle: 'Hub Lost Connection',
          warningMessage: offlineMessage,
        });
      } else {
        Errors.log(e, true);
      }
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsubsystem-alarms-incident-tracker-graphical',
  viewModel: ViewModel,
  view,
  events: {
    inserted(el) {
      Analytics.tag('alarms.tracker.launched');
      this.viewModel.attr('element', el);
      this.viewModel.attr('parentClass');
      this.viewModel.attr('container', $(el).find('.swiper-container'));
      this.viewModel.initCarousel();
      const watchSize = new WatchElementResize(el);
      this.viewModel.attr('containerWidth', el.offsetWidth);
      watchSize.on('resize', _.debounce((ev) => {
        this.viewModel.attr('containerWidth', ev.element.offset.width);
      }, 100));
    },
    '{element} beforeremove': function beforeRemove() {
      this.viewModel.destroyCarousel();
    },
    '{viewModel} events': function events() {
      this.viewModel.slideToLatest();
    },
    '{viewModel.events} length': function eventsLength() {
      this.viewModel.slideToLatest();
    },
  },
});
