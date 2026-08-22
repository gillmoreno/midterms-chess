# Soundbite studio

Not shipped to the public site. Cloudflare Pages skips `studio/` (see `.assetsignore`).

A **bark** is a short line a piece says when you click it on the board. **Taunts** are separate (check / capture / mate).

## Open

```
just soundbites
```

That kills anything already on port 8765, starts the studio, and opens http://127.0.0.1:8765/

Or: `python3 studio/soundbites/server.py` / double-click `Open Soundbites.command`.

## Workflow

1. Click a line, drag the gold region, **Save cut**.
2. **Save as click bark** copies that cut into `assets/sfx/barks/` and lists it on the piece in `js/barks.js`.
3. A piece can have any number of barks; the board picks one at random on click.

Source rips (`sources/`) stay out of git — regenerable. Clips, padded takes, catalog, and assignments are versioned.

Commentators (Tate, Rogan) are booth only, not pieces, so they cannot be barks.
