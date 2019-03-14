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

import _truncate from 'lodash/truncate';
import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import view from './favorite.stache';
import Notifications from 'i2web/plugins/notifications';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {String} addedNotification
     * @parent i2web/components/favorite
     * The string to notify the User when a item is added to favorited.
     */
    addedNotification: {
      type: 'string',
      get() {
        return {
          icon: 'icon-app-heart-2',
          text: `'${_truncate(this.attr('displayProperty'), { length: 51 })}' was just added to Favorites.`,
        };
      },
    },
    displayProperty: {
      type: 'string',
      get(property) {
        if (property) {
          const thingProperty = this.attr(`thing.${property}`);
          if (thingProperty) return thingProperty;
          return property;
        }
        return 'Item';
      },
    },
    /**
     * @property {String} removedNotification
     * @parent i2web/components/favorite
     * The string to notify the User when a item is removed from favorites.
     */
    removedNotification: {
      type: 'string',
      get() {
        return {
          icon: 'icon-app-heart-2',
          text: `'${_truncate(this.attr('displayProperty'), { length: 51 })}' was just removed from Favorites.`,
        };
      },
    },
    /**
     * @property {Object} thing
     * @parent i2web/components/favorite
     * The object that is either favorited or not by the User.
     * Since it can be more than just one type of object and object
     * is a keyword it is named 'thing'.
     */
    thing: {
      Type: canMap,
    },
    /**
     * @property {String} iconClass
     * @parent i2web/components/favorite
     * The icon to display depending on the state of the object.
     */
    iconClass: {
      type: 'string',
      value: 'icon-app-heart-2',
      get() {
        return (this.attr('thing.isFavorite'))
          ? 'icon-app-heart-1'
          : 'icon-app-heart-2';
      },
    },
    /**
     * @property {String} stateClass
     * @parent i2web/components/favorite
     * The color to display depending on the state of the object.
     */
    stateClass: {
      type: 'string',
      value: 'default',
      get() {
        return (this.attr('thing.isFavorite')) ? 'active' : 'default';
      },
    },
    /**
     * @property {Boolean} disabled
     * @parent i2web/components/favorite
     * If true, then no actions should be taken to change the favorite state.
     */
    disabled: {
      type: 'boolean',
      value: false,
    },
  },
  /**
   * @function toggleState
   * @parent i2web/components/favorite
   * Updates the viewModel to change the visual style of the
   * thing. This also updates the tags of the thing to include
   * or remove the favorite tag.
   */
  toggleState() {
    const tagName = this.attr('thing.base:type') === 'dev' ? 'devices.fav' : 'scenes.fav';
    Analytics.tag(tagName);

    if (this.attr('disabled')) {
      return;
    }

    if (this.attr('thing.isFavorite')) {
      this.removeFavorite();
    } else {
      this.addFavorite();
    }
  },
  /**
   * @function addFavorite
   * @parent i2web/components/favorite
   * Update the viewModel object to update the application since we get an empty
   * message response back from the server. Also send the AddTags request to the
   * platform, and a Notification to the User.
   */
  addFavorite() {
    if (this.attr('disabled')) {
      return;
    }

    this.attr('thing.base:tags').push('FAVORITE');
    this.attr('thing').AddTags('FAVORITE');

    const { text, icon } = this.attr('addedNotification');
    Notifications.success(text, icon);
  },
  /**
   * @function removeFavorite
   * @parent i2web/components/favorite
   * Update the viewModel object to update the application since we get an empty
   * message response back from the server. Also send the RemoveTags request to the
   * platform, and a Notification to the User.
   */
  removeFavorite() {
    if (this.attr('disabled')) {
      return;
    }

    const index = this.attr('thing.base:tags').indexOf('FAVORITE');
    if (index === -1) { return; }

    this.attr('thing.base:tags').splice(index, 1);
    this.attr('thing').RemoveTags('FAVORITE');

    const { text, icon } = this.attr('removedNotification');
    Notifications.success(text, icon);
  },
});

export default Component.extend({
  tag: 'arcus-favorite',
  viewModel: ViewModel,
  view,
  events: {
    /**
     * @function click
     * @parent i2web/components/favorite
     * Toggle the state of the component, meaning either
     * add or remove 'FAVORITE' as a tag. Only toggle
     * the component if it is online.
     */
    click() {
      this.viewModel.toggleState();
    },
  },
});
