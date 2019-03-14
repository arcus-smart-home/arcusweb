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
import Component from 'can-component';
import includes from 'lodash/includes';
import without from 'lodash/without';
import moment from 'moment';
import Notifications from 'i2web/plugins/notifications';
import Recording from 'i2web/models/recording';
import view from './pin-clip.stache';
import 'can-map-define/can-map-define';

export const favoriteTag = 'FAVORITE';
export const unpinnedIconClassName = 'icon-app-pin-2';
export const pinnedIconClassName = 'icon-app-pin-1';

export const PinClipViewModel = CanMap.extend({
  define: {
    /**
     * @property {Recording} clip
     * @parent i2web/components/subsystem/cameras/pin-clip
     * @description The recording instance to be pin or unpinned
     */
    clip: {
      Type: Recording,
    },
    /**
     * @property {string} iconClass
     * @parent i2web/components/subsystem/cameras/pin-clip
     * @description The icon to display depending on the state of the object.
     */
    iconClass: {
      get() {
        return (this.attr('clip.isFavorite'))
          ? pinnedIconClassName
          : unpinnedIconClassName;
      },
    },
    /**
     * @property {boolean} isClipExpired
     * @parent i2web/components/subsystem/cameras/pin-clip
     * @description Whether the clip delete time has passed
     */
    isClipExpired: {
      get() {
        const clip = this.attr('clip');
        return moment(clip.attr('video:deleteTime')).isBefore();
      },
    },
    /**
     * @property {String} stateClass
     * @parent i2web/components/subsystem/cameras/pin-clip
     * @description The color to display depending on the state of the object.
     */
    stateClass: {
      get() {
        return this.attr('clip.isFavorite') ? 'active' : 'default';
      },
    },
  },
  /**
   * @function toggleState
   * @parent i2web/components/subsystem/cameras/pin-clip
   * @description Calls pin or unpin clip based on the current clip state
   */
  toggleState() {
    if (this.attr('disabled')) return;

    if (this.attr('clip.isFavorite')) {
      if (this.attr('isClipExpired')) {
        this.onUnpinExpiredClip();
      } else {
        this.unpinClip();
      }
    } else {
      this.pinClip();
    }
  },
  /**
   * @function pinClip
   * @parent i2web/components/subsystem/cameras/pin-clip
   * @description Add favorite tag to the clip
   */
  pinClip() {
    const clip = this.attr('clip');
    const tags = clip.attr('base:tags');

    if (clip) {
      tags.push(favoriteTag);
      clip.AddTags(favoriteTag)
        .then(() => {
          Notifications.success(
            'Selected Clip has been Pinned.',
            unpinnedIconClassName,
          );
        })
        .catch(() => {
          clip.attr('base:tags', without(tags, favoriteTag));
          Notifications.error('You have reached your Pinned Clip limit of 150.');
        });
    }
  },
  /**
   * @function unpinClip
   * @parent i2web/components/subsystem/cameras/pin-clip
   * @description Remove the favorite tag from the clip
   */
  unpinClip() {
    const clip = this.attr('clip');
    const tags = clip && clip.attr('base:tags');

    if (includes(tags, favoriteTag)) {
      clip.attr('base:tags', without(tags, favoriteTag));
      clip
        .RemoveTags(favoriteTag)
        .then(() => {
          Notifications.success(
            'Selected Clip has been Unpinned.',
            unpinnedIconClassName,
          );
        })
        .catch(() => {});
    }
  },
});

/**
 * @module {Component} i2web/components/subsystem/cameras/pin-clip
 * @parent i2web/components
 * @description Allows the user to 'favorite' a camer clip.
 * @signature `<arcus-subsystem-cameras-pin-clip {clip}="recording" />`
 */
export default Component.extend({
  tag: 'arcus-subsystem-cameras-pin-clip',
  viewModel: PinClipViewModel,
  view,
});
