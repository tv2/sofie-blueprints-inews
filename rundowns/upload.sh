#!/bin/bash

STUDIO_ID=studio0
if [[ $1 != "" ]]
then
  STUDIO_ID=$1
fi

curl -ks --data-binary @output.json --header 'Content-Type:application/json' http://localhost:3000/ingest/${STUDIO_ID}

echo "\n"
