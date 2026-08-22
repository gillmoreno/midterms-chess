#!/usr/bin/env python3
"""Local player + recut API. Serves this folder. POST /api/cut to save a trim."""
from __future__ import annotations

import json
import shutil
import subprocess
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from catalog import CLIPS
from data import (
    ROOT,
    add_bark,
    clip_path,
    load_assignments,
    load_extended,
    remove_bark,
    write_clips_js,
)

PORT = 8765
ORIG = ROOT / "work" / "clip-originals"
ORIG.mkdir(parents=True, exist_ok=True)


def ffmpeg_cut(src: Path, dest: Path, start: float, end: float):
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(".tmp.mp3")
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(src),
        "-ss", f"{start:.3f}", "-to", f"{end:.3f}",
        "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        str(tmp),
    ]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if p.returncode != 0 or not tmp.exists() or tmp.stat().st_size < 800:
        if tmp.exists():
            tmp.unlink()
        return False, (p.stderr or p.stdout or "ffmpeg failed")[-600:]
    tmp.replace(dest)
    return True, None


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def log_message(self, fmt, *args):
        if args and str(args[0]).startswith("GET /extended"):
            return
        if args and str(args[0]).startswith("GET /clips"):
            return
        super().log_message(fmt, *args)

    def _json(self, code, obj):
        raw = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/clips":
            self._json(200, {"clips": write_clips_js(), "assignments": load_assignments()})
            return
        if path == "/api/assignments":
            self._json(200, {"assignments": load_assignments()})
            return
        if path in ("/", "/index.html"):
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        n = int(self.headers.get("Content-Length") or 0)
        try:
            body = json.loads(self.rfile.read(n).decode() or "{}")
        except json.JSONDecodeError:
            return self._json(400, {"ok": False, "error": "bad json"})
        if path == "/api/cut":
            return self.save_cut(body)
        if path == "/api/reset":
            return self.reset_cut(body)
        if path == "/api/bark":
            return self.save_bark(body)
        if path == "/api/unbark":
            return self.drop_bark(body)
        self._json(404, {"ok": False, "error": "unknown"})

    def save_cut(self, body):
        cid = body.get("id")
        try:
            start = float(body["start"])
            end = float(body["end"])
        except (KeyError, TypeError, ValueError):
            return self._json(400, {"ok": False, "error": "start/end required"})
        if end - start < 0.25:
            return self._json(400, {"ok": False, "error": "selection too short"})
        if end - start > 60:
            return self._json(400, {"ok": False, "error": "selection too long (60s max)"})
        clip = next((c for c in CLIPS if c["id"] == cid), None)
        if not clip:
            return self._json(404, {"ok": False, "error": "unknown clip"})
        ext_map = load_extended()
        ex = ext_map.get(cid) or {}
        src = ROOT / (ex.get("extended") or "")
        if not src.exists():
            return self._json(400, {"ok": False, "error": "no extended audio for this clip"})
        dest = clip_path(clip)
        backup = ORIG / f"{cid}.mp3"
        if dest.exists() and not backup.exists():
            shutil.copy2(dest, backup)
        ok, err = ffmpeg_cut(src, dest, start, end)
        if not ok:
            return self._json(500, {"ok": False, "error": err})
        if "orig_sel_start" not in ex:
            ex["orig_sel_start"] = ex.get("sel_start")
            ex["orig_sel_end"] = ex.get("sel_end")
        ex["sel_start"] = round(start, 3)
        ex["sel_end"] = round(end, 3)
        ext_map[cid] = ex
        (ROOT / "work" / "extended.json").write_text(json.dumps(ext_map, indent=2) + "\n")
        clips = write_clips_js()
        row = next(x for x in clips if x["id"] == cid)
        print(f"cut {cid} {start:.2f}-{end:.2f} -> {row['duration']}s", flush=True)
        return self._json(200, {"ok": True, "clip": row})

    def reset_cut(self, body):
        cid = body.get("id")
        clip = next((c for c in CLIPS if c["id"] == cid), None)
        ext_map = load_extended()
        ex = ext_map.get(cid) or {}
        src = ROOT / (ex.get("extended") or "")
        if not clip or not src.exists():
            return self._json(400, {"ok": False, "error": "no extended audio"})
        start = float(ex.get("orig_sel_start", ex.get("sel_start") or 0))
        end = float(ex.get("orig_sel_end", ex.get("sel_end") or start + 1))
        dest = clip_path(clip)
        ok, err = ffmpeg_cut(src, dest, start, end)
        if not ok:
            backup = ORIG / f"{cid}.mp3"
            if backup.exists():
                shutil.copy2(backup, dest)
            else:
                return self._json(500, {"ok": False, "error": err})
        ex["sel_start"] = round(start, 3)
        ex["sel_end"] = round(end, 3)
        ext_map[cid] = ex
        (ROOT / "work" / "extended.json").write_text(json.dumps(ext_map, indent=2) + "\n")
        clips = write_clips_js()
        row = next(x for x in clips if x["id"] == cid)
        return self._json(200, {"ok": True, "clip": row})

    def save_bark(self, body):
        cid = body.get("id")
        assignments, err = add_bark(cid)
        if err:
            return self._json(400, {"ok": False, "error": err})
        clips = write_clips_js()
        row = next((x for x in clips if x["id"] == cid), None)
        print(f"bark {cid}", flush=True)
        return self._json(200, {"ok": True, "clip": row, "assignments": assignments})

    def drop_bark(self, body):
        cid = body.get("id")
        assignments, err = remove_bark(cid)
        if err:
            return self._json(400, {"ok": False, "error": err})
        clips = write_clips_js()
        row = next((x for x in clips if x["id"] == cid), None)
        return self._json(200, {"ok": True, "clip": row, "assignments": assignments})


def main():
    write_clips_js()
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Soundbites player: http://127.0.0.1:{PORT}/", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
