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

DOCKER_BIN="docker"
DOCKER_PROJECT="eyeris"

docker_build() {
    local DOCKER_PATH="$1"
    local DOCKER_NAME="${2:-$(basename ${DOCKER_PATH})}"
    local DOCKER_TAG=$(echo "${DOCKER_NAME}" |tr '-' '/')

    "${DOCKER_BIN}" build -t "${DOCKER_TAG}" "${DOCKER_PATH}"
}

docker_create() {
    "${DOCKER_BIN}" create $@
}

docker_delete() {
    "${DOCKER_BIN}" rm $@
}

docker_delete_image() {
    "${DOCKER_BIN}" rmi $@
}

docker_run() {
    echo "Executing: ${DOCKER_BIN} run $@"
    "${DOCKER_BIN}" run $@
}

docker_tag() {
    "${DOCKER_BIN}" tag $@
}

docker_push() {
    local COUNT="0"
    local SUCCESS="false"

    while [ $COUNT -lt 4 ]; do
        if "${DOCKER_BIN}" push $@; then
            echo "Push succeeded."
            COUNT="5"
            SUCCESS="true"
        else
            echo "Push failed."
            COUNT=$[$COUNT+1]
        fi
    done

    if [ "$SUCCESS" == "false" ]; then
        echo "Push failed after 5 attempts."
        exit 1
    fi
}

docker_stop() {
    "${DOCKER_BIN}" stop $@
}

docker_exec() {
    "${DOCKER_BIN}" exec $@
}
