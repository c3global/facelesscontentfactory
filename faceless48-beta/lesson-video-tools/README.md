# Lesson video tooling (not part of the plug-in)

These are the scripts used to edit the Faceless48 course lesson videos 1, 2, 3, 4 and 9. They are kept here so the work can be repeated. They are NOT in the Faceless48 Creator plug-in, so members do not get them.

- `edit/edit.py` reads a spec JSON (`spec{n}.json`) and does everything in one pass: cuts, light tightening, privacy blur on boxes and time windows, pill captions, audio assembly and loudness. `edit/mkspec.py` generates the specs.
- `edit/words.py`, `transcript.py`, `match.py`, `lights.py`, `gaps.py`, `ocr*.py`, `urlocr.py` support transcription (whisper.cpp small.en), on-screen text detection (RapidOCR), Finder window detection and repeated-take matching. `ocrout.py` scans a finished video for leaked private text.
- `shells/` builds the lesson pages and the Instructions and transcript PDFs.
- `thumbs/make.js` draws the nine lesson thumbnails.

Paths inside the scripts point at a scratch folder (`/tmp/claude-0/lessons`). Adjust before reuse.
