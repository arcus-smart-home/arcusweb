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
import AlarmCapability from 'i2web/models/capability/Alarm';
import Device from 'i2web/models/device';
import Place from 'i2web/models/place';
import Recording from 'i2web/models/recording';
import Subsystem from 'i2web/models/subsystem';
import VideoService from 'i2web/models/service/VideoService';
import RecordingCapability from 'i2web/models/capability/Recording';
import view from './status.stache';
import getAppState from 'i2web/plugins/get-app-state';
import Errors from 'i2web/plugins/errors';
import canBatch from 'can-event/batch/batch';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Device.List} cameras
     * @parent i2web/components/subsystem/cameras/status
     * @description List of all cameras
     */
    cameras: {
      get() {
        const subsystem = this.attr('subsystem');
        if (subsystem) {
          return subsystem.attr('web:subcameras:cameras');
        }
        return new Device.List([]);
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
     * @property {Device.List} pagedCameras
     * @parent i2web/components/subsystem/cameras/status
     * @description The subset of cameras to be displayed based on paging
     */
    pagedCameras: {
      get() {
        if (this.attr('pagingEnabled')) {
          const fromIndex = (this.attr('pageSize') * this.attr('currentPage')) - this.attr('pageSize');
          return this.attr('cameras').slice(fromIndex, fromIndex + this.attr('pageSize'));
        }
        return this.attr('cameras');
      },
    },
    /**
     * @property {Recording.List} clips
     * @parent i2web/components/subsystem/cameras/status
     * @description The list of recordings from the current place
     */
    clips: {
      get(lastSetVal) {
        const place = this.attr('place');
        let retVal;
        if (place) {
          if (lastSetVal) {
            retVal = lastSetVal;
          } else {
            retVal = new Recording.List();
          }
          retVal.replace(VideoService.PageRecordings(place.attr('base:id'), 4, null, false, false, RecordingCapability.TYPE_RECORDING, null, null, [], ['FAVORITE'])
            .then(d => d.recordings).catch(e => Errors.log(e)));
        } else {
          retVal = new Recording.List();
        }
        return retVal;
      },
    },
    /**
     * @property {Recording.List} filteredClips
     * @parent i2web/components/subsystem/cameras/status
     * @description The list of recordings from the current place which are favorited.  This exists primarily
     * to note when a favorite clip has been unpinned, which triggers a refresh of this.clips.
     */
    filteredClips: {
      get() {
        const clips = this.attr('clips');
        const filteredClips = clips.filter(clip => clip.attr('isFavorite'));
        canBatch.after(() => {
          const _clips = this.attr('clips');
          const _filteredClips = clips.filter(clip => clip.attr('isFavorite') && !clip.attr('video:deleted'));
          if (_filteredClips.length < _clips.length) {
            this.attr('clips', _filteredClips);
          }
        });
        return filteredClips;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/cameras/status
     * @description User's place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/cameras/status
     * @description The cameras subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {Subsystem} alarmSubsystem
     * @parent i2web/components/subsystem/cameras/status
     * @description The alarm subsystem
     */
    alarmSubsystem: {
      get() {
        const subsystems = getAppState().attr('subsystems');
        return subsystems && subsystems.findByName('subalarm');
      },
    },
    /**
     * @property {boolean} pagingEnabled
     * @parent i2web/components/subsystem/cameras/status
     * @description Whether there are enough cameras to enable paging
     */
    pagingEnabled: {
      get() {
        const numberOfCameras = this.attr('cameras.length');
        if (numberOfCameras) {
          return (numberOfCameras > this.attr('pageSize'));
        }
        return false;
      },
    },
    /**
     * @property {boolean} recordingSupported
     * @parent i2web/components/subsystem/cameras/status
     * @description Whether there are relevant devices to support record on security alarm
     */
    recordingSupported: {
      get() {
        const alarmSubsystem = this.attr('alarmSubsystem');
        if (alarmSubsystem) {
          const securityState = alarmSubsystem.attr('alarm:alertState:SECURITY');
          return alarmSubsystem.attr('subalarm:recordingSupported') && securityState !== AlarmCapability.ALERTSTATE_INACTIVE;
        }
        return false;
      },
    },
    /**
     * @property {number} pageSize
     * @parent i2web/components/subsystem/cameras/status
     * @description Number of cameras to display per page
     */
    pageSize: {
      get() {
        return this.attr('subsystem.subcameras:maxSimultaneousStreams');
      },
    },
    /**
     * @property {number} currentPage
     * @parent i2web/components/subsystem/cameras/status
     * @description Current page being viewed
     */
    currentPage: {
      value: 1,
    },
    /**
     * @property {string} pageDescription
     * @parent i2web/components/subsystem/cameras/status
     * @description Details of the cameras being displayed on the page
     */
    pageDescription: {
      get() {
        const numberOfCameras = this.attr('cameras.length');
        const pageSize = this.attr('pageSize');
        const currentPage = this.attr('currentPage');
        const pagingIsEnabled = this.attr('pagingEnabled');
        const lowestNumber = ((pageSize * (currentPage - 1)) + 1);

        if (numberOfCameras) {
          if (pagingIsEnabled) {
            const highestNumber = Math.min(pageSize * currentPage, numberOfCameras);
            // if there is only one camera on the last page then it will equal the 'highestNumber'
            // if there is more than one camera on the last page then it will not equal the 'highestNumber'
            if (highestNumber === lowestNumber) return `${highestNumber}`;
            return `${lowestNumber}-${highestNumber}`;
          }
          return `${numberOfCameras}`;
        }
        return '0';
      },
    },
    /**
     * @property {boolean} onLastPage
     * @parent i2web/components/subsystem/cameras/status
     * @description Whether we are on the last page
     */
    onLastPage: {
      get() {
        return Math.ceil(this.attr('cameras.length') / this.attr('pageSize')) === this.attr('currentPage');
      },
    },
  },
  /**
   * @function previousPage
   * @parent i2web/components/subsystem/cameras/status
   * @description Changes to the previous page
   */
  previousPage() {
    this.attr('currentPage', this.attr('currentPage') - 1);
  },
  /**
   * @function nextPage
   * @parent i2web/components/subsystem/cameras/status
   * @description Changes to the next page
   */
  nextPage() {
    this.attr('currentPage', this.attr('currentPage') + 1);
  },
  /**
   * @function toggleRecordingWhenAlarmTriggered
   * @parent i2web/components/subsystem/cameras/status
   * @description Toggles the recordOnSecurity value
   */
  toggleRecordingWhenAlarmTriggered() {
    this.attr('alarmSubsystem.subalarm:recordOnSecurity', !this.attr('alarmSubsystem.subalarm:recordOnSecurity'));
    this.attr('alarmSubsystem').save();
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-cameras-status',
  viewModel: ViewModel,
  view,
});
