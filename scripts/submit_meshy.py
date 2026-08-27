#!/usr/bin/env python3
"""Create Meshy image-to-3d tasks for every roster figurine."""
import json
import base64
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = Path.home() / ".grok/skills/meshy-3d-generation/scripts/meshy_task.py"
OUT = ROOT / "scripts" / "meshy-jobs.json"
PAYLOADS = ROOT / "scripts" / "payloads"
PAYLOADS.mkdir(parents=True, exist_ok=True)

PIECES = [
    ("right-king", "trump.jpg"),
    ("right-queen", "melania.jpg"),
    ("right-rook", "mcconnell.jpg"),
    ("right-rook-paul", "paul.jpg"),
    ("right-rook-ks", "rubio.jpg"),
    ("right-bishop", "cruz.jpg"),
    ("right-bishop-ks", "rfk.jpg"),
    ("right-knight", "vance.jpg"),
    ("right-knight-ks", "desantis.jpg"),
    ("right-pawn", "pawn-right.jpg"),
    ("left-king", "newsom.jpg"),
    ("left-queen", "aoc.jpg"),
    ("left-rook", "sanders.jpg"),
    ("left-rook-ks", "warren.jpg"),
    ("left-rook-warren", "warren.jpg"),
    ("left-bishop", "harris.jpg"),
    ("left-bishop-ks", "schumer.jpg"),
    ("left-bishop-schumer", "schumer.jpg"),
    ("left-knight", "buttigieg.jpg"),
    ("left-knight-ks", "mamdani.jpg"),
    ("left-pawn", "pawn-left.jpg"),
]


def create(name, image_name):
    img = ROOT / "assets" / "portraits" / image_name
    raw = img.read_bytes()
    uri = "data:image/jpeg;base64," + base64.b64encode(raw).decode("ascii")
    payload = {
        "image_url": uri,
        "model_type": "smart-topology",
        "ai_model": "meshy-t2",
        "target_polycount": 12000,
        "should_texture": True,
        "multi_view_thumbnails": True,
    }
    pfile = PAYLOADS / f"{name}.json"
    pfile.write_text(json.dumps(payload))
    proc = subprocess.run(
        [
            "python3",
            str(SKILL),
            "create",
            "--endpoint",
            "/openapi/v1/image-to-3d",
            "--payload-file",
            str(pfile),
        ],
        cwd=str(ROOT),
        check=True,
        capture_output=True,
        text=True,
    )
    tid = proc.stdout.strip().splitlines()[-1].strip()
    print(name, tid, flush=True)
    return tid


def main():
    jobs = []
    for name, image in PIECES:
        tid = create(name, image)
        jobs.append({"name": name, "task_id": tid, "image": image})
    OUT.write_text(json.dumps(jobs, indent=2))
    print("wrote", OUT, flush=True)


if __name__ == "__main__":
    main()
