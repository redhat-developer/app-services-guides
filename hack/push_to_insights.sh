#!/usr/bin/env bash
#
# Copyright Strimzi authors.
# License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).

# Inspired by https://disconnected.systems/blog/another-bash-strict-mode/
set -eE -o pipefail
trap 's=$?; echo "$0: error on $0:$LINENO"; exit $s' ERR

SCRIPT=$0

VERSION=${INSIGHTS_VERSION:-}
BRANCH=${INSIGHTS_BRANCH:-"ci-beta"}
DIST_DIR=${INSIGHTS_DIST_DIR:-"./dist"}
REPOSITORY=${INSIGHTS_REPOSITORY:-"https://github.com/RedHatInsights/rhoas-guides-build.git"}
NACHOBOT_TOKEN=${INSIGHTS_NACHOBOT_TOKEN:-}
AUTHOR_NAME=${INSIGHTS_AUTHOR_NAME:-"$(git config user.name || true)"}
AUTHOR_EMAIL=${INSIGHTS_AUTHOR_EMAIL:-"$(git config user.email || true)"}

function usage() {
    echo
    echo "Usage: $SCRIPT [OPTIONS] COMMAND"
    echo
    echo "Options:"
    echo "  --version string            the version for the new dist (env: INSIGHTS_VERSION)"
    echo "  --branch string             the branch where to push the dist (default: ci-beta) (env: INSIGHTS_BRANCH)"
    echo "  --dist-dir string           the dist directory to push (default: ./dist/client) (env: INSIGHTS_DIST_DIR)"
    echo "  --repository string         the repo where to push the dist (default: \"git@github.com:RedHatInsights/rhoas-guides-build.git\") (env: INSIGHTS_REPOSITORY)"
    echo "  --nachobot-token string     the token to use to authenticate as nachobot (env: INSIGHTS_NACHOBOT_TOKEN)"
    echo "  --author-name string        the name to use to commit the dist (env: INSIGHTS_AUTHOR_NAME)"
    echo "  --author-email string       the email to use to commit the dist (env: INSIGHTS_AUTHOR_EMAIL)"
    echo
}

function fatal() {
    echo "$SCRIPT: error: $1" >&2
    return 1
}

function info() {
    echo "$SCRIPT: info: $1" >&2
}

function required() {
    if [[ -z "${!1}" ]]; then
        fatal "$1 is required" || return 1
    fi
}

# Parse arguments
#
while [[ $# -gt 0 ]]; do
    case "$1" in
    -h | --help)
        usage
        exit 0
        ;;
    --version)
        VERSION="$2"
        shift
        shift
        ;;
    --branch)
        BRANCH="$2"
        shift
        shift
        ;;
    --dist-dir)
        DIST_DIR="$2"
        shift
        shift
        ;;
    --repository)
        REPOSITORY="$2"
        shift
        shift
        ;;
    --nachobot-token)
        NACHOBOT_TOKEN="$2"
        shift
        shift
        ;;
    --author-name)
        AUTHOR_NAME="$2"
        shift
        shift
        ;;
    --author-email)
        AUTHOR_EMAIL="$2"
        shift
        shift
        ;;
    *)
        fatal "unknow option $1"
        ;;
    esac
done

# Main
# ---

required VERSION
required AUTHOR_NAME
required AUTHOR_EMAIL
required NACHOBOT_TOKEN

#Inject nachobot and token into https repository string
CREDENTIALS="https://nacho-bot:${NACHOBOT_TOKEN}@"
REPOSITORY="${REPOSITORY/https:\/\//$CREDENTIALS}"

if [[ ! -d "${DIST_DIR}" ]]; then
    fatal "can't find dist directory '${DIST_DIR}'"
fi

if ! git ls-remote --exit-code "${REPOSITORY}" "${BRANCH}"; then
    fatal "the branch '${BRANCH}' doesn't exists on the repo '${REPOSITORY}'"
fi

info "switch to the dist directory '${DIST_DIR}'"
cd "${DIST_DIR}"

info "clone the branch '${BRANCH}' from the repository '${REPOSITORY}'"
git clone --bare --branch "${BRANCH}" --depth 1 "${REPOSITORY}" .git

info "set author username and email"
git config user.name "${AUTHOR_NAME}"
git config user.email "${AUTHOR_EMAIL}"

info "add app.info.json"
echo "{
    \"app_name\": \"rhoas-guides-build\",
    \"src_hash\": \"${VERSION}\"
}" >app.info.json

info "commit the new content"
git config core.bare false
git add -A
git commit -m "Update to ${VERSION}"

info "push to remote"
git push origin ${BRANCH}
