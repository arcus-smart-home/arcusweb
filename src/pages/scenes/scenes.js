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
import Analytics from 'i2web/plugins/analytics';
import Component from 'can-component';
import canEvent from 'can-event';
import canMap from 'can-map';
import canRoute from 'can-route';
import 'can-map-define';
import SidePanel from 'i2web/plugins/side-panel';
import Errors from 'i2web/plugins/errors';
import Account from 'i2web/models/account';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import Scene from 'i2web/models/scene';
import SceneTemplate from 'i2web/models/scene-template';
import SceneService from 'i2web/models/service/SceneService';
import view from './scenes.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Account} account
     * @parent i2web/pages/rules
     * @description The User's account object passed in by AppState
     */
    account: {
      Type: Account,
    },
    /**
     * @property {Boolean} isOwner
     * @parent i2web/pages/scenes
     * @description Whether the currently logged in person is this place's account owner
     */
    isOwner: {
      type: 'boolean',
      get() {
        return this.attr('person.base:id') === this.attr('account.account:owner');
      },
    },
    /**
     * @property {Person} person
     * @parent i2web/pages/scenes
     * @description The default person.
     */
    person: {
      Type: Person,
    },
    /**
     * @property {String} place
     * @parent i2web/pages/scenes
     * @description The currently selected place.
     */
    place: {
      Type: Place,
      set(place) {
        if (place) {
          SceneService.ListSceneTemplates(place['base:id']).then(({ sceneTemplates }) => {
            this.attr('templates', sceneTemplates);
          }).catch((e) => {
            this.attr('templates', []);
            Errors.log(e, true);
          });
        }
        return place;
      },
    },
    /**
     * @property {Scene.List} scenes
     * @parent i2web/pages/scenes
     *
     * Scene list to display
     */
    scenes: {
      Type: Scene.List,
      set(scenes) {
        return scenes && scenes.attr('comparator', (s1, s2) => {
          return s1.attr('scene:name').toLowerCase() > s2.attr('scene:name').toLowerCase() ? 1 : -1;
        });
      },
    },
    /**
     * @property {SceneTemplate.List} templates
     * @parent i2web/pages/scenes
     *
     * All templates from the platform
     */
    templates: {
      Type: SceneTemplate.List,
    },
  },
  /**
   * @function createNewScene
   * @parent i2web/pages/scenes
   * Use the custom template to start the process of creating a new scene
   */
  createNewScene() {
    const tagName = `scenes.add`;
    Analytics.tag(tagName);

    canRoute.attr({ subpage: 'add' });
  },
  /**
   * @function showAddScenePanel
   * @parent i2web/pages/scenes
   * Find the appropriate template for the scene, and show the scenes edit panel
   */
  showAddScenePanel(templates) {
    const template = _.find(templates || this.attr('templates'), { 'base:address': 'SERV:scenetmpl:custom' });
    template.ResolveActions(this.attr('place.base:id')).then(({ actions }) => {
      actions.sort((a, b) => {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
      });
      SidePanel.right('<arcus-scenes-edit-panel {actions}="actions" {place}="place" {template}="template" />', {
        actions,
        place: this.attr('place'),
        template,
      }, SidePanel.ON_CLOSE_REMOVE_ROUTE_SUBPAGE);
    }).catch(e => Errors.log(e, true));
  },
  /**
   * @function showExamplesPanel
   * @parent i2web/pages/scenes
   * @description Show the examples side panel
   */
  showExamplesPanel() {
    const tagName = `scenes.examples`;
    Analytics.tag(tagName);
    SidePanel.right('{{close-button type="done"}}<arcus-scenes-examples />', {});
  },
  /**
   * @function templateFor
   * @parent i2web/pages/scenes
   * @param {Scene} scene The scene to use to look up its template
   *
   * @description Using a scene, look up its associated template
   */
  templateFor(scene) {
    return _.find(this.attr('templates'), (t) => {
      return scene.attr('scene:template') === t.attr('base:id');
    });
  },
});

export default Component.extend({
  tag: 'arcus-page-scenes',
  viewModel: ViewModel,
  view,
  events: {
    inserted() {
      canEvent.listenTo.call(this, canRoute, 'subpage', (__, action) => {
        const page = canRoute.attr('page') === 'scenes';
        if (page && action && (action === 'add')) {
          this.viewModel.showAddScenePanel();
        }
      });
    },
    removed() {
      canEvent.stopListening.call(this, canRoute, 'subpage');
    },
    /**
     * @function onTemplates
     * @description In order to create a new Scene (via the route) we need to
     * be sure that the scene templates have been requested and received.
     */
    '{viewModel} templates': function onTemplates() {
      if (canRoute.attr('subpage') === 'add') {
        this.viewModel.showAddScenePanel();
      }
    },
  },
});
