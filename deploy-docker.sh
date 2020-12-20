#!/usr/bin/env bash

if [ "$1" == compact ]; then
  container="iobroker_compact"
else
  container="iobroker"
fi

version="2.2.0-pre.5"

echo "[1] Build..."
npm run-script build | sed 's/^/  /'
echo "[2] Pack..."
npm pack --quiet | sed 's/^/  /'
echo "[3] Copy to container..."
cp iobroker.time-switch-${version}.tgz  iobroker-container-data/
echo "[4] Install..."
docker exec ${container} npm install --quiet iobroker.time-switch-${version}.tgz | sed 's/^/  /'
echo "[5] Upload..."
docker exec ${container} iobroker upload time-switch | sed 's/^/  /'
echo "[6] Restart..."
docker exec ${container} iobroker restart vis | sed 's/^/  /'
docker exec ${container} iobroker restart time-switch | sed 's/^/  /'
exit 0
