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

import assert from 'chai';
import { Source } from './infinite-scroll';

let source;

describe('i2web/components/infinite-scroll', () => {
  beforeEach((done) => {
    source = new Source({
      template: '<div/>',
    });
    done();
  });

  describe('Source', () => {
    it('utilizes the regular template if no tombstone template was provided', () => {
      const template = source._template;
      const tombstoneTemplate = source._tombstoneTemplate;

      assert.equal(template, tombstoneTemplate, 'templates are the same');
    });

    it('creates a tombstone with the tombstone class', () => {
      const tombstone = source.createTombstone();

      assert.ok(tombstone.classList.contains('tombstone'), 'tombstone template has tombstone class');
    });

    it('returns the same element when rendering when provided one', () => {
      const div = document.createElement('div');

      let rendered = source.render({}, {}, div);

      assert.equal(div, rendered, 'is the same element');

      rendered = source.render({}, {});

      assert.notEqual(div, rendered, 'is new element');
    });

    it('returns the number of items you request when you fetch by default', (done) => {
      const NUM_ITEMS = 30;
      source.fetch(NUM_ITEMS).then((items) => {
        assert.equal(items.length, NUM_ITEMS);
        done();
      }).catch(() => {
        console.error(arguments);
        done();
      });
    });
  });
});
