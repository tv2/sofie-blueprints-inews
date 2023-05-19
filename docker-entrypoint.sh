#!/bin/sh

if [[ -z "${SERVER}" ]]; then
    echo "SERVER env undefined"
    exit 1
fi

echo "Run yarn with proxy"
echo "HTTP_PROXY=$HTTP_PROXY"
echo "HTTP_PROXYS=$HTTP_PROXYS"
yarn

echo "Run yarn build-now without http proxy envs"
unset HTTP_PROXY HTTPS_PROXY
echo "HTTP_PROXY=$HTTP_PROXY"
echo "HTTP_PROXYS=$HTTP_PROXYS"
yarn build-now --env.server=$SERVER

if [[ -d "/opt/blueprints/nginx" ]]; then
    echo "Volume mount exists copying files"
    cp -r shelf-layouts/ nginx/
    cp -r external-frames/ nginx/
fi

cd shelf-layouts

./upload.sh