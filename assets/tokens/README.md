# King Token Images

This directory contains the crowned king portrait tokens for the mobile 2D board.

## Required Files

1. **trump-king-token.png** - Donald Trump with gold crown and red cape (Right king)
2. **newsom-king-token.png** - Gavin Newsom with silver crown and blue gem (Left king)

## Specifications

- Format: PNG with transparency
- Recommended size: 512x512px or higher
- Circular crop will be applied via CSS
- These replace the CSS crown overlay approach on mobile
- Desktop 3D view still uses the .glb models

## Usage

These images are referenced in:
- `js/roster.js` - `mobileToken` property for both kings
- `js/board2d.js` - Renders these instead of portrait + crown overlay
- `css/style.css` - Circular crop and styling

## Current Status

⚠️ **PLACEHOLDER FILES** - Replace trump-king-token.png and newsom-king-token.png with the actual rendered king portraits.
