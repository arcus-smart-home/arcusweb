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

/**
 * @module i2web/app/plugins/side-panel Side Panel
 * @parent app.plugins
 * @description A side panel that slides from the left or right of the screen
 */
import $ from 'jquery';
import canRoute from 'can-route';
import AppState from './get-app-state';

const ON_CLOSE_REMOVE_ROUTE_SUBPAGE = 'remove-route-subpage';
const ON_CLOSE_REMOVE_ROUTE_ACTION = 'remove-route-action';

let closeRightAction = null;
let closeLeftAction = null;

/**
 * @function performAction
 * @param {String} action
 *
 * Perform a specific action at a spefic time. The only time available right
 * now is when the side panels CLOSE.
 */
function performAction(action) {
  switch (action) {
    case ON_CLOSE_REMOVE_ROUTE_ACTION:
      canRoute.removeAttr('action');
      break;
    case ON_CLOSE_REMOVE_ROUTE_SUBPAGE:
      canRoute.removeAttr('action');
      canRoute.removeAttr('subpage');
      break;
    default:
      break;
  }
}

export default {
  /**
   * @function closeLeft
   * @parent i2web/app/plugins/side-panel
   * @description Clear the content of the Left panel, closing it.
   */
  closeLeft() {
    AppState().attr('leftPanelContent', {});
    if (closeLeftAction) {
      performAction(closeLeftAction);
      closeLeftAction = null;
    }
  },
  /**
   * @function closeRight
   * @parent i2web/app/plugins/side-panel
   * @description Clear the content of the Right panel, closing it.
   */
  closeRight() {
    AppState().attr('rightPanelContent', {});
    if (closeRightAction) {
      performAction(closeRightAction);
      closeRightAction = null;
    }
  },
  /**
   * @function close
   * @parent i2web/app/plugins/side-panel
   * @description Closes both left and right panels, shortcut for `closeLeft` and
   * `closeRight`
   */
  close() {
    this.closeLeft();
    this.closeRight();
  },
  /**
   * @function contractLeft
   * @parent i2web/app/plugins/side-panel
   * @description Decreases the size of the left side panel from double to single width.
   */
  contractLeft() {
    $('arcus-side-panel.is-left .panel-container').removeClass('is-double');
  },
  /**
   * @function contractRight
   * @parent i2web/app/plugins/side-panel
   * @description Decreases the size of the right side panel from double to single width.
   */
  contractRight() {
    $('arcus-side-panel.is-right .panel-container').removeClass('is-double');
  },
  /**
   * @function expandLeft
   * @parent i2web/app/plugins/side-panel
   * @description Increases the size of the left side panel from single to double width.
   */
  expandLeft() {
    $('arcus-side-panel.is-left .panel-container').addClass('is-double');
  },
  /**
   * @function expandRight
   * @parent i2web/app/plugins/side-panel
   * @description Increases the size of the right side panel from single to double width.
   */
  expandRight() {
    $('arcus-side-panel.is-right .panel-container').addClass('is-double');
  },
  /**
   * @function left
   * @parent i2web/app/plugins/side-panel
   * @description Render a template in the left panel.
   * @param {String} template
   * @param {Object} attributes
   */
  left(template, attributes = {}, action) {
    this.closeLeft();
    if (action) closeLeftAction = action;

    AppState().attr('leftPanelContent', {
      template,
      attributes,
    });
  },
  /**
   * @function right
   * @parent i2web/app/plugins/side-panel
   * @description Render a template in the right panel.
   * @param {String} template
   * @param {Object} attributes
   */
  right(template, attributes = {}, action) {
    this.closeRight();
    if (action) closeRightAction = action;

    AppState().attr('rightPanelContent', {
      template,
      attributes,
    });
  },
  ON_CLOSE_REMOVE_ROUTE_ACTION,
  ON_CLOSE_REMOVE_ROUTE_SUBPAGE,
};
