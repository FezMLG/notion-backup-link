#!/usr/bin/env bash
set -u
set -eo pipefail

workdir="$(dirname "$(dirname "$(realpath "$0" )")")"

version="$(jq -r .version "${workdir}"/package.json)"
n8n_version="$(jq -r .n8n-version "${workdir}"/package.json)"
image_tag=":v2-${n8n_version}-${version}"
echo "image_tag=${image_tag}"

echo "BUILDING ${app}, VERSION ${version}"

aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 683390223851.dkr.ecr.eu-west-1.amazonaws.com
docker build --build-arg VERSION="${version}" -t elp-prod-n8n -f "${workdir}"/Dockerfile "${workdir}"
# docker tag fullkontroll-all-"${app}":latest 683390223851.dkr.ecr.eu-west-1.amazonaws.com/fullkontroll-all-"${app}":"${image_tag}"
docker tag elp-prod-n8n:v2-"${n8n_version}"-"${version}" 683390223851.dkr.ecr.eu-west-1.amazonaws.com/elp-prod-n8n:"${image_tag}"
docker push 683390223851.dkr.ecr.eu-west-1.amazonaws.com/elp-prod-n8n::"${image_tag}"