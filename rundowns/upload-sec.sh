#!/bin/bash

curl -ks --data-binary @$1 --header 'Content-Type:application/json' http://localhost:3000/ingest/sbSXK5cshqqNYe3nG

echo "\n"
