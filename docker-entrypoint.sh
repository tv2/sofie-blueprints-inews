#!/bin/sh

if [[ -z "${SERVER}" ]]; then
    echo "$SERVER undifnied"
    exit 1
fi

yarn && yarn build-now --env.server=$SERVER