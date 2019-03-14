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
 * @module {Object} i2web/models/HubDebug HubDebug
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function GetFiles
     *
     * Gets the current contents of the HubOS syslog file.
     *
     * @param {list<string>} paths List of files/directories to return.
     * @return {Promise}
     */
    GetFiles(paths) {
      return Bridge.request('hubdebug:GetFiles', this.GetDestination(), {
        paths,
      });
    },
    /**
     * @function GetAgentDb
     *
     * Gets the current contents of the agent database.
     *
     * @return {Promise}
     */
    GetAgentDb() {
      return Bridge.request('hubdebug:GetAgentDb', this.GetDestination(), {});
    },
    /**
     * @function GetSyslog
     *
     * Gets the current contents of the HubOS syslog file.
     *
     * @return {Promise}
     */
    GetSyslog() {
      return Bridge.request('hubdebug:GetSyslog', this.GetDestination(), {});
    },
    /**
     * @function GetBootlog
     *
     * Gets the current contents of the HubOS bootlog file.
     *
     * @return {Promise}
     */
    GetBootlog() {
      return Bridge.request('hubdebug:GetBootlog', this.GetDestination(), {});
    },
    /**
     * @function GetProcesses
     *
     * Gets the current list of processes from the HubOS.
     *
     * @return {Promise}
     */
    GetProcesses() {
      return Bridge.request('hubdebug:GetProcesses', this.GetDestination(), {});
    },
    /**
     * @function GetLoad
     *
     * Gets the current process load information from the HubOS.
     *
     * @return {Promise}
     */
    GetLoad() {
      return Bridge.request('hubdebug:GetLoad', this.GetDestination(), {});
    },
  },
  events: {},

};
