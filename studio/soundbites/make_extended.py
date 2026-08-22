#!/usr/bin/env python3
"""Build ~15s-padded extended audio for every ready clip."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from catalog import CLIPS

ROOT = Path(__file__).resolve().parent
SOURCES = ROOT / "sources"
EXT = ROOT / "extended"
STATUS = ROOT / "work" / "status.json"
OUT = ROOT / "work" / "extended.json"
LOGS = ROOT / "work" / "logs"
PAD = 15.0
EXT.mkdir(exist_ok=True)
LOGS.mkdir(parents=True, exist_ok=True)

YT = [
    "yt-dlp", "--no-playlist", "--ignore-no-formats-error", "--retries", "3",
    "--extractor-args", "youtube:player_client=mweb",
    "-f", "18/bestaudio/best",
]


def ffprobe_dur(path: Path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(r.stdout.strip())
    except ValueError:
        return None


def video_id(url: str):
    if not url:
        return None
    if "watch?v=" in url:
        return parse_qs(urlparse(url).query).get("v", [None])[0]
    return None


def ffmpeg_slice(src: Path, dest: Path, start: float, end: float):
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-ss", f"{max(0.0, start):.3f}", "-to", f"{end:.3f}",
        "-i", str(src),
        "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        str(dest),
    ]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if p.returncode != 0 or not dest.exists() or dest.stat().st_size < 800:
        return False, (p.stderr or "")[-400:]
    return True, None


def find_source(vid: str, start: float, end: float):
    full = SOURCES / f"{vid}.mp3"
    if full.exists():
        return full, 0.0
    wins = sorted(SOURCES.glob(f"{vid}_*.mp3"))
    for p in wins:
        try:
            lo, hi = p.stem.rsplit("_", 1)[1].split("-")
            lo, hi = float(lo), float(hi)
        except (ValueError, IndexError):
            continue
        if lo - 0.5 <= start and hi + 0.5 >= end:
            return p, lo
    if wins:
        # closest window
        p = wins[0]
        try:
            lo = float(p.stem.rsplit("_", 1)[1].split("-")[0])
        except (ValueError, IndexError):
            lo = 0.0
        return p, lo
    return None, 0.0


def download_window(url: str, dest: Path, start: float, end: float):
    tmp_base = dest.with_suffix("")
    section = f"{max(0.0, start):.2f}-{end:.2f}"
    cmd = YT + [
        "-x", "--audio-format", "mp3", "--audio-quality", "5",
        "--download-sections", f"*{section}", "--force-keyframes-at-cuts",
        "-o", str(tmp_base) + ".%(ext)s",
        url,
    ]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=240)
    produced = dest if dest.exists() else None
    if not produced:
        cands = list(dest.parent.glob(tmp_base.name + ".*"))
        cands = [c for c in cands if c.suffix.lower() in {".mp3", ".m4a", ".mp4", ".webm"}]
        if cands:
            produced = cands[0]
    if not produced:
        (LOGS / f"ext-{dest.stem}.txt").write_text((p.stderr or "") + "\n" + (p.stdout or ""))
        return None
    if produced != dest:
        if produced.suffix.lower() != ".mp3":
            ok, _ = ffmpeg_slice(produced, dest, 0, 9999)
            return dest if ok else None
        produced.replace(dest)
    return dest


def build_one(clip_id: str, rec: dict):
    dest = EXT / f"{clip_id}.mp3"
    url = rec.get("url") or ""
    vid = video_id(url)
    start = float(rec.get("start") or 0)
    end = float(rec.get("end") or (start + 3))
    if end <= start:
        end = start + 1.5

    src, offset = find_source(vid, start, end) if vid else (None, 0.0)
    local_start = start - offset
    local_end = end - offset
    src_dur = ffprobe_dur(src) if src else None

    need_more = True
    if src and src_dur:
        if local_start >= 0 and local_end <= src_dur + 0.4:
            have_before = local_start
            have_after = src_dur - local_end
            if have_before >= PAD - 0.5 and have_after >= PAD - 0.5:
                need_more = False
            elif have_before >= 1 and have_after >= 1 and src_dur >= (end - start) + 8:
                # use what we have; still try download if pad is stingy
                need_more = have_before < 8 or have_after < 8

    if need_more and url:
        win_lo = max(0.0, start - PAD)
        win_hi = end + PAD
        dl = download_window(url, dest, win_lo, win_hi)
        if dl:
            dur = ffprobe_dur(dl) or (win_hi - win_lo)
            pad_b = min(PAD, start - win_lo)
            # if video started at 0, pad_b may be < 15
            if start < PAD:
                pad_b = start
            sel_s = min(pad_b, max(0.0, dur - 0.4))
            sel_e = min(dur, sel_s + (end - start))
            return {
                "extended": f"extended/{clip_id}.mp3",
                "duration": round(dur, 3),
                "sel_start": round(sel_s, 3),
                "sel_end": round(sel_e, 3),
                "pad_before": round(sel_s, 3),
                "pad_after": round(max(0.0, dur - sel_e), 3),
                "via": "download",
                "url": url,
            }

    if not src or src_dur is None:
        return None

    ext_start = max(0.0, local_start - PAD)
    ext_end = min(src_dur, local_end + PAD)
    if ext_end - ext_start < 0.8:
        ext_end = min(src_dur, ext_start + 1.0)
    ok, err = ffmpeg_slice(src, dest, ext_start, ext_end)
    if not ok:
        return {"error": err or "ffmpeg failed"}
    dur = ffprobe_dur(dest) or (ext_end - ext_start)
    sel_s = local_start - ext_start
    sel_e = local_end - ext_start
    sel_s = max(0.0, min(sel_s, dur - 0.2))
    sel_e = max(sel_s + 0.25, min(sel_e, dur))
    return {
        "extended": f"extended/{clip_id}.mp3",
        "duration": round(dur, 3),
        "sel_start": round(sel_s, 3),
        "sel_end": round(sel_e, 3),
        "pad_before": round(sel_s, 3),
        "pad_after": round(max(0.0, dur - sel_e), 3),
        "via": "source",
        "url": url,
    }


def main():
    status = json.loads(STATUS.read_text())
    existing = json.loads(OUT.read_text()) if OUT.exists() else {}
    ids = set(sys.argv[1:] or [c["id"] for c in CLIPS if status.get(c["id"], {}).get("ok")])
    n = len(ids)
    i = 0
    for clip in CLIPS:
        if clip["id"] not in ids:
            continue
        rec = status.get(clip["id"]) or {}
        if not rec.get("ok"):
            continue
        i += 1
        dest = EXT / f"{clip['id']}.mp3"
        if dest.exists() and clip["id"] in existing and existing[clip["id"]].get("extended"):
            print(f"[{i}/{n}] {clip['id']} skip", flush=True)
            continue
        print(f"[{i}/{n}] {clip['id']}", flush=True)
        info = build_one(clip["id"], rec)
        if not info or info.get("error"):
            print("   FAIL", (info or {}).get("error", "unknown"), flush=True)
            existing[clip["id"]] = {"error": (info or {}).get("error", "failed")}
        else:
            print(
                f"   {info['duration']:.1f}s  sel {info['sel_start']:.2f}-{info['sel_end']:.2f}"
                f"  pad {info['pad_before']:.1f}/{info['pad_after']:.1f}  {info['via']}",
                flush=True,
            )
            existing[clip["id"]] = info
        OUT.write_text(json.dumps(existing, indent=2) + "\n")
    ok = sum(1 for v in existing.values() if v.get("extended"))
    print(f"Done: {ok} extended files")


if __name__ == "__main__":
    main()
