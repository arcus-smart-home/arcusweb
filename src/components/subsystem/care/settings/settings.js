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
import CanMap from 'can-map';
import canList from 'can-list';
import 'can-map-define';
import view from './settings.stache';
import _filter from 'lodash/filter';
import _keyBy from 'lodash/keyBy';
import 'i2web/components/settings/people/add-person/';
import Subsystem from 'i2web/models/subsystem';
import Person from 'i2web/models/person';
import Place from 'i2web/models/place';
import Errors from 'i2web/plugins/errors';
import AppState from 'i2web/plugins/get-app-state';
import SidePanel from 'i2web/plugins/side-panel';

/**
 * @function callTreeGetterGenerator
 * @parent i2web/components/subsystem/care/settings
 * @param {boolean} enabled Whether the person is enabled in the call tree
 * @description maps people to the call tree and filters based on enabled
 */
function callTreeGetterGenerator(enabled = true) {
  return function get(lastSetVal, setAttr) {
    const place = this.attr('place');
    const callTree = this.attr('subsystem.subcare:callTree');

    // Because we need to regenerate the lists whenever anything in the subcare:callTree list
    // changes we need to iterate over every item and force a listen to each item's enabled and
    // person attribute
    callTree.each((ct) => {
      ct.attr('enabled');
      ct.attr('person');
    });

    if (place && callTree) {
      place.peopleWithAccess().then((persons) => {
        const personsMap = _keyBy(persons, 'base:address');
        const newTree = _filter(callTree.map(person => ({
          enabled: person.attr('enabled'),
          person: new Person(personsMap[person.attr('person')]),
        })), ['enabled', enabled]);

        setAttr(lastSetVal.replace(newTree));
      }).catch((e) => {
        setAttr([]);
        Errors.log(e, true);
      });
    }
  };
}

export const ViewModel = CanMap.extend({
  define: {
    /**
     * @property {canList} enabledCallTree
     * @parent i2web/components/subsystem/care/settings
     * @description A filtered version of the subsystem's call tree, consisting
     * of all the enabled people. Each item consists of two properties: `enabled`
     * which should be true, and `person` which is a Person model
     */
    enabledCallTree: {
      Value: canList,
      get: callTreeGetterGenerator(true),
    },
    /**
     * @property {canList} disabledCallTree
     * @parent i2web/components/subsystem/care/settings
     * @description A filtered version of the subsystem's call tree, consisting
     * of all the disabled people. Each item consists of two properties: `enabled`
     * which should be false, and `person` which is a Person model
     */
    disabledCallTree: {
      Value: canList,
      get: callTreeGetterGenerator(false),
    },
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/care/settings
     * @description The active place
     */
    place: {
      Type: Place,
      get() {
        return AppState().attr('place');
      },
    },
    /**
     * @property {Boolean} silent
     * @parent i2web/components/subsystem/care/settings
     * @description Boolean representing silent attribute
     */
    silentConfig: {
      get() {
        return this.attr('subsystem.subcare:silent');
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/care/settings
     * @description The associated subsystem, this should be a subsystem with the subcare capability
     */
    subsystem: {
      Type: Subsystem,
    },
  },
  /**
   * @function addPerson
   * @parent i2web/components/subsystem/care/settings
   * @description Opens sidebar with add person form
   */
  addPerson() {
    const template = `<arcus-settings-people-add-person {inviter}="inviter" {place}="place" />`;
    SidePanel.right(template, {
      inviter: AppState().compute('person'),
      place: this.compute('place'),
    });
  },
  /**
   * @function saveTree
   * @parent i2web/components/subsystem/care/settings
   * @description Merges the enabled and disabled call tree and saves it to the subsystem.
   */
  saveTree() {
    const enabledCallTree = this.attr('enabledCallTree');
    const disabledCallTree = this.attr('disabledCallTree');
    const subsystem = this.attr('subsystem');

    const newTree = [...enabledCallTree.map(item => ({
      enabled: item.attr('enabled'),
      person: item.person.attr('base:address'),
    })), ...disabledCallTree.map(item => ({
      enabled: item.attr('enabled'),
      person: item.person.attr('base:address'),
    }))];

    subsystem.attr('subcare:callTree', newTree);
    subsystem.save();
  },
  /**
   * @function toggleCallTree
   * @parent i2web/components/subsystem/care/settings
   * @param {canMap} callTreeItem The item in the callTree
   * @param {Object} ev The event object
   * @description toggles if the person is enabled or disabled
   *
   */
  toggleCallTree(callTreeItem, ev) {
    ev.preventDefault();
    const value = !callTreeItem.attr('enabled');
    callTreeItem.attr('enabled', value);
    this.saveTree();
  },
  /**
   * @function toggleState
   * @parent i2web/components/subsystem/care/settings
   * @description Changes the state of silent for subcare
   *
   */
  toggleState() {
    const subsystem = this.attr('subsystem');
    subsystem.attr('subcare:silent', !this.attr('silentConfig'));
    subsystem.save().catch(e => Errors.log(e));
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-care-settings',
  viewModel: ViewModel,
  view,
});
