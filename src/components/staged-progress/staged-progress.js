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
import Component from 'can-component';
import canMap from 'can-map';
import 'can-map-define';
import view from './staged-progress.stache';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {htmlbool} inProgress
     * @parent i2web/components/staged-progress
     * @description Whether the current stage is in progress
     */
    inProgress: {
      type: 'htmlbool',
    },
    /**
     * @property {Array} stages
     * @parent i2web/components/staged-progress
     * @description The ordered list of stage names
     */
    stages: {
      value: [
        'select-plan',
        'create-login',
        'build-profile',
      ],
    },
  },
  /**
   * @function {Boolean} comesBeforeStage
   * @param {String} before The name of the stage in question
   * @param {String} currentStage The current stage of the component
   *
   * Whether the 'before' comes before the 'currentStage' in the stage collection
   */
  comesBeforeStage(before, currentStage) {
    const property = _.startCase(before);
    if (currentStage !== property) {
      const stageIndex = _.findIndex(this.attr('stages'), (stage) => {
        return _.startCase(stage) === currentStage;
      });
      const propIndex = _.findIndex(this.attr('stages'), (stage) => {
        return _.startCase(stage) === property;
      });
      return propIndex < stageIndex;
    }
    return false;
  },
  /**
   * @function {Boolean} hasStarted
   * @param {String} name The name of the stage in question
   *
   * Whether the stage argument has started progress or completed
   */
  hasStarted(name) {
    const property = _.startCase(name);
    const currentStage = this.attr('currentStage');
    if (currentStage !== property) {
      return this.comesBeforeStage(property, currentStage);
    }
    return true;
  },
  /**
   * @function {String} stateClass
   * @param {String} name The name of the stage in question
   *
   * The state class to adjust the visuals of the stage in question
   */
  stateClass(name) {
    const property = _.startCase(name);
    const currentStage = this.attr('currentStage');
    if (currentStage === property) {
      return this.attr('inProgress')
        ? 'icon-app-more-1'
        : 'icon-app-check';
    }
    return (this.comesBeforeStage(property, currentStage))
      ? 'icon-app-check'
      : 'icon-app-add';
  },
  /**
   * @function {String} stateText
   * @param {String} name The name of the stage in question
   *
   * The state text of the stage in question
   */
  stateText(name) {
    const property = _.startCase(name);
    const currentStage = this.attr('currentStage');
    if (currentStage === property) {
      return this.attr('inProgress') ? 'In Progress' : 'Complete';
    }
    return (this.comesBeforeStage(property, currentStage))
      ? 'Complete'
      : 'Not Started';
  },
  /**
   * @function {String} stageAttr
   * @param {String} name The name of the stage
   *
   * Change the name of a stage from something like 'Create Login' to 'create-login'
   */
  stageAttr(name) {
    return name.toLowerCase().split(' ').join('-');
  },
  /**
   * @function {String} stageText
   * @param {String} attr The attribute to be converted to displayed text
   *
   * The inverse of `stageAttr` take a attr like 'in-progress' and convert
   * it to 'In Progress'
   */
  stageText(attr) {
    return _.startCase(attr.split('-').join(' '));
  },
  /**
   * @function switchStageTo
   * @param {String} stage The selected stage
   *
   * Set the current stage to the argument stage
   */
  switchStageTo(stage) {
    this.attr('currentStage', this.stageText(stage));
  },
});

export default Component.extend({
  tag: 'arcus-staged-progress',
  viewModel: ViewModel,
  view,
  events: {
    /**
     * @function findStageFromAttr
     *
     * Filter through the attributes on the Element looking for one
     * that matches one of the 'stages'
     */
    findStageFromAttr() {
      const stage = _.find(this.element.attributes, (attr) => {
        return attr.name !== 'in-progress' && attr.name !== '{stages}';
      });
      if (stage) this.viewModel.switchStageTo(stage.name);
    },
    inserted: 'findStageFromAttr',
    '{element} attributes': 'findStageFromAttr',
  },
});
