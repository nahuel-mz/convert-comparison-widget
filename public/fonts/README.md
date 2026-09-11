# Geist — PDF export fonts

Used only by the exported PDF (`src/components/generated/ComparisonPdfDocument.tsx`).
The web UI loads Geist from Google Fonts; a PDF can't, so it embeds these files.

- **Source:** Geist 1.800 — Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font)
- **License:** SIL Open Font License, Version 1.1 — https://openfontlicense.org
- **Modified:** converted from OTF (CFF) to TTF (TrueType outlines), because react-pdf's CFF
  support is unreliable, and subset to Latin, Latin-1, general punctuation, € ™ and arrows.
  That covers every character in the comparison data; add ranges here if new data needs more.

Geist has no ✓ / ✗ glyphs, so the PDF draws its checks and crosses as vectors.
