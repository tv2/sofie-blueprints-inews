#!/bin/sh

if [[ -z "${SERVER}" ]]; then
    echo "SERVER env undefined"
    exit 1
fi

yarn && yarn build-now --env.server=$SERVER

if [[ -d "/opt/blueprints/nginx" ]]; then
    echo "Volume mount exists copying files"
    cp -r shelf-layouts/ nginx/
    cp -r external-frames/ nginx/
fi