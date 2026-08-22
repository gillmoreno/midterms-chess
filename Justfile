# Floor Vote local recipes

port := "8765"

# Kill whatever is on 8765, then run the soundbite studio
soundbites:
    #!/usr/bin/env bash
    set -euo pipefail
    pids="$(lsof -nP -iTCP:{{port}} -sTCP:LISTEN -t 2>/dev/null || true)"
    if [[ -n "${pids}" ]]; then
      kill ${pids} 2>/dev/null || true
      sleep 0.3
    fi
    (sleep 0.5 && open "http://127.0.0.1:{{port}}/") &
    exec python3 studio/soundbites/server.py
