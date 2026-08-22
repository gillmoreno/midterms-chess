#!/usr/bin/env python3
"""Download and cut the chess sound-bite pack into a local listening library.

Writes under this folder only. Does not touch the game repo.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import time
from pathlib import Path

from catalog import CLIPS, SOURCES

ROOT = Path(__file__).resolve().parent
CLIPS_DIR = ROOT / "clips"
SOURCES_DIR = ROOT / "sources"
WORK = ROOT / "work"
SUBS_DIR = WORK / "subs"
LOGS = WORK / "logs"
RESOLVED = WORK / "resolved.json"
STATUS = WORK / "status.json"

for d in (CLIPS_DIR, SOURCES_DIR, SUBS_DIR, LOGS):
    d.mkdir(parents=True, exist_ok=True)

YT = [
    "yt-dlp",
    "--no-playlist",
    "--ignore-no-formats-error",
    "--retries", "3",
]
# mweb + muxed 360p (format 18) avoids YouTube's PO-token 403 on DASH audio.
YT_DL = YT + [
    "--extractor-args", "youtube:player_client=mweb",
    "-f", "18/bestaudio/best",
]
PAD_BEFORE = 0.35
PAD_AFTER = 0.55
MIN_CLIP = 1.4


def run(cmd, timeout=180, check=False):
    p = subprocess.run(
        cmd,
        text=True,
        capture_output=True,
        timeout=timeout,
    )
    if check and p.returncode != 0:
        raise RuntimeError(p.stderr[-2000:] or p.stdout[-2000:])
    return p


def load_json(path, default):
    if path.exists():
        return json.loads(path.read_text())
    return default


def save_json(path, data):
    path.write_text(json.dumps(data, indent=2) + "\n")


def slug_ok(s):
    return re.sub(r"[^a-z0-9\-]+", "-", s.lower()).strip("-")


def normalize(text):
    text = text.lower().replace("’", "'").replace("‘", "'")
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[^a-z0-9'\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_vtt(path: Path):
    raw = path.read_text(errors="ignore")
    cues = []
    blocks = re.split(r"\n\n+", raw)
    ts_re = re.compile(
        r"(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})\s-->\s(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})"
    )

    def to_sec(h, m, s, ms):
        return int(h or 0) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0

    for block in blocks:
        m = ts_re.search(block)
        if not m:
            continue
        start = to_sec(m.group(1), m.group(2), m.group(3), m.group(4))
        end = to_sec(m.group(5), m.group(6), m.group(7), m.group(8))
        lines = []
        for line in block.splitlines():
            if "-->" in line or line.startswith("WEBVTT") or line.startswith("Kind:") or line.startswith("Language:"):
                continue
            line = re.sub(r"<[^>]+>", "", line).strip()
            if line:
                lines.append(line)
        text = normalize(" ".join(lines))
        if text:
            cues.append((start, end, text))
    return cues


def find_phrase(cues, phrases, duration=None, window=None, hint=None):
    """Return (start, end) of the best caption match, or None."""
    if not cues:
        return None
    lo, hi = 0.0, duration or (cues[-1][1] + 1)
    if window == "last5" and duration:
        lo = max(0.0, duration - 320)
    elif window == "last3s" and duration:
        lo = max(0.0, duration - 4)
    if hint is not None:
        lo = max(lo, hint - 45)
        hi = min(hi, hint + 45)

    # Build a word timeline from cues in window
    words = []
    for start, end, text in cues:
        if end < lo or start > hi:
            continue
        toks = text.split()
        n = max(len(toks), 1)
        span = max(end - start, 0.2)
        for i, w in enumerate(toks):
            t0 = start + span * i / n
            t1 = start + span * (i + 1) / n
            words.append((w, t0, t1))
    if not words:
        return None

    def match_at(i, target):
        j = i
        for tw in target:
            found = None
            for k in range(j, min(len(words), j + 12)):
                if words[k][0] == tw or (len(tw) > 4 and tw in words[k][0]):
                    found = k
                    break
            if found is None:
                return None
            j = found + 1
        return j - 1

    best = None
    for phrase in phrases:
        target = normalize(phrase).split()
        if not target:
            continue
        for i in range(len(words)):
            end_i = match_at(i, target)
            if end_i is None:
                continue
            start = words[i][1]
            end = words[end_i][2]
            score = (end_i - i + 1) + (10 if hint is not None and abs(start - hint) < 20 else 0)
            # Prefer later matches in last5 windows (chess endgame)
            if window == "last5":
                score += start / 1000.0
            if best is None or score > best[0]:
                best = (score, start, end)
    if not best:
        return None
    return best[1], best[2]


def clip_out_path(clip):
    return CLIPS_DIR / clip["group"] / clip["speaker"] / f"{clip['id']}.mp3"


def ffmpeg_cut(src, dest: Path, start, end):
    dest.parent.mkdir(parents=True, exist_ok=True)
    start = max(0.0, start - PAD_BEFORE)
    end = max(start + MIN_CLIP, end + PAD_AFTER)
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-ss", f"{start:.3f}", "-to", f"{end:.3f}",
        "-i", str(src),
        "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        str(dest),
    ]
    p = run(cmd, timeout=60)
    if p.returncode != 0 or not dest.exists() or dest.stat().st_size < 1000:
        return False, (p.stderr or p.stdout)[-500:]
    return True, None


def ytdlp_info(url):
    p = run(YT + ["--print", "%(id)s\t%(duration)s\t%(title)s", "--skip-download", url], timeout=90)
    if p.returncode != 0:
        return None
    line = (p.stdout or "").strip().splitlines()
    if not line:
        return None
    vid, dur, title = line[-1].split("\t", 2)
    try:
        dur = float(dur) if dur and dur != "NA" else None
    except ValueError:
        dur = None
    return {"id": vid, "duration": dur, "title": title, "url": f"https://www.youtube.com/watch?v={vid}"}


def ytsearch(query, n=8):
    p = run(
        YT + [
            "--flat-playlist",
            "--print", "%(id)s\t%(duration)s\t%(title)s",
            f"ytsearch{n}:{query}",
        ],
        timeout=90,
    )
    rows = []
    for line in (p.stdout or "").splitlines():
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        vid, dur, title = parts[0], parts[1], parts[2]
        try:
            dur = float(dur) if dur and dur != "NA" else None
        except ValueError:
            dur = None
        rows.append({"id": vid, "duration": dur, "title": title, "url": f"https://www.youtube.com/watch?v={vid}"})
    return rows


def pick_search_result(rows, phrases):
    keys = set()
    for ph in phrases:
        keys.update(w for w in normalize(ph).split() if len(w) > 3)

    def score(r):
        title = normalize(r["title"])
        dur = r["duration"] or 99999
        s = 0
        for k in keys:
            if k in title:
                s += 8
        if 8 <= dur <= 90:
            s += 40
        elif 90 < dur <= 300:
            s += 25
        elif 300 < dur <= 900:
            s += 10
        elif dur > 3600:
            s -= 30
        bad = ("full episode", "full podcast", "3 hour", "4 hour", "entire interview", "fight companion")
        if any(b in title for b in bad):
            s -= 20
        return s

    if not rows:
        return None
    return max(rows, key=score)


def fetch_subs(url, video_id):
    existing = list(SUBS_DIR.glob(f"{video_id}*"))
    vtts = [p for p in existing if p.suffix == ".vtt"]
    if vtts:
        return vtts[0]
    p = run(
        YT + [
            "--skip-download",
            "--write-auto-sub",
            "--write-sub",
            "--sub-langs", "en.*,en",
            "--convert-subs", "vtt",
            "-o", str(SUBS_DIR / video_id),
            url,
        ],
        timeout=120,
    )
    vtts = list(SUBS_DIR.glob(f"{video_id}*.vtt"))
    if vtts:
        return vtts[0]
    (LOGS / f"subs-{video_id}.txt").write_text((p.stderr or "") + "\n" + (p.stdout or ""))
    return None


def download_audio(url, dest: Path, section=None):
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp_base = dest.with_suffix("")
    cmd = YT_DL + [
        "-x", "--audio-format", "mp3", "--audio-quality", "5",
        "-o", str(tmp_base) + ".%(ext)s",
    ]
    if section:
        cmd += ["--download-sections", f"*{section}", "--force-keyframes-at-cuts"]
    cmd.append(url)
    p = run(cmd, timeout=300)
    produced = dest if dest.exists() else None
    if not produced:
        cands = list(dest.parent.glob(tmp_base.name + ".*"))
        cands = [c for c in cands if c.suffix.lower() in {".mp3", ".m4a", ".webm", ".opus", ".mp4"}]
        if cands:
            produced = cands[0]
    if not produced or produced.stat().st_size < 1500:
        cmd2 = YT + [
            "--extractor-args", "youtube:player_client=android_vr",
            "-x", "--audio-format", "mp3",
            "-o", str(tmp_base) + ".%(ext)s",
            url,
        ]
        p2 = run(cmd2, timeout=300)
        p = p2
        produced = dest if dest.exists() else None
        if not produced:
            cands = list(dest.parent.glob(tmp_base.name + ".*"))
            cands = [c for c in cands if c.suffix.lower() in {".mp3", ".m4a", ".webm", ".opus", ".mp4"}]
            if cands:
                produced = cands[0]
    if not produced or produced.stat().st_size < 1500:
        (LOGS / f"dl-{dest.stem}.txt").write_text((p.stderr or "") + "\n" + (p.stdout or ""))
        return None
    if produced != dest:
        # convert if needed
        if produced.suffix.lower() != ".mp3":
            conv = run([
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-i", str(produced),
                "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "2",
                str(dest),
            ], timeout=120)
            if conv.returncode != 0:
                return None
        else:
            produced.replace(dest)
    return dest


def resolve_source(src_id, phrases=None):
    cache = load_json(RESOLVED, {})
    if src_id in cache and cache[src_id].get("url"):
        return cache[src_id]
    spec = SOURCES[src_id]
    info = None
    if spec.get("url"):
        info = ytdlp_info(spec["url"])
    if info is None and spec.get("search"):
        rows = ytsearch(spec["search"])
        info = pick_search_result(rows, phrases or [])
    if info is None:
        cache[src_id] = {"error": "unresolved"}
        save_json(RESOLVED, cache)
        return cache[src_id]
    rec = {
        "id": info["id"],
        "url": info["url"],
        "duration": info.get("duration"),
        "title": info.get("title"),
        "resolved_for": src_id,
    }
    cache[src_id] = rec
    save_json(RESOLVED, cache)
    return rec


def short_clip_for(clip):
    q = f"{clip['quote']} {clip['speaker']}"
    rows = ytsearch(q, n=6)
    picked = pick_search_result(rows, clip.get("phrases") or [clip["quote"]])
    if picked and picked.get("duration") and picked["duration"] <= 240:
        return picked
    return None


def source_audio_path(video_id):
    return SOURCES_DIR / f"{video_id}.mp3"


def ensure_source_audio(info, start=None, end=None):
    """Download enough audio to cut from. Full file if short; a window if long."""
    dest = source_audio_path(info["id"])
    dur = info.get("duration") or 0
    if dest.exists() and dest.stat().st_size > 2000:
        return dest, 0.0  # offset of dest vs source
    if dur and dur <= 900:
        got = download_audio(info["url"], dest)
        return (got, 0.0) if got else (None, 0.0)
    # long: download a window
    if start is None:
        start = 0.0
    if end is None:
        end = min(dur or (start + 90), start + 90)
    win_lo = max(0.0, start - 8)
    win_hi = end + 8
    section = f"{win_lo:.2f}-{win_hi:.2f}"
    win_dest = SOURCES_DIR / f"{info['id']}_{int(win_lo)}-{int(win_hi)}.mp3"
    if win_dest.exists() and win_dest.stat().st_size > 2000:
        return win_dest, win_lo
    got = download_audio(info["url"], win_dest, section=section)
    if not got:
        # last resort: try full (could be huge — skip if > 20 min)
        if dur and dur > 1200:
            return None, 0.0
        got = download_audio(info["url"], dest)
        return (got, 0.0) if got else (None, 0.0)
    return got, win_lo


def whisper_locate(audio_path, phrases, offset=0.0):
    out_dir = WORK / "whisper"
    out_dir.mkdir(exist_ok=True)
    stem = audio_path.stem
    json_path = out_dir / f"{stem}.json"
    if not json_path.exists():
        p = run(
            [
                "whisper", str(audio_path),
                "--model", "base.en",
                "--language", "en",
                "--output_dir", str(out_dir),
                "--output_format", "json",
                "--fp16", "False",
                "--verbose", "False",
            ],
            timeout=600,
        )
        if p.returncode != 0 or not json_path.exists():
            (LOGS / f"whisper-{stem}.txt").write_text((p.stderr or "") + "\n" + (p.stdout or ""))
            return None
    data = json.loads(json_path.read_text())
    segs = [(s["start"] + offset, s["end"] + offset, normalize(s["text"])) for s in data.get("segments", [])]
    return find_phrase(segs, phrases)


def process_clip(clip, status):
    cid = clip["id"]
    out = clip_out_path(clip)
    if out.exists() and out.stat().st_size > 1500:
        status[cid] = {**status.get(cid, {}), "ok": True, "path": str(out), "skipped": True}
        return status[cid]

    src_id = clip["source"]
    info = resolve_source(src_id, clip.get("phrases"))
    if not info.get("url"):
        status[cid] = {"ok": False, "error": "could not resolve source", "source": src_id}
        return status[cid]
    # Multi-hour podcasts only: prefer a short highlight of this line.
    # 15–70 min speeches/debates are cut via captions, not a random search hit.
    if (info.get("duration") or 0) > 3600:
        short = short_clip_for(clip)
        if short:
            info = short

    hit = None
    if clip.get("t") is not None:
        t0 = float(clip["t"])
        t1 = float(clip["t_end"]) if clip.get("t_end") is not None else t0 + 4.0
        # If the resolved video is a short highlight, ignore absolute timestamps
        # from the original long file (e.g. coconut tree 31:28 vs a 1:50 clip).
        dur = info.get("duration") or 0
        if dur and t0 < dur:
            hit = (t0, t1)
        else:
            hit = None

    subs = fetch_subs(info["url"], info["id"])
    cues = parse_vtt(subs) if subs else []
    found = find_phrase(
        cues,
        clip["phrases"],
        duration=info.get("duration"),
        window=clip.get("window"),
        hint=clip.get("t"),
    )
    if found:
        hit = found

    audio, offset = ensure_source_audio(
        info,
        start=(hit[0] if hit else (clip.get("t") or 0)),
        end=(hit[1] if hit else ((clip.get("t") or 0) + 8)),
    )
    if audio is None:
        status[cid] = {"ok": False, "error": "download failed", "url": info["url"], "title": info.get("title")}
        return status[cid]

    if hit is None:
        # try whisper on the downloaded audio
        found = whisper_locate(audio, clip["phrases"], offset=offset)
        if found:
            hit = found

    if hit is None:
        # if the whole source is tiny, keep the whole file as the clip
        dur = info.get("duration") or 0
        if dur and dur <= 45:
            hit = (0.0, dur)
        else:
            status[cid] = {
                "ok": False,
                "error": "quote not found in captions/audio",
                "url": info["url"],
                "title": info.get("title"),
                "has_subs": bool(subs),
            }
            return status[cid]

    local_start = max(0.0, hit[0] - offset)
    local_end = max(local_start + 0.8, hit[1] - offset)
    ok, err = ffmpeg_cut(audio, out, local_start, local_end)
    if not ok:
        status[cid] = {"ok": False, "error": f"ffmpeg: {err}", "url": info["url"]}
        return status[cid]
    status[cid] = {
        "ok": True,
        "path": str(out),
        "url": info["url"],
        "title": info.get("title"),
        "start": round(hit[0], 2),
        "end": round(hit[1], 2),
    }
    return status[cid]


def write_listen_page(status):
    groups = {}
    for clip in CLIPS:
        groups.setdefault((clip["group"], clip["speaker"]), []).append(clip)

    def esc(s):
        return (
            str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;")
        )

    parts = [
        "<!doctype html><meta charset=utf-8><title>Chess soundbites</title>",
        "<style>",
        "body{font:15px/1.45 ui-sans-serif,system-ui;background:#111;color:#eee;max-width:980px;margin:2rem auto;padding:0 16px}",
        "h1{font-size:1.6rem} h2{margin-top:2.2rem;border-bottom:1px solid #333;padding-bottom:.3rem}",
        ".clip{display:grid;grid-template-columns:1fr 280px;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #2a2a2a}",
        ".q{font-weight:600} .meta{color:#aaa;font-size:12px} audio{width:280px;height:32px}",
        ".miss{opacity:.55} .ok{color:#8f8} .bad{color:#f88} .hand{color:#fc6}",
        "a{color:#9cf}",
        "</style>",
        "<h1>Chess sound-bite pack</h1>",
        "<p>Local listening library. Not in the game deploy. Click play, then keep or toss.</p>",
    ]
    ok_n = sum(1 for c in CLIPS if status.get(c["id"], {}).get("ok"))
    parts.append(f"<p><b class=ok>{ok_n}</b> / {len(CLIPS)} extracted</p>")

    m3u = ["#EXTM3U"]
    for (group, speaker), items in groups.items():
        parts.append(f"<h2>{esc(group)} / {esc(speaker)}</h2>")
        for clip in items:
            st = status.get(clip["id"], {})
            rel = ""
            p = clip_out_path(clip)
            if p.exists():
                rel = str(p.relative_to(ROOT))
            cls = "clip" + ("" if st.get("ok") else " miss")
            mark = "<span class=ok>ready</span>" if st.get("ok") else "<span class=bad>missing</span>"
            if clip.get("handful"):
                mark += " <span class=hand>priority</span>"
            audio = f"<audio controls preload=none src='{esc(rel)}'></audio>" if rel else ""
            src = st.get("url") or ""
            src_html = f"<a href='{esc(src)}'>source</a>" if src else ""
            tinfo = ""
            if st.get("start") is not None:
                tinfo = f" @ {st['start']:.1f}–{st['end']:.1f}s"
            err = st.get("error") or ""
            parts.append(
                f"<div class='{cls}'><div><div class=q>“{esc(clip['quote'])}”</div>"
                f"<div class=meta>{esc(clip['id'])} · {esc(clip['trigger'])} · {esc(clip.get('tone',''))} · {mark} {src_html}{esc(tinfo)}"
                f"{(' · '+esc(err)) if err else ''}</div></div>{audio}</div>"
            )
            if rel:
                m3u.append(f"#EXTINF:-1,{clip['speaker']} — {clip['quote']}")
                m3u.append(rel)

    html = "\n".join(parts)
    (ROOT / "LISTEN.html").write_text(html)
    (ROOT / "listen.m3u").write_text("\n".join(m3u) + "\n")

    lines = [f"# Chess soundbites — {ok_n}/{len(CLIPS)} extracted", ""]
    for clip in CLIPS:
        st = status.get(clip["id"], {})
        flag = "OK" if st.get("ok") else "MISS"
        extra = st.get("path") if st.get("ok") else st.get("error", "")
        lines.append(f"- [{flag}] {clip['id']}: {clip['quote']} — {extra}")
    (ROOT / "INDEX.md").write_text("\n".join(lines) + "\n")


def main():
    status = load_json(STATUS, {})
    ordered = sorted(CLIPS, key=lambda c: (0 if c.get("handful") else 1, c["group"], c["speaker"], c["id"]))
    ids = set(sys.argv[1:] or [c["id"] for c in CLIPS])
    n = len([c for c in ordered if c["id"] in ids])
    i = 0
    for clip in ordered:
        if clip["id"] not in ids:
            continue
        i += 1
        print(f"[{i}/{n}] {clip['id']} — {clip['quote'][:60]}", flush=True)
        try:
            rec = process_clip(clip, status)
        except subprocess.TimeoutExpired:
            rec = {"ok": False, "error": "timeout"}
            status[clip["id"]] = rec
        except Exception as e:
            rec = {"ok": False, "error": str(e)[:300]}
            status[clip["id"]] = rec
        print("   ", "OK" if rec.get("ok") else "FAIL", rec.get("path") or rec.get("error"), flush=True)
        save_json(STATUS, status)
        write_listen_page(status)
        time.sleep(0.4)
    write_listen_page(status)
    ok_n = sum(1 for c in CLIPS if status.get(c["id"], {}).get("ok"))
    print(f"\nDone: {ok_n}/{len(CLIPS)} extracted")
    print(f"Open: {ROOT / 'LISTEN.html'}")


if __name__ == "__main__":
    main()
