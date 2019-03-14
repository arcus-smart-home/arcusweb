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
import stache from 'can-stache';
import isEmptyObject from 'can-util/js/is-empty-object/';
import canDev from 'can-util/js/dev/';
import 'can-map-define';
import view from './side-panel.stache';
import $ from 'jquery';
import SidePanel from 'i2web/plugins/side-panel';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Boolean} hidden
     * @parent i2web/components/side-panel
     * @description A helper property to indicate whether the side panel is shown or hidden.
     * This was created because 'content' is either an object with a tag and
     * attributes properties or an empty object; both are truthy and don't
     * make for good template conditionals.
     */
    hidden: {
      type: 'boolean',
      get() {
        const content = this.attr('content');
        return (content && isEmptyObject(content.serialize()));
      },
    },
    /**
     * @property {canMap} content
     * @parent i2web/components/side-panel
     * @param {Object} An object that includes the following properties:
     * @option {String} [tag] The tag name or template of the component to render
     * @option {Array} [attributes] Argument required to render the template
     *
     * @description This property is read by the side-panel indicating what template to
     * display with what values.
     */
    content: {
      Type: canMap,
    },
  },
  /**
   * @function clearContent
   * @parent i2web/components/side-panel
   * @description Closes the side-panel by clearing the content.
   */
  closePanel() {
    this.attr('content', {});
  },
});

export default Component.extend({
  tag: 'arcus-side-panel',
  viewModel: ViewModel,
  view,
  events: {
    init() {
      this.$el = $(this.element);
    },
    '{viewModel} content': function shows(vm, ev, value) {
      if (!value.attr('template') || !value.attr('attributes')) {
        this.$el.find('.panel-container').empty();
        $('body').removeClass('panel-open');
        return;
      }

      const renderer = stache(value.template);
      const fragment = renderer(Object.assign(value.attributes, {
        closePanel() {
          vm.closePanel.call(vm);
        },
      }));
      if (fragment) {
        $('body').addClass('panel-open');
        this.$el.find('.panel-container').empty().append(fragment);
      } else {
        canDev.warn('The side-panel was unable to render "value.template".');
        vm.closePanel();
      }
    },
    '{document} keyup': function onKeyPress(el, ev) {
      if (ev.keyCode === 27) {
        SidePanel.close();
      }
    },
    '{element} beforeremove': function beforeRemove() {
      $('body').removeClass('panel-open');
    },
  },
});
