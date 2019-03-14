# Copyright 2019 Arcus Project
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#!/bin/bash

# Detect the platform
PLATFORM=$(uname)
if [[ "$PLATFORM" == 'Darwin' ]]; then
  PLATFORM=darwin
elif [[ "$PLATFORM" == 'Linux' ]]; then
  PLATFORM=linux
fi

# Kill the process on port 3996 (Testee)
if [[ "$PLATFORM" == 'darwin' ]]; then
  lsof -i tcp:8080 | grep LISTEN | awk '{print $2}' | xargs kill 2> /dev/null
else
  kill $(fuser -n tcp 3621 2> /dev/null) 2> /dev/null
fi

if [ $? -eq 0 ]
then
  echo "Processes killed, cleanup complete."
else
  echo "No processes to kill, cleanup complete." >&2
fi
