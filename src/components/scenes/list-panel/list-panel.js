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
import _ from 'lodash';
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import Analytics from 'i2web/plugins/analytics';
import AppState from 'i2web/plugins/get-app-state';
import SidePanel from 'i2web/plugins/side-panel';
import Notifications from 'i2web/plugins/notifications';
import Errors from 'i2web/plugins/errors';
import Scene from 'i2web/models/scene';
import SceneTemplate from 'i2web/models/scene-template';
import view from './list-panel.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Array} actions
     * @parent i2web/components/scenes/list-panel
     * @description The resolved actions for the scene's template
     */
    actions: {
      Type: Array,
      set(actions) {
        const sorted = actions.sort((a, b) => {
          return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
        });
        return _.flatten(_.partition(sorted, 'satisfiable'));
      },
    },
    /**
     * @property {Scene} scene
     * @parent i2web/components/scenes/list-panel
     * @description The scene to be displayed by this panel
     */
    scene: {
      Type: Scene,
    },
    /**
     * @property {SceneTemplate} template
     * @parent i2web/components/scenes/list-panel
     * @description The scene template the scene was created from
     */
    template: {
      Type: SceneTemplate,
      set(template) {
        template.ResolveActions(AppState().attr('placeId')).then(({ actions }) => {
          this.attr('actions', actions);
        }).catch(e => Errors.log(e, true));
        return template;
      },
    },
  },
  /**
   * @function editAction
   *
   * Edit a particular action of the scene
   */
  editScene(scene, template) {
    Analytics.tag('scenes.edit');
    SidePanel.right('<arcus-scenes-edit-panel {place}="place" {(scene)}="scene" {template}="template" />', {
      place: AppState().attr('place'),
      scene,
      template,
    });
  },
  /**
   * @function notificationIconOf
   *
   * @param {Scene} scene The scene on which to check the property
   * Based on the scene's 'scene:notification' icon, determine what icon to
   * display.
   */
  notificationIconOf(scene) {
    return (scene.attr('scene:notification'))
      ? 'icon-app-notification-1'
      : 'icon-app-notification-2';
  },
  /**
   * @function runScene
   *
   * Fires the scene, allowing it to run
   * @param {Scene} scene The scene to run
   */
  runScene(scene) {
    scene.Fire().then(() => {
      Notifications.success(`'${_.truncate(scene.attr('scene:name'), { length: 51 })}' has run.`, scene.attr('icon').value);
    }).catch(e => Errors.log(e, true));
  },
  /**
   * @function toggleNotificationOf
   *
   * @param {Scene} scene The scene on which to toggle the property
   * Toggle the value of the 'scene:notification' property, and notify
   * the User of the change.
   */
  toggleNotificationOf(scene) {
    const notifying = scene.attr('scene:notification');
    scene.attr('scene:notification', !notifying);
    scene.save().then(() => {
      const name = _.truncate(this.attr('scene.scene:name'), { length: 51 });
      const text = `You will ${(!notifying) ? 'be' : 'no longer be'} notified when '${name}' is run.`;
      Notifications.success(text, 'icon-app-notification-2');
    }).catch(e => Errors.log(e, true));
  },
});

export default Component.extend({
  tag: 'arcus-scenes-list-panel',
  viewModel: ViewModel,
  view,
  helpers: {
    /**
     * @function pluralizeActions
     *
     * If the number of actions is 1 singularize the Action, otherwise pluralize it
     * @param {Array} actions The collection actions associated with the scene
     * @return {String}
     */
    pluralizeActions(actions) {
      let length = 0;
      if (actions) {
        length = actions.attr('length');
      }
      return `${length} ${(length === 1) ? 'Action' : 'Actions'}`;
    },
    /**
     * @function pluralizeDevices
     *
     * If the number of devices is 1 singularize the Device, otherwise pluralize it
     * @param {Array} actions The collection actions associated with the scene
     * @return {String}
     */
    pluralizeDevices(actions) {
      let length = 0;
      if (actions) {
        length = actions.serialize()
          .map(a => _.keys(a.context).length)
          .reduce((sum, n) => sum + n, 0);
      }
      return `${length} ${(length === 1) ? 'Device' : 'Devices'}`;
    },
  },
  events: {
    '.newProperty focus': function inputIsolate(el) {
      $(el).closest('.panel-list-container').addClass('is-isolating');
    },
    '.newProperty blur': function inputUnIsolate(el) {
      $(el).closest('.panel-list-container').delay(200).removeClass('is-isolating');
    },
  },
});
