#!/bin/bash

# pull down upstream apicurio registry docs
branch=master

echo "info: fetching upstream content from apicurio registry branch: $branch"
echo 
# -L = follow redirects
curl -L -o $branch.zip https://github.com/Apicurio/apicurio-registry/archive/$branch.zip

# -o = overwrite, -j = flatten directory structure, -q = quiet
unzip -qo $branch.zip "apicurio-registry-$branch/docs/modules/*"

rm $branch.zip

echo "info: completed fetching apicurio registry branch: $branch"
echo
