#!/bin/sh
set -e

echo "Waiting for MongoDB to be ready..."
./wait-for-it.sh mongo:27017 --timeout=60 -- echo "MongoDB is reachable"

echo "Starting Express booking client..."
PORT=4000 node app/api/index.js
