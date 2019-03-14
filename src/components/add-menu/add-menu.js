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
import canRoute from 'can-route';
import 'can-map-define';
import addMenuItems from 'config/add-menu-items';
import 'i2web/helpers/global';
import Errors from 'i2web/plugins/errors';
import SidePanel from 'i2web/plugins/side-panel';
import view from './add-menu.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property menuItems
     * @parent i2web/components/add-menu
     * @description Pull the items in from a config file so we don't
     * have to change code to add more items.
     */
    menuItems: {
      get(__, setAttr) {
        Promise.all(addMenuItems.map((i) => {
          return (typeof i.enabled === 'function')
            ? i.enabled.call(this)
            : i.enabled;
        })).then((enabled) => {
          const toDisplay = addMenuItems
            .filter((i, index) => enabled[index])
            .map((i) => {
              if (typeof i.available === 'function') {
                i.available = i.available.call(this);
              }
              return i;
            });
          setAttr(toDisplay);
        }).catch(Errors.log);
      },
    },
  },
  /**
   * @function allowInteractionWith
   * @parent i2web/components/add-menu
   * @param {Object} item One of the Add Menu items
   * @description Determine whether the User can interact with the menu item.
   */
  allowInteractionWith(item) {
    return item.available && item.action;
  },
  /**
   * @function executeClickAction
   * @parent i2web/components/add-menu
   * @param {Object} item One of the Add Menu items
   * @description If the property is string, assume it is route. If it
   * is a function execute it.
   */
  executeClickAction(item) {
    if (typeof item.action === 'function') {
      item.action.bind(this)();
    } else {
      SidePanel.closeRight();
      const [page, subpage, action] = item.action.split('/');
      canRoute.attr({ page, subpage, action });
    }
  },
});

export default Component.extend({
  tag: 'arcus-add-menu',
  viewModel: ViewModel,
  view,
});
