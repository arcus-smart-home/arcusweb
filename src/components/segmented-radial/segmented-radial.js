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
import 'can-map-define';
import view from './segmented-radial.stache';
import './segment/';

export const ViewModel = canMap.extend({
  define: {
    /**
     * @property {canList} segments
     * @parent i2web/components/segmented-radial
     * @description All of the segments
     */
    segments: {
      value: [],
    },
    /**
     * @property {number} rotation
     * @parent i2web/components/segmented-radial
     * @description Degree of rotation to be used
     */
    rotation: {
      get() {
        return 360 / this.attr('segments').attr('length');
      },
    },
    /**
     * @property {number} skew
     * @parent i2web/components/segmented-radial
     * @description Degree of skew to be applied to each segment
     */
    skew: {
      get() {
        return (90 - this.attr('rotation')) / 2;
      },
    },
    /**
     * @property {number} scale
     * @parent i2web/components/segmented-radial
     * @description Scale to be applied to each segment
     */
    scale: {
      get() {
        return this.attr('segments').attr('length') > 3 ? 1 : 1.3;
      },
    },
    /**
     * @property {number} readyCount
     * @parent i2web/components/segmented-radial
     * @description Segments in a "ready" state
     */
    readyCount: {
      get() {
        return this.attr('segments').filter(segment => (segment.attr('state') === 'ready')).attr('length');
      },
    },
    /**
     * @property {boolean} isOff
     * @parent i2web/components/segmented-radial
     * @description Whether the entire radial should be turned "off" (ignores state of individual segments)
     */
    isOff: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {boolean} isEmpty
     * @parent i2web/components/segmented-radial
     * @description Whether the radial has no segments
     */
    isEmpty: {
      type: 'boolean',
      value: false,
    },
    /**
     * @property {string} text
     * @parent i2web/components/segmented-radial
     * @description Text that should be applied to the center section. If set, overrides the default of "# ready / # segments".
     */
    text: {
      type: 'string',
    },
    /**
     * @property {string} containerStyle
     * @parent i2web/components/segmented-radial
     * @description Style to be applied to the container.
     */
    containerStyle: {
      get() {
        const numSegments = this.attr('segments').attr('length');
        // 1 and 2 segments have custom styles which get applied in the "class" function
        if (numSegments < 3) {
          return '';
        }

        const skewedDiff = 90 - this.attr('skew');
        return `transform: rotate(${skewedDiff}deg);`;
      },
    },
  },
  /**
   *
   * @function addSegment
   * @param {SegmentedRadialSegment} segment
   * @parent i2web/components/segmented-radial
   * @description Add a segment to the view model
   */
  addSegment(segment) {
    this.attr('segments').push(segment);
  },
  /**
   *
   * @function removeSegment
   * @param {SegmentedRadialSegment} segment
   * @parent i2web/components/segmented-radial
   * @description Remove a segment from the view model
   */
  removeSegment(segment) {
    const segments = this.attr('segments');
    segments.splice(segments.indexOf(segment), 1);
  },
  /**
   * @function style
   * @param {SegmentedRadialSegment} segment
   * @parent i2web/components/segmented-radial
   * @description Style to be applied to the segment
   */
  style(segment) {
    const index = this.attr('segments').indexOf(segment);
    const numSegments = this.attr('segments').attr('length');

    // 1 and 2 segments have custom styles which get applied in the "class" function
    if (numSegments < 3) {
      return '';
    }

    const rotation = this.attr('rotation') * index;
    return `transform: rotate(${rotation}deg) skew(${this.attr('skew')}deg, ${this.attr('skew')}deg) scale(${this.attr('scale')});`;
  },
  /**
   * @function class
   * @param {SegmentedRadialSegment} segment
   * @parent i2web/components/segmented-radial
   * @description Class to be applied to the segment
   */
  class(segment) {
    const index = this.attr('segments').indexOf(segment);
    const numSegments = this.attr('segments').attr('length');

    // 1 and 2 segments have custom styles which get applied as classes.
    // More than 2 segments get generic styles which get applied in the "styles" function.
    if (numSegments === 1) return 'single';
    if (numSegments === 2) {
      if (index === 0) return 'double first';
      return 'double second';
    }
    return '';
  },
});

export default Component.extend({
  tag: 'arcus-segmented-radial',
  viewModel: ViewModel,
  view,
});
