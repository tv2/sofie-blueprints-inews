#!/bin/bash

curl -ks --data-binary @$1 --header 'Content-Type:application/json' http://localhost:3000/ingest/D6v7NANzTBqor2EeE

echo "\n"
