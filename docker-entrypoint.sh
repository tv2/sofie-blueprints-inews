#!/bin/sh

if [[ -z "${SERVER}" ]]; then
    echo "SERVER env undefined"
    exit 1
fi

yarn && yarn build-now --env.server=$SERVER