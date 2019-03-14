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
import Place from 'i2web/models/place';
import VideoService from 'i2web/models/service/VideoService';
import RecordingCapability from 'i2web/models/capability/Recording';
import Errors from 'i2web/plugins/errors';
import Notifications from 'i2web/plugins/notifications';
import view from './storage.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {boolean} confirmingDelete
     * @parent i2web/components/subsystem/cameras/storage
     * @description Request that the user confirm the deletion of clips
     */
    confirmingDelete: {
      type: 'bool',
      value: false,
    },
    /**
     * @property {string} deleteType
     * @parent i2web/components/subsystem/cameras/storage
     * @description The type of clip deletion: "Clean Up" or "Delete All"
     */
    deleteType: {
      type: 'string',
    },
    /**
     * @property {boolean} hasClips
     * @parent i2web/components/subsystem/cameras/storage
     * @description Whether the place has clips
     */
    hasClips: {
      value: false,
      type: 'boolean',
    },
    /**
     * @property {boolean} noClipsOrConfirmingDelete
     * @parent i2web/components/subsystem/cameras/storage
     * @description Display the delete buttons if there are no clips or we are already
     * deleting
     */
    noClipsOrConfirmingDelete: {
      get() {
        return !this.attr('hasClips') || this.attr('confirmingDelete');
      },
    },
    /**
     * @property {integer} pinnedClipLimit
     * @parent i2web/components/subsystem/cameras/storage
     * @description Number of clips that can be pinned
     */

    pinnedClipLimit: {
      value: 150,
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/cameras/storage
     * @description Where the displayed camera information is configured
     */
    place: {
      Type: Place,
      set(place, setVal) {
        setVal(place);
        if (place) {
          this.checkForClips();
        }
      },
    },
    /**
     * @property {string} storageDeleteDuration
     * @parent i2web/components/subsystem/cameras/storage
     * @description Number of days before unpinned clips are deleted.
     */
    storageDeleteDuration: {
      get() {
        const storageWindow = this.attr('storageWindow');
        return `${storageWindow} day${storageWindow > 1 ? 's' : ''}`;
      },
    },
    /**
     * @property {integer} storageWindow
     * @parent i2web/components/subsystem/cameras/storage
     * @description Number of days in storage window.
     */
    storageWindow: {
      get() {
        return this.attr('place.isBasic') ? 1 : 30;
      },
    },
  },
  /**
   * @function cancelDelete
   * User has cancelled the clip deletion process
   */
  cancelDelete() {
    this.attr('confirmingDelete', false);
    this.attr('deleteType', null);
  },
  /**
   * @function cleanUpClips
   * Delete all clips, except for 'pinned' ones, at a particular place
   */
  cleanUpClips() {
    this.attr('deleteType', 'Clean Up');
    this.attr('confirmingDelete', true);
  },
  /**
   * @function confirmedDelete
   * The User has confirmed delete some clips, then notify them that their
   * clips have been deleted
   */
  confirmedDelete() {
    const deleteAll = (this.attr('deleteType') === 'Delete All');
    VideoService.DeleteAll(this.attr('place.base:id'), deleteAll).then(() => {
      this.checkForClips();
      this.attr('confirmingDelete', false);
      Notifications.success(`${deleteAll ? 'All Clips have been Deleted' : 'Your Unpinned Clips have been Cleaned Up'}`, 'icon-app-clip-1');
    })
    .catch((e) => {
      this.attr('confirmingDelete', false);
      Errors.log(e);
    });
  },
  /**
   * @function deleteAllClips
   * Delete all clips, including 'pinned' ones, at a particular place
   */
  deleteAllClips() {
    this.attr('deleteType', 'Delete All');
    this.attr('confirmingDelete', true);
  },
  /**
   * @function checkForClips
   * Checks whether the user has clips
   */
  checkForClips() {
    VideoService.PageRecordings(this.attr('place.base:id'), 1, null, false, false, RecordingCapability.TYPE_RECORDING).then(({ recordings }) => {
      this.attr('hasClips', !!recordings.length);
    }).catch((e) => {
      Errors.log(e);
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-cameras-storage',
  viewModel: ViewModel,
  view,
});
