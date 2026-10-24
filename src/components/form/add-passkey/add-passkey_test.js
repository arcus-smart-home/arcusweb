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

import 'mocha/mocha';
import assert from 'chai';
import { suggestedName, addPasskeyErrorMessage } from './add-passkey';

describe('i2web/components/form/add-passkey', function addPasskey() {
  describe('suggestedName', function suggested() {
    it('names the browser and system', function names() {
      const expected = {
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36': 'Chrome on Mac',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15': 'Safari on Mac',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0': 'Edge on Windows',
        'Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0': 'Firefox on Linux',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1': 'Safari on iPhone',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.0.0 Mobile/15E148 Safari/604.1': 'Chrome on iPhone',
        'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36': 'Chrome on Android',
      };
      Object.keys(expected).forEach((userAgent) => {
        assert.equal(suggestedName(userAgent), expected[userAgent], userAgent);
      });
    });

    it('falls back to a generic name', function fallback() {
      assert.equal(suggestedName('curl/8.0'), 'Passkey');
    });
  });

  describe('addPasskeyErrorMessage', function errorMessage() {
    it('says nothing when the browser prompt is dismissed', function dismissed() {
      ['NotAllowedError', 'AbortError'].forEach((name) => {
        assert.isNull(addPasskeyErrorMessage({ name }));
      });
    });

    it('reports a passkey that is already saved', function duplicate() {
      assert.equal(addPasskeyErrorMessage({ name: 'InvalidStateError' }), 'You already have a passkey for your Arcus account saved here.');
    });

    it('reports connection and server failures', function failures() {
      assert.equal(addPasskeyErrorMessage({ status: 0 }), 'Unable to reach the server. Please check your connection and try again.');
      assert.equal(addPasskeyErrorMessage({ status: 503 }), 'A server error occurred. Please try again later.');
      assert.equal(addPasskeyErrorMessage({ status: 404 }), 'Passkeys are not available right now.');
    });

    it('reports anything else as a failure to add the passkey', function other() {
      [{ status: 400 }, { name: 'SecurityError' }, undefined].forEach((e) => {
        assert.equal(addPasskeyErrorMessage(e), 'The passkey could not be added. Please try again.');
      });
    });
  });
});
