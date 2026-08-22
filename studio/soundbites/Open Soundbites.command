#!/bin/bash
cd "$(dirname "$0")"
if ! lsof -nP -iTCP:8765 -sTCP:LISTEN >/dev/null 2>&1; then
  /usr/bin/env python3 server.py >/tmp/soundbites-server.log 2>&1 &
  for i in 1 2 3 4 5 6 7 8 9 10; do
    curl -sf "http://127.0.0.1:8765/" >/dev/null 2>&1 && break
    sleep 0.2
  done
fi
open "http://127.0.0.1:8765/"
