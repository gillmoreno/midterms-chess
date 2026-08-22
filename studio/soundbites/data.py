"""Shared clip catalog → clips-data.js."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from catalog import CLIPS, PIECE_ID

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
ASSIGN_PATH = ROOT / "assignments.json"
BARK_DIR = REPO / "assets" / "sfx" / "barks"
BARKS_JS = REPO / "js" / "barks.js"
NAMES = {
    "tate": "Andrew Tate",
    "rogan": "Joe Rogan",
    "newsom": "Newsom",
    "aoc": "AOC",
    "bernie": "Bernie",
    "schumer": "Schumer",
    "kamala": "Kamala",
    "warren": "Warren",
    "buttigieg": "Mayor Pete",
    "mamdani": "Mamdani",
    "trump": "Trump",
    "melania": "Melania",
    "mcconnell": "McConnell",
    "rubio": "Rubio",
    "cruz": "Cruz",
    "rfk": "RFK Jr.",
    "vance": "Vance",
    "desantis": "DeSantis",
}
HOUSE = {"commentators": "Booth", "left": "The Left", "right": "The Right"}


def duration_of(path: Path):
    if not path.exists():
        return None
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    try:
        return round(float(r.stdout.strip()), 3)
    except ValueError:
        return None


def load_status():
    p = ROOT / "work" / "status.json"
    return json.loads(p.read_text()) if p.exists() else {}


def load_extended():
    p = ROOT / "work" / "extended.json"
    return json.loads(p.read_text()) if p.exists() else {}


def load_assignments():
    if ASSIGN_PATH.exists():
        return json.loads(ASSIGN_PATH.read_text())
    return {}


def save_assignments(data):
    ASSIGN_PATH.write_text(json.dumps(data, indent=2) + "\n")


def assigned_clip_ids(assignments=None):
    assignments = assignments if assignments is not None else load_assignments()
    ids = set()
    for rows in assignments.values():
        for row in rows:
            ids.add(row["id"])
    return ids


def clip_path(c):
    return ROOT / "clips" / c["group"] / c["speaker"] / f"{c['id']}.mp3"


def build_clips():
    status = load_status()
    ext = load_extended()
    barked = assigned_clip_ids()
    out = []
    for c in CLIPS:
        rec = status.get(c["id"]) or {}
        p = clip_path(c)
        ready = bool(rec.get("ok") and p.exists())
        ex = ext.get(c["id"]) or {}
        ext_rel = ex.get("extended") if ex.get("extended") and (ROOT / ex["extended"]).exists() else None
        out.append({
            "id": c["id"],
            "speaker": c["speaker"],
            "name": NAMES.get(c["speaker"], c["speaker"]),
            "group": c["group"],
            "house": HOUSE.get(c["group"], c["group"]),
            "trigger": c["trigger"],
            "tone": c.get("tone") or "",
            "quote": c["quote"],
            "handful": bool(c.get("handful")),
            "src": f"clips/{c['group']}/{c['speaker']}/{c['id']}.mp3" if ready else None,
            "url": rec.get("url") or "",
            "duration": (
                round(float(ex["sel_end"]) - float(ex["sel_start"]), 3)
                if ready and ex.get("sel_start") is not None and ex.get("sel_end") is not None
                else (duration_of(p) if ready else None)
            ),
            "error": None if ready else (rec.get("error") or "missing"),
            "extended": ext_rel,
            "extDuration": ex.get("duration"),
            "selStart": ex.get("sel_start"),
            "selEnd": ex.get("sel_end"),
            "padBefore": ex.get("pad_before"),
            "padAfter": ex.get("pad_after"),
            "pieceId": PIECE_ID.get(c["speaker"]),
            "bark": c["id"] in barked,
        })
    return out


def write_clips_js():
    clips = build_clips()
    (ROOT / "clips-data.js").write_text("window.CLIPS = " + json.dumps(clips, indent=2) + ";\n")
    return clips


def write_barks_js(assignments=None):
    assignments = assignments if assignments is not None else load_assignments()
    chunks = []
    for piece_id, rows in assignments.items():
        if not rows:
            continue
        items = ",\n".join(
            "    { src: %s, line: %s }" % (json.dumps(r["src"]), json.dumps(r["line"]))
            for r in rows
        )
        chunks.append("  %s: [\n%s,\n  ]" % (json.dumps(piece_id), items))
    body = ",\n".join(chunks)
    if body:
        body += ","
    template = Path(__file__).with_name("barks.template.js").read_text()
    BARKS_JS.write_text(template.replace("/*BARKS*/", body))


def add_bark(clip_id):
    clip = next((c for c in CLIPS if c["id"] == clip_id), None)
    if not clip:
        return None, "unknown clip"
    piece_id = PIECE_ID.get(clip["speaker"])
    if not piece_id:
        return None, "commentators are not board pieces"
    src_mp3 = clip_path(clip)
    if not src_mp3.exists():
        return None, "no cut file — save the trim first"
    BARK_DIR.mkdir(parents=True, exist_ok=True)
    dest = BARK_DIR / f"{clip_id}.mp3"
    dest.write_bytes(src_mp3.read_bytes())
    rel = f"assets/sfx/barks/{clip_id}.mp3"
    assignments = load_assignments()
    rows = assignments.setdefault(piece_id, [])
    if any(r["id"] == clip_id for r in rows):
        for r in rows:
            if r["id"] == clip_id:
                r["line"] = clip["quote"]
                r["src"] = rel
        save_assignments(assignments)
        write_barks_js(assignments)
        return assignments, None
    rows.append({"id": clip_id, "line": clip["quote"], "src": rel})
    save_assignments(assignments)
    write_barks_js(assignments)
    return assignments, None


def remove_bark(clip_id):
    assignments = load_assignments()
    changed = False
    for piece_id, rows in list(assignments.items()):
        keep = [r for r in rows if r["id"] != clip_id]
        if len(keep) != len(rows):
            changed = True
            if keep:
                assignments[piece_id] = keep
            else:
                del assignments[piece_id]
    if not changed:
        return assignments, "not assigned"
    save_assignments(assignments)
    write_barks_js(assignments)
    return assignments, None

