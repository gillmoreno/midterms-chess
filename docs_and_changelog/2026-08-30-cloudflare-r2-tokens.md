# Mobile 2D Token Images Migration to Cloudflare R2

**Date:** August 30, 2026  
**Status:** Completed

## Overview

Migrated mobile 2D board token images from local git assets to Cloudflare R2 CDN for improved performance and availability.

## Changes

### Updated Files
- `js/roster.js` - All 18 `mobileToken` paths updated from relative to absolute URLs

### Token URLs
All starter piece tokens now load from:
```
https://assets.chess.the-idea-guy.com/tokens/
```

### Complete Token List
**Right Side (White):**
- `trump-king.png`
- `leavitt-queen.png`
- `paul-rook.png`
- `rubio-rook.png`
- `cruz-bishop.png`
- `rfk-bishop.png`
- `vance-knight.png`
- `desantis-knight.png`
- `maga-pawn.png`

**Left Side (Black):**
- `newsom-king.png`
- `aoc-queen.png`
- `sanders-rook.png`
- `warren-rook.png`
- `harris-bishop.png`
- `schumer-bishop.png`
- `buttigieg-knight.png`
- `mamdani-knight.png`
- `activist-pawn.png`

## Implementation Details

### CORS Configuration
- Cloudflare R2 is configured with CORS for `https://chess.the-idea-guy.com`
- Verified: `access-control-allow-origin: https://chess.the-idea-guy.com`
- Methods: GET, HEAD

### Fallback Behavior
- The existing `onerror` fallback to portrait JPGs remains unchanged
- If a token fails to load, the board gracefully falls back to the portrait image

### Canvas Drawing
- No `crossOrigin` attribute required
- `board2d.js` uses `<img>` elements directly (no canvas drawing)
- Images are inserted into DOM, not drawn to canvas context

## Unaffected Components

- Desktop 3D board and GLB models remain unchanged
- Portrait images still use relative paths (`assets/portraits/*.jpg`)
- All other asset types unchanged
- No PNG binaries added to git repository

## Testing

Verified:
- ✓ All 18 token URLs return HTTP 200 with `image/png` content type
- ✓ CORS headers properly configured
- ✓ Images load successfully from Cloudflare R2

## Deployment

- Committed directly to `master` branch (commit: 91dfb61)
- No pull request required per project workflow
