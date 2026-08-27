---
name: kill-cam
description: >
  Shoot Floor Vote kill-cam reels at the locked 6-second cadence
  (talk 0–3s, stop, aim, one hit, victim goes down). Use when filming
  a kill cam, remaking a pawn or character reel, or the user says
  kill-cam cadence, 6 second clip, talk-stop-aim-shoot, or /kill-cam.
---

# Floor Vote kill cam

Approved reels (copy this beat, do not stitch):
- MAGA: session `videos/13.mp4` → `assets/cinematics/right-kills.mp4`
- Blue-hair: session `videos/15.mp4` → `assets/cinematics/left-kills.mp4` (Iris, California; not Eve)
- Left queen: throw `videos/2.mp4` + receive `videos/1.mp4` → `assets/cinematics/left-queen-kills.mp4` (Iris; Hadouken split, no two-person take)
- RFK: throw `videos/5.mp4` + receive `videos/3.mp4` → `assets/cinematics/rfk-kills.mp4` (Lux, a bit robotic; 25 lb plate frisbee split)

## Cadence (6s, one take)

| Time | Beat |
|---|---|
| 0–3s | Killer says the chosen line. Pace the delivery so it finishes by 3s. Lip-sync with a voice (`reference_to_video`). |
| ~3s | Stop. Raise / aim the weapon they actually hold. |
| ~4s | One hit. Hear the shot (or the weapon’s one strike). No blood. |
| 5–6s | Victim is blown back and goes down like a vinyl toy falling over. |

Readable beats, not mush: **talk → stop → aim → bang → fall**.

## How to generate

1. Stage a 16:9 still of **this** killer and **this** victim (current portraits, the weapon they actually hold). Gun at rest, mouth ready to speak, no flash. A still that is already screaming and firing is more likely to get content-moderated and has no talk beat.
2. `reference_to_video`, 6s, 720p, 16:9. Tag the still `<IMAGE_0>` and the killer’s voice `<AUDIO_0>`.
3. Prompt shape (fill names, line, weapon):

```
One tight 6-second vinyl-toy shot. The [killer] from <IMAGE_0> quickly says with <AUDIO_0> "[LINE]" then freezes, aims the [weapon] at the [victim]'s chest, fires a single loud cartoon shot, and [he/she] topples backward onto the chessboard. No blood. Locked camera, brisk but readable beats: talk, stop, aim, bang, fall.
```

4. Voices: MAGA `rex`, blue-hair `iris` (California — never Eve, she reads British). Other killers use the voice on the scripts page.
5. Verify before shipping:
   - `ffprobe` duration ≈ 6s (not 10 or 12, not a concat).
   - Whisper: the full line ends by ~3.0s.
   - Frames at 0 / 2 / 3.2 / 4 / 5.8: talking → aimed, no flash → one hit → victim down. No blood.
6. Copy to `assets/cinematics/` and set the overlay line in `js/cinematic.js` (and the filmed hook in `js/kill-scripts.js`).

## Do not

- Glue a talk clip to a fire clip.
- Spray a long burst unless the user asks.
- Photoreal blood or named-politician assassination stills. Pawns and vinyl toys only unless the user films a specific pair.
- Retry a **content-moderated** call with a paraphrased gore prompt. Fall back to this talk-stop-aim-one-hit wording (it already shipped).
