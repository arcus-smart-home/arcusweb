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

import deepAssign from 'deep-assign';
import appMeta from 'package.json';
import developmentConfig from 'config/development.json';
import productionConfig from 'config/production.json';
import serverConfig from 'config/server.json';
import alarmConfig from 'config/alarms.json';
import careConfig from 'config/care-behaviors.json';
import relationshipsConfig from 'config/relationships.json';
import subsystemConfig from 'config/subsystem.json';
import ruleCategoriesConfig from 'config/rule-categories.json';

const env = window.System.env;
const IS_PRODUCTION = /production/.test(env);

const baseConfig = {
  subsystems: subsystemConfig,
  ruleCategories: ruleCategoriesConfig,
};
let config = {};

if (IS_PRODUCTION) {
  config = deepAssign(baseConfig, productionConfig, serverConfig, {
    version: `${appMeta.version}`,
  });
} else {
  config = deepAssign(baseConfig, developmentConfig, {
    version: `${appMeta.version}-preprod`,
  });
}

export default config;
