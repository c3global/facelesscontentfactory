# Handoff from the Faceless48 engines

The Script, Shorts and Thumbnail engines can export a **handoff package**. You bring it to the plug-in, say **"Import my handoff"**, and the video workflow starts from your script instead of from a blank page.

## What is in a package
One file named `<name>.f48handoff.zip` (or a plain folder with the same contents):
- `handoff.json` (required): title, video type, the script and its section breaks, the Shorts cut-downs, the thumbnail details.
- `thumbnail.png` (optional): the finished thumbnail from the Thumbnail engine.
- `script.txt` (optional): a readable copy of the script.

Text and one image. No video, no audio, and nothing that runs.

## The five video types and what you bring
| Type | You bring |
|---|---|
| talking-head | Your raw video clip. The audio is already in it. |
| yap | Your raw video clip. The audio is already in it. |
| explainer (animated) | Your voiceover file (mp3, wav or m4a). |
| faceless | Your voiceover file, plus visuals: your own images or clips, or stock you choose. |
| life-scene | Your clips (your own, AI-generated, or stock you choose). A voiceover is optional. |

The plug-in does not create voiceovers. The recording sets the timing of the video, not the script.

## Commands
- `npm run f48 -- handoff check <package>` checks a package and writes nothing.
- `npm run f48 -- handoff import <package>` saves it to `content/handoffs/<name>/`. Importing the same name again keeps the earlier import.
- `npm run f48 -- handoff show <name>` shows what was imported and what to bring next.
- `npm run f48 -- handoff stock <name>` searches Pexels and Pixabay for each section and saves the options for you to review.

You do not need to type these. Say "Import my handoff" and your assistant runs them.

## Stock footage
After the import, the plug-in searches Pexels and Pixabay for each section and shows you previews, lengths, creators and links. You choose the clips you like, and it downloads only those. Credits are saved for your captions. This uses your own free Pexels and Pixabay keys, set up once (docs/STOCK-FOOTAGE.md).

## Try it
`docs/handoff-example/` is a small sample package. Run `npm run f48 -- handoff import docs/handoff-example` to see what an import looks like.

## If something is wrong
The plug-in names the exact field that is wrong and does not guess. Export the package again from the engine. A package made by a newer export version asks you to update the plug-in.

## Format reference
The full field list and rules for the engines' export buttons are in the Faceless48 Handoff Export Spec (one page).
