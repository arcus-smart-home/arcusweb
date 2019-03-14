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
import { FormEvents, FormComponent, FormViewModel } from 'i2web/components/form/';
import canList from 'can-list';
import canMap from 'can-map';
import canRoute from 'can-route';
import 'can-map-define';
import Analytics from 'i2web/plugins/analytics';
import Notifications from 'i2web/plugins/notifications';
import SidePanel from 'i2web/plugins/side-panel';
import Errors from 'i2web/plugins/errors';
import Place from 'i2web/models/place';
import Scene from 'i2web/models/scene';
import SceneTemplate from 'i2web/models/scene-template';
import view from './edit-panel.stache';

export const ViewModel = FormViewModel.extend({
  define: {
    /**
     * @property {canMap} constraints
     * @parent i2web/components/scenes/edit-panel
     *
     * @description Form validation constraints
     */
    constraints: {
      value: {
        'formScene.scene:name': {
          presence: true,
        },
      },
    },
    /**
     * @property {canList} actions
     * @parent i2web/components/scenes/edit-panel
     * @description The resolved actions for the scene's template
     */
    actions: {
      Type: canList,
      set(actions) {
        const partitioned = _.partition(actions, 'satisfiable');

        this.attr('satisfiableActions', partitioned[0]);
        this.attr('satisfiableActions').attr('comparator', 'name');

        this.attr('unsatisfiableActions', partitioned[1]);
        this.attr('unsatisfiableActions').attr('comparator', 'name');

        return actions;
      },
    },
    /**
     * @property {canList} configuredActions
     * @parent i2web/components/scenes/edit-panel
     * A copy of the actions that are currently configured on the scene, this is used for editing.
     */
    configuredActions: {
      Type: canList,
      Value: canList,
    },
   /**
    * @property {boolean} deletingScene
    * @parent i2web/components/scenes/edit-panel
    * Whether the form is being deleted
    */
    deletingScene: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} panelExpanded
     * @parent i2web/components/scenes/edit-panel
     * @description Whether the side panel is double width
     */
    panelExpanded: {
      type: 'boolean',
      value: false,
      set(expanded) {
        $('.panel-container')[(expanded) ? 'addClass' : 'removeClass']('is-double');
        return expanded;
      },
    },
    /**
     * @property {Place} place
     * @parent i2web/component/scenes/edit-panel
     * Need the id of the place we are going to save a new scene to.
     */
    place: {
      Type: Place,
    },
    /**
     * @property {canList} satisfiableActions
     * @parent i2web/components/scenes/edit-panel
     * @description The list of satisfiable actions resolved from the template
     */
    satisfiableActions: {
      Type: canList,
    },
   /**
    * @property {boolean} saving
    * @parent i2web/components/scenes/edit-panel
    * Whether the form is being saved
    */
    savingScene: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {Scene} scene
     * @parent i2web/components/scenes/edit-panel
     * @description The scene to be edited. Before we set the scene we want to deep clone
     * its actions for editing.
     */
    scene: {
      Type: Scene,
      set(scene) {
        if (scene) {
          this.attr('formScene', scene.clone());
          this.attr('configuredActions', _.cloneDeep(scene.attr('scene:actions').serialize()));
        }
        return scene;
      },
    },
    /**
     * @property {Scene} formScene
     * @parent i2web/components/scenes/edit-panel
     * @description Clone of the scene
     */
    formScene: {
      Type: Scene,
      get(scene) {
        if (scene) {
          return scene;
        }
        return new Scene({
          'scene:name': 'New Scene',
        });
      },
    },
    /**
     * @property {string|Object} selectedToEdit
     * @parent i2web/components/scenes/edit-panel
     * @description The type of thing the User has selected to edit, determining what component to render
     * The value can be an action object, the string 'more', or the string 'name'
     */
    selectedToEdit: {
      type: '*',
    },
    /**
     * @property {SceneTemplate} template
     * @parent i2web/components/scenes/edit-panel
     * @description The template of the scene to be edited
     */
    template: {
      Type: SceneTemplate,
      set(template) {
        template.ResolveActions(this.attr('place.base:id')).then(({ actions }) => {
          this.attr('actions', actions);
        }).catch((e) => {
          this.attr('actions', []);
          Errors.log(e, true);
        });
        return template;
      },
    },
    /**
     * @property {canList} unsatisfiableActions
     * @parent i2web/components/scenes/edit-panel
     * @description The list of unsatisfiable actions resolved from the template
     */
    unsatisfiableActions: {
      Type: canList,
    },
  },
  /**
   * @function actionIcon
   *
   * Find the icon associated with a particular action
   * @param {Object} action The action to look up the icon for
   * @return {string}
   */
  actionIcon(action) {
    const icon = (function chooseIconById(id) {
      switch (id) {
        case 'doorlocks': return 'icon-platform-lock';
        case 'garagedoors': return 'icon-platform-garage';
        case 'vents': return 'icon-platform-vent';
        case 'watervalves': return 'icon-platform-water-valve';
        case 'cameras': return 'icon-platform-camera';
        case 'security': return 'icon-app-alarm';
        case 'thermostats': return 'icon-app-thermometer';
        case 'fans': return 'icon-platform-fan';
        case 'switches': return 'icon-platform-light';
        case 'blinds': return 'icon-platform-blinds-1';
        case 'spaceheaters': return 'icon-platform-flame';
        default: return 'icon-app-star-1';
      }
    }(action.id));
    // If the action ID isn't in the array, pop `-2` at the end of it, otherwise
    // use whatver is provided.
    return !_.includes(['thermostats', 'blinds'], action.id) ? `${icon}-2` : icon;
  },
  /**
   * @function cancelDelete
   *
   * Cancel the 'in-progress' delete scene action
   */
  cancelDelete() {
    this.attr('deletingScene', false);
  },
  /**
   * @function continueDelete
   *
   * Confirmation of scene delete, this function will delete the scene
   */
  continueDelete(scene) {
    Analytics.tag('scenes.delete');
    scene.Delete().then(() => {
      SidePanel.closeRight();
    }).catch(e => Errors.log(e, true));
  },
  /**
   * @function expandAndEdit
   *
   * When changing the name, or the 'more actions', or a specific action is clicked on, this function
   * is called. We need to update the chevrons to show the properly selected one, inform whoever is listening
   * that the panel is is now expanded, and then we need to decide what to render and what arguments
   * to pass to what we are rendering. If its not 'more' or 'name', find the appropriate scene action
   * and pass both the scene action, and the action template to the configuration component.
   */
  expandAndEdit(type, element) {
    $('i.chevron-btn').removeClass('active');
    if ($(element).is('i')) {
      $(element).addClass('active');
    } else if ($(element).find('i.chevron-btn')) {
      $(element).find('i.chevron-btn').addClass('active');
    }
    this.attr('panelExpanded', true);

    if (typeof type === 'string') {
      this.attr('selectedToEdit', type);
    } else {
      let context = _.find(this.attr('configuredActions'), action => action.template === type.id);
      if (!context) {
        context = new canMap({ name: type.name, template: type.id, context: {} });
        this.attr('configuredActions').push(context);
      }
      this.attr('selectedToEdit', new canMap({ context, template: type }));
    }
  },
  /**
   * @function collapseRightPanel
   *
   * Collapses the right panel
   */
  collapseRightPanel() {
    $('i.chevron-btn').removeClass('active');
    this.attr('panelExpanded', false);
    this.removeAttr('selectedToEdit');
  },
  /**
   * @function saveScene
   *
   * Filter out any actions that do not have  context (user decided not to configure that action). Update
   * the scene's `scene:actions` property, and save the scene.
   */
  saveScene(vm, el, ev) {
    ev.preventDefault();

    if (this.formValidates()) {
      const actions = this.attr('configuredActions').filter(action => !_.isEmpty(action.context.serialize()));
      const name = this.attr('formScene.scene:name') || this.attr('template.scenetmpl:name');

      let doneSaving = null;
      if (!this.attr('scene')) {
        doneSaving = this.attr('template').Create(this.attr('place.base:id'), name, actions.serialize());
      } else {
        this.attr('scene.scene:name', name);
        this.attr('scene.scene:actions', actions.serialize());
        doneSaving = this.attr('scene').save();
      }

      this.attr('savingScene', true);
      doneSaving.then(() => {
        this.attr('savingScene', false);
        SidePanel.closeRight();
        canRoute.removeAttr('subpage');
        Notifications.success(`'${_.truncate(name, { length: 51 })}' has been saved to ${this.attr('place.place:name')} Scenes.`, 'icon-app-scene-2');
      }).catch((e) => {
        this.attr('savingScene', false);
        Errors.log(e, true);
      });
    }
  },
  /**
   * @function startDelete
   *
   * Start the scene deleting process by allowing the deletion confirmation
   * to display
   */
  startDelete() {
    this.attr('deletingScene', true);
  },
});

const events = Object.assign({}, FormEvents, {
  inserted() {
    // Select the name input element when opening panel for a new scene.
    if (!this.viewModel.attr('scene')) {
      $(this.element).find('.sceneName').focus();
    }
  },

  '{viewModel} selectedToEdit': function selectedToEditChanged() {
    $(this.element).find('.right-content').animate({
      scrollTop: 0,
    });
  },

  // Select the text of the name input element when the User focuses on the field.
  '.sceneName focus': function sceneNameFocus(element) {
    element.select();
  },
});

export default FormComponent.extend({
  tag: 'arcus-scenes-edit-panel',
  ViewModel,
  view,
  events,
});
