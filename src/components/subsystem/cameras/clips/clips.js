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

import _ from 'lodash';
import canBatch from 'can-event/batch/';
import each from 'can-util/js/each/';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import Device from 'i2web/models/device';
import Place from 'i2web/models/place';
import Recording from 'i2web/models/recording';
import Subsystem from 'i2web/models/subsystem';
import VideoService from 'i2web/models/service/VideoService';
import RecordingCapability from 'i2web/models/capability/Recording';
import view from './clips.stache';
import Errors from 'i2web/plugins/errors';
import moment from 'moment';

const TODAY = moment().endOf('day').valueOf();
const NUMBER_OF_CLIPS = 50;

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {boolean} canPinClips
     * @parent i2web/components/subsystem/cameras/clips
     * @description Whether clips can be pinned by the user
     */
    canPinClips: {
      get() {
        return !this.attr('place.isBasic');
      },
    },
    /**
     * @property {Recording.List} clips
     * @parent i2web/components/subsystem/cameras/clips
     * @description List of clips we're displaying currently
     */
    clips: {
      Type: Recording.List,
      get(currentValue, setAttr) {
        // bind on pinned, cameraFilter, dayFilter
        this.attr('pinnedOnly');
        this.attr('cameraFilter');
        this.attr('dayFilter');
        this.getClips().then((clips) => {
          setAttr(clips);
          this.attr('loadingClips', false);
        }).catch(e => Errors.log(e));
      },
    },
    /**
     * @property {string} cameraFilter
     * @parent i2web/components/subsystem/cameras/clips
     * @description The UUID of the camera to filter by
     */
    cameraFilter: {
      value: '',
      set(value) {
        if (value === '0') return '';
        return value;
      },
    },
    /**
     * @property {string} cameraFilterText
     * @parent i2web/components/subsystem/cameras/clips
     * @description Then name of the camera filtered by, or 'All Cameras'
     */
    cameraFilterText: {
      get() {
        return this.attr('cameraFilter') ? this.cameraNameFromID(this.attr('cameraFilter')) : 'All Cameras';
      },
    },
    /**
     * @property cameraNameFromID
     * @parent i2web/components/subsystem/cameras/clips
     * @description Set this property to a function that returns the camera name of the ID provided
     * @param {string} id The UUID of the camera
     */
    cameraNameFromID: {
      type: '*',
    },
    /**
     * @property {Array<Device>} cameraIds
     * @parent i2web/components/subsystem/cameras/clips
     * @description An array of camera devices from which clips were recorded
     */
    cameras: {
      get() {
        const subsystem = this.attr('subsystem');
        if (subsystem) {
          const cameras = subsystem.attr('web:subcameras:cameras');
          return cameras;
        }
        return new Device.List([]);
      },
    },
    /**
     * @property {boolean} confirmDelete
     * @parent i2web/components/subsystem/cameras/clips
     * @description Toggles delete confirmation overlay
     */
    confirmDelete: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {string} dayFilter
     * @parent i2web/components/subsystem/cameras/clips
     * @description The string timestamp of the day to filter by
     */
    dayFilter: {
      type: 'string',
      value: TODAY,
    },
    /**
     * @property {number} dayFilterText
     * @parent i2web/components/subsystem/cameras/clips
     * @description The number timestamp of the day to filter by
     * (because format-date required a number)
     */
    dayFilterText: {
      get() {
        return _.find(this.attr('days'), day => `${day.value}` === this.attr('dayFilter')).text;
      },
    },
    /**
     * @property {Array<Number>} days
     * @parent i2web/components/subsystem/cameras/clips
     * @description An array of timestamps representing the days which have clips
     */
    days: {
      get() {
        return this.attr('place.isBasic')
          ? [{ text: 'Last 24 Hours', value: TODAY }]
          : this.getDayFilterOptions();
      },
    },
    /**
     * @property {string} daysDropdownAttributes
     * @parent i2web/components/subsystem/cameras/clips
     * @description String with html attributes to be applied to the days filter
     * dropdown
     */
    daysDropdownAttributes: {
      get() {
        return this.attr('place.isBasic') ? 'disabled' : '';
      },
    },
    /**
     * @property {Object} filters
     * @parent i2web/components/subsystem/cameras/clips
     * @description Filters that may be applied
     */
    filters: {
      value() {
        // default to Today and All Cameras
        return {
          camera: this.attr('cameraFilter') || '0',
          day: TODAY,
        };
      },
    },
    /**
     * @property {string} lastToken
     * @parent i2web/components/subsystem/cameras/clips
     * @description Most recent token requested
     */
    lastToken: {
      type: 'string',
    },
    /**
     * @property {boolean} loadingClips
     * @parent i2web/components/subsystem/cameras/clips
     * @description Whether or not the clips are still being loaded
     */
    loadingClips: {
      type: 'boolean',
      value: true,
    },
    /**
     * @property {boolean} pinnedOnly
     * @parent i2web/components/subsystem/cameras/clips
     * @description Only filter on and show pinned clips
     */
    pinnedOnly: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/cameras/clips
     * @description The place we will use to acquire the clips
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Array<Recording>} renderableClips
     * @parent i2web/components/subsystem/cameras/clips
     * @description The subset of filtered clips that match additional criteria
     */
    renderableClips: {
      get() {
        if (this.attr('clips')) {
          const rightNow = moment().utc();
          return this.attr('clips').filter((clip) => {
            const isFavorite = clip.attr('isFavorite');
            if (clip.attr('video:deleted')
              || (clip.attr('video:deleteTime') <= rightNow && !isFavorite)) {
              return false;
            } else if (this.attr('pinnedOnly') && !isFavorite) {
              return false;
            }
            return true;
          });
        }
        return [];
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/cameras/clips
     * @description The cameras subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function next
   * @parent i2web/components/subsystem/cameras/clips
   * @description Gets the next set of clips
   */
  next(clips) {
    this.getClips(this.attr('lastToken'), clips).then((c) => {
      this.attr('clips', c);
      this.attr('loadingClips', false);
    }).catch(e => Errors.log(e));
  },
  /**
   * @function applyFilters
   * @parent i2web/components/subsystem/cameras/clips
   * @param {boolean} pinnedOnly
   * @description Apply all filters to the entire clips collection
   */
  applyFilters() {
    canBatch.start();
    each(this.attr('filters').attr(), (value, key) => {
      this.attr(`${key}Filter`, value);
    });
    canBatch.stop();
  },
  /**
   * @function {Promise<Array<Video>>} getClips
   * @parent i2web/components/subsystem/cameras/clips
   * @param {number} token The token of the next video to fetch, null to start from the beginning
   * @param {Array<Recording>} clips The collection of all clips
   * @description Retrieve all clips for a particular place
   */
  getClips(token = null, clips = new Recording.List([])) {
    this.attr('loadingClips', true);
    const placeId = this.attr('place.base:id');
    const tags = this.attr('pinnedOnly') ? ['FAVORITE'] : [];
    const cameras = this.attr('cameraFilter') ? [this.attr('cameraFilter')] : [];
    return VideoService.PageRecordings(placeId, NUMBER_OF_CLIPS, token, false, true, RecordingCapability.TYPE_RECORDING, this.attr('dayFilter'), null, cameras, tags).then((recordings) => {
      Recording.List.prototype.push.apply(clips, recordings.recordings);
      this.attr('lastToken', recordings.nextToken);
      return clips;
    });
  },
  /**
   * @function {<Array>} getDayFilterOptions
   * @parent i2web/components/subsystem/cameras/clips
   * @description Returns a list of options to be rendered in the dropdown to
   * filter out clips by day
   */
  getDayFilterOptions() {
    return [{
      value: TODAY,
      text: 'Today',
    }, {
      value: moment().subtract(1, 'days').endOf('day').valueOf(),
      text: 'Yesterday',
    }, {
      value: moment().subtract(2, 'days').endOf('day').valueOf(),
      text: moment().subtract(2, 'days').format('ddd MMM D'),
    }, {
      value: moment().subtract(3, 'days').endOf('day').valueOf(),
      text: moment().subtract(3, 'days').format('ddd MMM D'),
    }, {
      value: moment().subtract(4, 'days').endOf('day').valueOf(),
      text: moment().subtract(4, 'days').format('ddd MMM D'),
    }, {
      value: moment().subtract(5, 'days').endOf('day').valueOf(),
      text: moment().subtract(5, 'days').format('ddd MMM D'),
    }, {
      value: moment().subtract(6, 'days').endOf('day').valueOf(),
      text: moment().subtract(6, 'days').format('ddd MMM D'),
    }, {
      value: moment().subtract(1, 'week').endOf('day').valueOf(),
      text: 'Last Week',
    }, {
      value: moment().subtract(2, 'week').endOf('day').valueOf(),
      text: '2 Weeks Ago',
    }, {
      value: moment().subtract(1, 'month').endOf('month').valueOf(),
      text: moment().subtract(1, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(2, 'month').endOf('month').valueOf(),
      text: moment().subtract(2, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(3, 'month').endOf('month').valueOf(),
      text: moment().subtract(3, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(4, 'month').endOf('month').valueOf(),
      text: moment().subtract(4, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(5, 'month').endOf('month').valueOf(),
      text: moment().subtract(5, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(6, 'month').endOf('month').valueOf(),
      text: moment().subtract(6, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(7, 'month').endOf('month').valueOf(),
      text: moment().subtract(7, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(8, 'month').endOf('month').valueOf(),
      text: moment().subtract(8, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(9, 'month').endOf('month').valueOf(),
      text: moment().subtract(9, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(10, 'month').endOf('month').valueOf(),
      text: moment().subtract(10, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(11, 'month').endOf('month').valueOf(),
      text: moment().subtract(11, 'month').format('MMM YYYY'),
    }, {
      value: moment().subtract(1, 'year').endOf('month').valueOf(),
      text: 'Older Than 1 Year',
    }];
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-cameras-clips',
  viewModel: ViewModel,
  view,
});
