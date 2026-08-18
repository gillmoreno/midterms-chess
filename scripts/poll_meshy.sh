#!/bin/sh
set -eu
NAME="$1"
TASK_ID="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL="$HOME/.grok/skills/meshy-3d-generation/scripts/meshy_task.py"
cd "$ROOT"
PROJ=$(python3 "$SKILL" project-dir --task-id "$TASK_ID" --prompt "$NAME")
echo "POLL $NAME $TASK_ID -> $PROJ"
python3 "$SKILL" poll --endpoint /openapi/v1/image-to-3d --task-id "$TASK_ID" --timeout 600 --project-dir "$PROJ"
python3 "$SKILL" download --task-json "$PROJ/task_$TASK_ID.json" --format glb --output "assets/models/${NAME}.glb"
python3 "$SKILL" record --project-dir "$PROJ" --task-id "$TASK_ID" --task-type image-to-3d --stage complete --files "assets/models/${NAME}.glb" || true
python3 "$SKILL" thumbnail --project-dir "$PROJ" --task-json "$PROJ/task_$TASK_ID.json" || true
ls -la "assets/models/${NAME}.glb"
echo "DONE $NAME"
