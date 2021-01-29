#!/usr/bin/env bash
#
# Copyright RedHat.
# License: MIT License see the file LICENSE

# Inspired by https://disconnected.systems/blog/another-bash-strict-mode/
set -eEu -o pipefail
trap 's=$?; echo "[ERROR] [$(date +"%T")] on $0:$LINENO"; exit $s' ERR

function log() {
    echo "[$1] [$(date +"%T")] - ${2}"
}

function step() {
    log "STEP" "$1"
}

if [[ ! -d ./.git ]]; then
    echo "error: the pr_check.sh script must be executed from the project root"
    exit 1
fi

CONTAINER_ENGINE=${CONTAINER_ENGINE:-"docker"}
TOOLS_IMAGE=${TOOLS_IMAGE:-"quay.io/app-sre/mk-ci-tools:latest"}
TOOLS_HOME=$(mktemp -d)

function run() {
    ${CONTAINER_ENGINE} run \
        -u ${UID} \
        -v ${TOOLS_HOME}:/thome:z \
        -e HOME=/thome \
        -v ${PWD}:/workspace:z \
        -w /workspace \
        ${TOOLS_IMAGE} \
        $@
}

step "Pull tools image"
${CONTAINER_ENGINE} pull ${TOOLS_IMAGE}

step "Install npm dependencies"
run npm clean-install

step "skipping test until type errors resolved upstream"
#run npx npm-run-all --serial lint test
echo "TODO"

step "Test image build"
run npm run clean    # clean the build dist before testing the container build
rm -rf node_modules/ # clean node_modules before testing the container build
docker build -t guides:latest -f ./build/dockerfile .
