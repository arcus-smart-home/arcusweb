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
 * @module {Object} i2web/models/HubMetrics HubMetrics
 * @parent app.models.capabilities
 */
export default {
  writeableAttributes: [],
  methods: {
    /**
     * @function StartMetricsJob
     *
     * Start a job of the given name with the given parameters.
     *
     * @param {String} jobname Name of the job to run.
     * @param {long} periodMs How often to get metric updates.
     * @param {long} durationMs How long to run the metrics.
     * @param {list<string>} metrics Name fo the metrics to run, can be a regex to match multiple metrics.
     * @return {Promise}
     */
    StartMetricsJob(jobname, periodMs, durationMs, metrics) {
      return Bridge.request('hubmetric:StartMetricsJob', this.GetDestination(), {
        jobname,
        periodMs,
        durationMs,
        metrics,
      });
    },
    /**
     * @function EndMetricsJobs
     *
     * Instructs the hub to cancel the name metrics reporting job.
     *
     * @param {string} jobname Name of the job to stop stopping.
     * @return {Promise}
     */
    EndMetricsJobs(jobname) {
      return Bridge.request('hubmetric:EndMetricsJobs', this.GetDestination(), {
        jobname,
      });
    },
    /**
     * @function GetMetricsJobInfo
     *
     * Get information about a running job.
     *
     * @param {string} jobname Name of the job to fetch details about.
     * @return {Promise}
     */
    GetMetricsJobInfo(jobname) {
      return Bridge.request('hubmetric:GetMetricsJobInfo', this.GetDestination(), {
        jobname,
      });
    },
    /**
     * @function ListMetrics
     *
     * List all of the current metrics..
     *
     * @param {string} regex Name of the metrics to view.
     * @return {Promise}
     */
    ListMetrics(regex) {
      return Bridge.request('hubmetric:ListMetrics', this.GetDestination(), {
        regex,
      });
    },
    /**
     * @function GetStoredMetrics
     *
     * Retrieves the metrics stored in the long term metrics store.
     *
     * @return {Promise}
     */
    GetStoredMetrics() {
      return Bridge.request('hubmetric:GetStoredMetrics', this.GetDestination(), {});
    },
  },
  events: {},

};
