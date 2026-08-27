---
name: capture-order
description: >
  Shoot mute capture-order beds: king-from-behind gives the order, one
  house piece receives it. Use when filming an order bed, a capture
  cinematic half, king-from-behind, or /capture-order.
---

# Capture order beds

Mute 6s beds. Audio is overlaid later from a soundbite. No lip-sync.

Catalog: `studio/capture-order/beds.json`
Work files: `studio/capture-order/{right,left}/{id}.jpg` and `{id}-mute.mp4`

## Cadence (6s, one take, locked camera)

| Time | Beat |
|---|---|
| 0–1s | Hold the still. King back to camera, piece facing us. |
| 1–4s | King raises the pointer / staff a little (order). Piece does **one** gag. Mouths closed. |
| 4–6s | Piece holds the gag, ready to go. Board does not rotate. |

## Composition lock

Right master: `studio/capture-order/right/_king-back.jpg` (Trump: blond, gold crown, red gold cape, scepter + pointer).
Left master: `studio/capture-order/left/_king-back.jpg` (Newsom: grey hair, gold crown, teal gold cape).

Camera is **behind the king**, king in the left foreground, receiver on a marble square in the right midground, 16:9. Do not invent a new angle.

## How to shoot a bed

1. Read `beds.json` for that `id`. Use that portrait and that `gag`.
2. `image_edit` with two images: the side's `_king-back.jpg` + `assets/portraits/{id}.jpg`. Aspect 16:9. Prompt:

```
Keep the exact camera, lighting, marble chessboard, and the king seen from behind in the first image. Replace only the piece on the board with the vinyl figurine from the second image, standing on a square facing the camera, receiving the order. [GAG]. Same glossy vinyl-toy look. 16:9 cinematic.
```

3. Verify: king identity and cape color, receiver matches the portrait (outfit, hat, props), board did not spin, mouths closed. Retry the still once if the piece drifted.
4. `image_to_video` from the still, 6s, 720p. Two at a time (rate limit). Prompt:

```
Locked camera, chessboard frozen. The king in the foreground slightly raises his gold pointer as if giving an order, back to camera, mouth closed. [MOTION]. Mouths closed, no talking. Glossy vinyl toys.
```

5. Strip cover art (`-map 0:v:0`), save `{id}-mute.mp4` next to the still. `ffprobe` duration ≈ 6s. Frames 0 / 3 / 5.8: still → order + gag → hold. No board spin.
6. Mark `status: mute` in `beds.json`. Do not copy to `assets/cinematics/` until a soundbite is laid on and a victim lose-bed is stitched.

## Do not

- Lip-sync or generate with audio. These are mute beds.
- Shoot a new king angle. Edit-chain from `_king-back.jpg`.
- Put two receivers in one still.
- Animate until the still is locked.
