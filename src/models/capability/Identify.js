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

import Bridge from 'i2web/cornea/bridge';

/**
 * @module {Object} i2web/models/Identify Identify
 * @parent app.models.capabilities
 *
 * This capability is used by devices that can identify themselves in the real world.  The underlying real use of this capability is to make sure that the RF connection to the device works and to also show the user which is which if more than one is attached (assuming the system names them &quot;device 1&quot; and &quot;device 2&quot; like Arcus1). Often this will mean blinking an LED, although it could also be playing a sound or some other feedback to let the user know which device &#x27;this&#x27; is.
Sometimes, the only thing that can be done is to activate the device. For example: garage door openers, even though it has an LED, it is quite small on something likely attached to the ceiling, so better is to just open the door. Also: smoke detectors have no LED and sleep aggressively. Arcus1 instructs the user to make sure email notifications are set up properly, and then when the &quot;test&quot; button is pressed, the smoke detector beeps, and a message is sent to the hub, which creates an email sent to the user &quot;The &quot;test&quot; button of your Arcus smoke detector &quot;living room&quot; has been pressed&quot; which completes an end-to-end test AND shows the user which device is which.
In both of these examples, the Identify() function will be NOP, but the UX for identify will need to be noted.
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function Identify
     *
     * Causes this device to identify itself by blinking an LED or playing a sound.  This method should not return a response to a request until the device has started its notification.  It is expected notification will last for a short period of time, and this call will be repeated often.  A second call to Identify while the device is already actively identifying itself should be a no-op and return immediately.
     *
     * @return {Promise}
     */
    Identify() {
      return Bridge.request('ident:Identify', this.GetDestination(), {});
    },
  },
  events: {},

};
