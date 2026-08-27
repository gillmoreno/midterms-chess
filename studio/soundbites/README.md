# Soundbite studio

Not shipped to the public site. Cloudflare Pages skips `studio/` (see `.assetsignore`).

A **bark** is a short line a piece says when you click it on the board. A **last word** is the line they say when they get taken (Got captured filter). **Captures** is the king-order line: Trump talking about a Left victim, Newsom talking about a Right victim, laid on the mute order bed. **Taunts** are separate (check / capture / mate).

## Open

```
just soundbites
```

That kills anything already on port 8765, starts the studio, and opens http://127.0.0.1:8765/

Or: `python3 studio/soundbites/server.py` / double-click `Open Soundbites.command`.

## Workflow

1. Click a line, drag the gold region, **Save cut**.
2. On the card, toggle where it plays. A bite can sit in more than one slot:
   - **Click** — when you click the piece (`assets/sfx/barks/` → `js/barks.js`)
   - **Captured** — when that piece is taken (`assets/sfx/last-words/` → `js/last-words.js`)
   - **Order** — when the king orders that capture (`assets/sfx/orders/` → `js/orders.js`). Only on Captures lines (king talking about a victim).
   - **Reel / Film** — the defeated lose-bed for that last word. Plays if filmed; Film lays the bite on a mute bed if one exists.
3. A piece can have any number of lines in a slot; the board picks one at random.

Source rips (`sources/`) stay out of git — regenerable. Clips, padded takes, catalog, and assignments are versioned.

Commentators (Tate, Rogan) are booth only, not pieces, so they cannot be barks.
