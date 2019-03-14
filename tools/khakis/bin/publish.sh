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

args=$(getopt v: $*)

set -- $args
for i; do
   case "$i" in
   -v)
      export version="${2}"; shift;
      shift;;
   --)
      shift;
      break;;
   esac
done

if [ -z "${version}" ]; then
    version="latest"
fi

echo "Version: ${version}"

# Include common functionality
SCRIPT_PATH="$0"
SCRIPT_DIR=$(dirname ${SCRIPT_PATH})
. "${SCRIPT_DIR}/common.sh"

# Check that this isn't already set
HOST_NAME=odr.irisbylowes.com

while (( "$#" )); do
   CONTAINER_NAME="$1"
   shift

   echo "Publishing $DOCKER_PROJECT/$CONTAINER_NAME:${version} to $HOST_NAME..."
   docker_tag "$DOCKER_PROJECT/$CONTAINER_NAME:${version}" "$HOST_NAME/$DOCKER_PROJECT/$CONTAINER_NAME:$version"
   docker_push "$HOST_NAME/$DOCKER_PROJECT/$CONTAINER_NAME:${version}"
done
