#!/bin/bash

RUNDOWN_FILE=converted-rundown.json
if [[ $1 != "" ]]
then
  RUNDOWN_FILE=$1
fi

STUDIO_ID=studio0
if [[ $2 != "" ]]
then
  STUDIO_ID=$2
fi

echo $STUDIO_ID

curl -ks --data-binary @$RUNDOWN_FILE --header 'Content-Type:application/json' http://localhost:3000/ingest/${STUDIO_ID}

echo "\n"
