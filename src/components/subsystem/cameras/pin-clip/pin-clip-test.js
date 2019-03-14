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
import assert from 'chai';
import CanMap from 'can-map';
import canViewModel from 'can-view-model';
import F from 'funcunit';
import moment from 'moment';
import sample from 'lodash/sample';
import stache from 'can-stache';

import Recording from 'i2web/models/recording';
import data from 'i2web/models/fixtures/data/video/recordings.json';
import { favoriteTag, pinnedIconClassName, unpinnedIconClassName } from './pin-clip';

describe('i2web/components/subsystem/cameras/pin-clip', function pinClip() {
  const template = stache('<arcus-subsystem-cameras-pin-clip {clip}="clip" />');

  beforeEach(function beforeEach(done) {
    const clip = new Recording(sample(data.payload.attributes.recordings));
    clip.AddTags = () => Promise.resolve();
    clip.RemoveTags = () => Promise.resolve();

    const scope = new CanMap({ clip });
    $('#test-area').append(template(scope));
    F('arcus-subsystem-cameras-pin-clip').exists(() => done());
  });

  afterEach(function afterEach() {
    $('#test-area').empty();
  });

  describe('rendering', function rendering() {
    it('shall be rendered on the page', function rendered() {
      assert.lengthOf(
        $('arcus-subsystem-cameras-pin-clip'),
        1,
        'there is one component rendered',
      );
    });

    it('shall have the correct color', function defaultColor() {
      const vm = canViewModel($('arcus-subsystem-cameras-pin-clip').get(0));
      const i = $('arcus-subsystem-cameras-pin-clip i');

      if (vm.attr('clip.isFavorite')) {
        assert.isOk(i.hasClass('active'));
      } else {
        assert.isOk(i.hasClass('default'));
      }
    });

    it('shall have the default icon', function defaultIcon() {
      const vm = canViewModel($('arcus-subsystem-cameras-pin-clip').get(0));
      const i = $('arcus-subsystem-cameras-pin-clip i');

      if (vm.attr('clip.isFavorite')) {
        assert.isOk(i.hasClass(pinnedIconClassName));
      } else {
        assert.isOk(i.hasClass(unpinnedIconClassName));
      }
    });
  });

  describe('unpinning an expired clip', function unpinExpired() {
    it('delegates behavior to onUnpinExpiredCallback callback', function delegates(done) {
      const oneDayAgo = moment().subtract(1, 'day').valueOf();
      const vm = canViewModel($('arcus-subsystem-cameras-pin-clip').get(0));

      vm.attr('clip.base:tags').push(favoriteTag);
      vm.attr('clip.video:deleteTime', oneDayAgo);
      assert(vm.attr('clip.isFavorite'), 'should be favorite to call unpin');
      assert(vm.attr('isClipExpired'), 'should be expired');

      vm.onUnpinExpiredClip = function cb() {
        assert(true, 'it is called');
        done();
      };
      F('.favorite-icon').exists().click();
    });
  });
});
