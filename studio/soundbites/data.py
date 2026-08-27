"""Shared clip catalog → clips-data.js."""
from __future__ import annotations

import importlib
import json
import subprocess
from pathlib import Path

import catalog

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
ASSIGN_PATH = ROOT / "assignments.json"
LAST_PATH = ROOT / "last-words.json"
ORDER_PATH = ROOT / "orders.json"
BARK_DIR = REPO / "assets" / "sfx" / "barks"
LAST_DIR = REPO / "assets" / "sfx" / "last-words"
ORDER_DIR = REPO / "assets" / "sfx" / "orders"
REEL_DIR = ROOT / "reels"
CINE_DIR = REPO / "assets" / "cinematics"
BARKS_JS = REPO / "js" / "barks.js"
LAST_JS = REPO / "js" / "last-words.js"
ORDERS_JS = REPO / "js" / "orders.js"
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
    "leavitt": "Karoline Leavitt",
    "melania": "Melania",
    "mcconnell": "McConnell",
    "rubio": "Rubio",
    "cruz": "Cruz",
    "paul": "Rand Paul",
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


def load_last_words():
    if LAST_PATH.exists():
        return json.loads(LAST_PATH.read_text())
    return {}


def save_last_words(data):
    LAST_PATH.write_text(json.dumps(data, indent=2) + "\n")


def load_orders():
    if ORDER_PATH.exists():
        return json.loads(ORDER_PATH.read_text())
    return {}


def save_orders(data):
    ORDER_PATH.write_text(json.dumps(data, indent=2) + "\n")


def assigned_clip_ids(assignments=None):
    assignments = assignments if assignments is not None else load_assignments()
    ids = set()
    for rows in assignments.values():
        for row in rows:
            ids.add(row["id"])
    return ids


def clip_path(c):
    return ROOT / "clips" / c["group"] / c["speaker"] / f"{c['id']}.mp3"


def reel_rel(clip_id):
    local = REEL_DIR / f"{clip_id}.mp4"
    shipped = CINE_DIR / f"{clip_id}.mp4"
    if local.exists() and local.stat().st_size > 2000:
        return f"reels/{clip_id}.mp4"
    if shipped.exists() and shipped.stat().st_size > 2000:
        return f"../../assets/cinematics/{clip_id}.mp4"
    return None


def reel_poster(clip_id):
    for p, rel in (
        (REEL_DIR / f"{clip_id}.jpg", f"reels/{clip_id}.jpg"),
        (CINE_DIR / f"{clip_id}.jpg", f"../../assets/cinematics/{clip_id}.jpg"),
    ):
        if p.exists() and p.stat().st_size > 500:
            return rel
    return None


def find_clip(clip_id):
    return next((c for c in catalog.CLIPS if c["id"] == clip_id), None)


def build_clips():
    importlib.reload(catalog)
    status = load_status()
    ext = load_extended()
    barked = assigned_clip_ids()
    lasted = assigned_clip_ids(load_last_words())
    ordered = assigned_clip_ids(load_orders())
    out = []
    for c in catalog.CLIPS:
        rec = status.get(c["id"]) or {}
        p = clip_path(c)
        ready = bool(rec.get("ok") and p.exists())
        ex = ext.get(c["id"]) or {}
        ext_rel = ex.get("extended") if ex.get("extended") and (ROOT / ex["extended"]).exists() else None
        piece_id = catalog.PIECE_ID.get(c["speaker"])
        name = (
            (catalog.TARGET_NAME.get(piece_id) if piece_id else None)
            or NAMES.get(c["speaker"], c["speaker"])
        )
        out.append({
            "id": c["id"],
            "speaker": c["speaker"],
            "name": name,
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
            "pieceId": catalog.PIECE_ID.get(c["speaker"]),
            "target": c.get("target") or "",
            "targetName": catalog.TARGET_NAME.get(c.get("target") or "", c.get("target") or ""),
            "bark": c["id"] in barked,
            "lastWord": c["id"] in lasted,
            "order": c["id"] in ordered,
            "fate": c.get("fate") or "",
            "reel": reel_rel(c["id"]),
            "poster": reel_poster(c["id"]),
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
    clip = find_clip(clip_id)
    if not clip:
        return None, "unknown clip"
    piece_id = catalog.PIECE_ID.get(clip["speaker"])
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


def write_last_words_js(assignments=None):
    assignments = assignments if assignments is not None else load_last_words()
    chunks = []
    for piece_id, rows in assignments.items():
        if not rows:
            continue
        items = ",\n".join(
            "    { src: %s, line: %s, fate: %s%s }"
            % (
                json.dumps(r["src"]),
                json.dumps(r["line"]),
                json.dumps(r.get("fate") or "captured"),
                "".join(
                    [
                        (
                            ", reel: %s, poster: %s"
                            % (json.dumps(r["reel"]), json.dumps(r.get("poster") or ""))
                            if r.get("reel")
                            else ""
                        ),
                        ", onReel: true" if r.get("onReel") else "",
                    ]
                ),
            )
            for r in rows
        )
        chunks.append("  %s: [\n%s,\n  ]" % (json.dumps(piece_id), items))
    body = ",\n".join(chunks)
    if body:
        body += ","
    template = Path(__file__).with_name("last-words.template.js").read_text()
    LAST_JS.write_text(template.replace("/*LAST_WORDS*/", body))


def add_last_word(clip_id):
    clip = find_clip(clip_id)
    if not clip:
        return None, "unknown clip"
    piece_id = catalog.PIECE_ID.get(clip["speaker"])
    if not piece_id:
        return None, "commentators are not board pieces"
    src_mp3 = clip_path(clip)
    if not src_mp3.exists():
        return None, "no cut file — save the trim first"
    LAST_DIR.mkdir(parents=True, exist_ok=True)
    dest = LAST_DIR / f"{clip_id}.mp3"
    dest.write_bytes(src_mp3.read_bytes())
    rel = f"assets/sfx/last-words/{clip_id}.mp3"
    fate = clip.get("fate") or "captured"
    assignments = load_last_words()
    rows = assignments.setdefault(piece_id, [])
    cine = CINE_DIR / f"{clip_id}.mp4"
    extra = {}
    if cine.exists():
        extra["reel"] = f"assets/cinematics/{clip_id}.mp4"
        if (CINE_DIR / f"{clip_id}.jpg").exists():
            extra["poster"] = f"assets/cinematics/{clip_id}.jpg"
    if any(r["id"] == clip_id for r in rows):
        for r in rows:
            if r["id"] == clip_id:
                r["line"] = clip["quote"]
                r["src"] = rel
                r["fate"] = fate
                r.update(extra)
        save_last_words(assignments)
        write_last_words_js(assignments)
        return assignments, None
    rec = {"id": clip_id, "line": clip["quote"], "src": rel, "fate": fate}
    rec.update(extra)
    rows.append(rec)
    save_last_words(assignments)
    write_last_words_js(assignments)
    return assignments, None


def remove_last_word(clip_id):
    assignments = load_last_words()
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
        return assignments, None
    save_last_words(assignments)
    write_last_words_js(assignments)
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
        return assignments, None
    save_assignments(assignments)
    write_barks_js(assignments)
    return assignments, None


def write_orders_js(assignments=None):
    assignments = assignments if assignments is not None else load_orders()
    chunks = []
    for key, rows in assignments.items():
        if not rows:
            continue
        items = ",\n".join(
            "    { src: %s, line: %s, speaker: %s, target: %s }"
            % (
                json.dumps(r["src"]),
                json.dumps(r["line"]),
                json.dumps(r.get("speaker") or ""),
                json.dumps(r.get("target") or ""),
            )
            for r in rows
        )
        chunks.append("  %s: [\n%s,\n  ]" % (json.dumps(key), items))
    body = ",\n".join(chunks)
    if body:
        body += ","
    template = Path(__file__).with_name("orders.template.js").read_text()
    ORDERS_JS.write_text(template.replace("/*ORDERS*/", body))


def add_order(clip_id):
    clip = find_clip(clip_id)
    if not clip:
        return None, "unknown clip"
    piece_id = catalog.PIECE_ID.get(clip["speaker"])
    target = clip.get("target")
    if not piece_id:
        return None, "commentators are not board pieces"
    if not target:
        return None, "this line has no capture target — Order is for king-vs-victim bites"
    src_mp3 = clip_path(clip)
    if not src_mp3.exists():
        return None, "no cut file — save the trim first"
    ORDER_DIR.mkdir(parents=True, exist_ok=True)
    dest = ORDER_DIR / f"{clip_id}.mp3"
    dest.write_bytes(src_mp3.read_bytes())
    rel = f"assets/sfx/orders/{clip_id}.mp3"
    assignments = load_orders()
    key = "%s:%s" % (piece_id, target)
    rows = assignments.setdefault(key, [])
    rec = {
        "id": clip_id,
        "line": clip["quote"],
        "src": rel,
        "speaker": piece_id,
        "target": target,
    }
    if any(r["id"] == clip_id for r in rows):
        for r in rows:
            if r["id"] == clip_id:
                r.update(rec)
        save_orders(assignments)
        write_orders_js(assignments)
        return assignments, None
    rows.append(rec)
    save_orders(assignments)
    write_orders_js(assignments)
    return assignments, None


def remove_order(clip_id):
    assignments = load_orders()
    changed = False
    for key, rows in list(assignments.items()):
        keep = [r for r in rows if r["id"] != clip_id]
        if len(keep) != len(rows):
            changed = True
            if keep:
                assignments[key] = keep
            else:
                del assignments[key]
    if not changed:
        return assignments, None
    save_orders(assignments)
    write_orders_js(assignments)
    return assignments, None


def set_use(clip_id, slot, on):
    if slot == "click":
        return add_bark(clip_id) if on else remove_bark(clip_id)
    if slot == "captured":
        return add_last_word(clip_id) if on else remove_last_word(clip_id)
    if slot == "order":
        return add_order(clip_id) if on else remove_order(clip_id)
    return None, "unknown slot"


def attach_reel_fields(clip_id):
    assignments = load_last_words()
    changed = False
    cine = f"assets/cinematics/{clip_id}.mp4"
    poster = f"assets/cinematics/{clip_id}.jpg"
    has_poster = (CINE_DIR / f"{clip_id}.jpg").exists()
    for rows in assignments.values():
        for r in rows:
            if r["id"] == clip_id:
                r["reel"] = cine
                if has_poster:
                    r["poster"] = poster
                changed = True
    if changed:
        save_last_words(assignments)
        write_last_words_js(assignments)
    return assignments


def overlay_reel(clip_id):
    """Lay this bite's audio on a filmed mute lose bed."""
    existing = reel_rel(clip_id)
    if existing:
        return existing, None
    mute = REEL_DIR / f"{clip_id}-mute.mp4"
    if not mute.exists() or mute.stat().st_size < 2000:
        return None, "no defeated reel filmed yet"
    clip = find_clip(clip_id)
    audio = clip_path(clip) if clip else None
    if audio is None or not audio.exists():
        audio = LAST_DIR / f"{clip_id}.mp3"
    if not audio.exists():
        return None, "no audio cut to overlay"
    REEL_DIR.mkdir(parents=True, exist_ok=True)
    dest = REEL_DIR / f"{clip_id}.mp4"
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(mute), "-i", str(audio),
        "-filter_complex", "[1:a]adelay=500|500,apad=whole_dur=6.04[a]",
        "-map", "0:v:0", "-map", "[a]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest",
        "-movflags", "+faststart", str(dest),
    ]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if p.returncode != 0 or not dest.exists() or dest.stat().st_size < 2000:
        return None, (p.stderr or p.stdout or "ffmpeg failed")[-400:]
    CINE_DIR.mkdir(parents=True, exist_ok=True)
    shipped = CINE_DIR / f"{clip_id}.mp4"
    shipped.write_bytes(dest.read_bytes())
    still = REEL_DIR / f"{clip_id}.jpg"
    if still.exists():
        (CINE_DIR / f"{clip_id}.jpg").write_bytes(still.read_bytes())
    attach_reel_fields(clip_id)
    return f"reels/{clip_id}.mp4", None

