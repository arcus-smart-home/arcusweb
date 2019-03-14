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
import canList from 'can-list';
import 'can-map-define';
import view from './notification-list.stache';

import Analytics from 'i2web/plugins/analytics';
import Errors from 'i2web/plugins/errors';
import getAppState from 'i2web/plugins/get-app-state';
import SidePanel from 'i2web/plugins/side-panel';
import Place from 'i2web/models/place';
import Person from 'i2web/models/person';
import Subsystem from 'i2web/models/subsystem';
import AlarmCapability from 'i2web/models/capability/Alarm';
import _keyBy from 'lodash/keyBy';
import _filter from 'lodash/filter';

import 'i2web/components/settings/people/add-person/';

function callTreeGetterGenerator(enabled = true) {
  return function get(lastSetVal, setAttr) {
    const place = this.attr('place');
    const callTree = this.attr('subsystem.subalarm:callTree');

    if (place && callTree) {
      const isPlaceBasic = place.attr('isBasic');
      // Because we need to regenerate the lists whenever anything in the subalarm:callTree list
      // changes we need to iterate over every item and force a listen to each item's enabled and
      // person attribute
      callTree.each((ct) => {
        ct.attr('enabled');
        ct.attr('person');
      });

      // If the place is basic and we are generating the disabledCallTree list, we want to return
      // an empty list of people as only the owner should be rendered
      if (isPlaceBasic && !enabled) {
        setAttr(lastSetVal.replace([]));
        return;
      }

      place.peopleWithAccess().then((persons) => {
        const personsMap = _keyBy(persons, 'base:address');
        const newTree = _filter(callTree.map(person => ({
          enabled: person.attr('enabled'),
          person: new Person(personsMap[person.attr('person')]),
        })), ['enabled', enabled]);

        // If the place is basic, and we are generating the enabledCallTree list, only return the first
        // person, who is the owner.
        if (isPlaceBasic && enabled) {
          setAttr(lastSetVal.replace([newTree[0]]));
        } else {
          setAttr(lastSetVal.replace(newTree));
        }
      }).catch((e) => {
        setAttr([]);
        Errors.log(e, true);
      });
    }
  };
}

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {Place} place
     * @parent i2web/components/subsystem/alarms/notification-list
     * @description The active place
     */
    place: {
      Type: Place,
    },
    /**
     * @property {boolean} showNotificationList
     * @parent i2web/components/subsystem/alarms/notification-list
     * @description Only show notification list when 1 or more alarm systems is not INACTIVE
     */
    showNotificationList: {
      type: 'boolean',
      get() {
        const subsystem = this.attr('subsystem');
        return subsystem && (subsystem.attr('alarm:alertState:CO') !== AlarmCapability.ALERTSTATE_INACTIVE
          || subsystem.attr('alarm:alertState:PANIC') !== AlarmCapability.ALERTSTATE_INACTIVE
          || subsystem.attr('alarm:alertState:SECURITY') !== AlarmCapability.ALERTSTATE_INACTIVE
          || subsystem.attr('alarm:alertState:SMOKE') !== AlarmCapability.ALERTSTATE_INACTIVE
          || subsystem.attr('alarm:alertState:WATER') !== AlarmCapability.ALERTSTATE_INACTIVE);
      },
    },
    /**
     * @property {Subsystem} subsystem
     * @parent i2web/components/subsystem/alarms/notification-list
     * @description The active alarm subsystem
     */
    subsystem: {
      Type: Subsystem,
    },
    /**
     * @property {canList} enabledCallTree
     * @parent i2web/components/subsystem/alarms/notification-list
     * @description A filtered version of the subsystem's call tree, consisting of all the enabled
     * people. Each item consists of two properties: `enabled` which should be true, and `person`
     * which is a Person model
     */
    enabledCallTree: {
      Value: canList,
      get: callTreeGetterGenerator(true),
    },
    /**
     * @property {canList} disabledCallTree
     * @parent i2web/components/subsystem/alarms/notification-list
     * @description A filtered version of the subsystem's call tree, consisting of all the disabled
     * people. Each item consists of two properties: `enabled` which should be false, and `person`
     * which is a Person model
     */
    disabledCallTree: {
      Value: canList,
      get: callTreeGetterGenerator(false),
    },
  },
  /**
   * @function toggleFlag
   * @parent i2web/components/subsystem/alarms/notification-list
   * @param {canMap} callTreeItem The item in the callTree
   * @param {Object} ev The event object
   * @description Toggles whether or not the person in the call tree should be enabled on notifications
   */
  toggleFlag(callTreeItem, ev) {
    const place = this.attr('place');
    const callTree = this.attr('enabledCallTree');

    if (callTreeItem.person.getPlaceRole(place.attr('base:id')) === 'OWNER') {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }

    if (!callTreeItem.attr('enabled') && callTree.attr('length') === 6) {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
    const value = !callTreeItem.attr('enabled');
    callTreeItem.attr('enabled', value);
    Analytics.tag(`alarms.settings.notification.${value ? 'added' : 'removed'}`);
    this.saveTree();
  },

  /**
   * @function moveUp
   * @parent i2web/components/subsystem/alarms/notification-list
   * @param {canMap} callTreeItem The item in the callTree
   * @param {Object} ev The event object
   * @description Moves the person up higher on the notification list in the call tree
   */
  moveUp(callTreeItem, ev) {
    const enabledCallTree = this.attr('enabledCallTree');
    const index = enabledCallTree.indexOf(callTreeItem);

    ev.preventDefault();
    ev.stopPropagation();

    enabledCallTree.splice(index, 1);
    enabledCallTree.splice(index - 1, 0, callTreeItem);

    this.saveTree();
  },

  /**
   * @function moveDown
   * @parent i2web/components/subsystem/alarms/notification-list
   * @param {canMap} callTreeItem The item in the callTree
   * @param {Object} ev The event object
   * @description Moves the person down lower on the notification list in the call tree
   */
  moveDown(callTreeItem, ev) {
    const enabledCallTree = this.attr('enabledCallTree');
    const index = enabledCallTree.indexOf(callTreeItem);

    ev.preventDefault();
    ev.stopPropagation();

    enabledCallTree.splice(index, 1);
    enabledCallTree.splice(index + 1, 0, callTreeItem);

    this.saveTree();
  },
  /**
   * @function saveTree
   * @parent i2web/components/subsystem/alarms/notification-list
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

    subsystem.attr('subalarm:callTree', newTree);
    subsystem.save();
  },

  /**
   * @function addPerson
   * @parent i2web/components/subsystem/alarms/notification-list
   * @description Opens sidebar with add person form
   */
  addPerson() {
    const template = `<arcus-settings-people-add-person {inviter}="inviter" {place}="place" />`;
    SidePanel.right(template, {
      inviter: getAppState().compute('person'),
      place: this.compute('place'),
    });
  },
});

export default Component.extend({
  tag: 'arcus-subsystem-alarms-notification-list',
  viewModel: ViewModel,
  view,
  helpers: {
    /**
   * @function isLastInList
   * @parent i2web/components/subsystem/alarms/notification-list
   * @param {Number} index The index to check
   * @param {Array|canList} list The list to check
   * @description Returns whether or not the given index is the last in the given list
   */
    isLastInList(index, list) {
      return index === list.length - 1;
    },
  },
});
