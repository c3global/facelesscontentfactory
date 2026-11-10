# Stock footage (optional)

Free stock video from Pexels and Pixabay, searched and downloaded with your own free API keys. Everything else in Faceless48 works without it: your own footage, images, generated clips and animations are always fine.

## Set up your keys (once, about 5 minutes)

**Pexels**
1. Go to https://www.pexels.com/api/ and sign in (or make a free account).
2. Click "Your API Key" and fill in the short form (app name: anything, for example "My video projects").
3. Copy the key.

**Pixabay**
1. Go to https://pixabay.com/api/docs/ and sign in (or make a free account).
2. Scroll to "Parameters". Your key is shown next to `key`.
3. Copy the key.

**Save them in your project**
1. In your project folder, copy `stock-keys.example.json` to a new file named `stock-keys.json`.
2. Paste your keys between the quotes: `{"pexels": "your Pexels key", "pixabay": "your Pixabay key"}`.
3. Run `npm run f48 -- stock keys`. It says "set" for each key it found. It never prints the keys.

You can use just one provider. Your keys stay on your computer: `stock-keys.json` is in `.gitignore`, so it is never committed. Never paste your keys into a chat, an email or a shared document. If you think a key leaked, make a new one on the provider's site.

Cloud sessions: set `PEXELS_API_KEY` and `PIXABAY_API_KEY` as environment secrets instead of a file, and allow `api.pexels.com`, `videos.pexels.com`, `images.pexels.com`, `pixabay.com` and `cdn.pixabay.com` in the network settings.

## How a video uses stock clips
1. **Shot list first.** The assistant writes the shot list from your script and turns each shot into a search phrase of 2 to 4 concrete words (what is in the frame, not the idea: "woman typing laptop night", not "productivity").
2. **Search.** `npm run f48 -- stock search "woman typing laptop night"`. Results show the provider, length, size, creator and the clip's page link, and preview images are saved in `out/stock-preview/`. Portrait is the default; add `--orientation landscape` for 16:9, or `--orientation any` to see both. Both providers have portrait and landscape clips. Pixabay has no orientation filter of its own, so the tool searches a wider page and filters it, and it tells you how many clips were hidden. A landscape clip needs cropping for a vertical video.
3. **You choose.** Look at the previews (open the page links to watch). Tell the assistant which ones you want.
4. **Download only what you chose.** `npm run f48 -- stock pick pexels:123456 --name typing-night` saves the clip to `public/stock/typing-night.mp4` and records its source and creator in `content/stock-credits.json`.
5. **Use it as a cutaway.** In a talking-head plan, add a `broll` graphic to the segment where the clip should appear: `{"type":"broll","at":3,"until":6.5,"props":{"src":"stock/typing-night.mp4","move":"zoom","zoom":1.12}}`. It fades in over her, fills the frame, moves the camera, and fades back to her. Her voice keeps playing underneath and the clip's own sound is muted. `move` is `none`, `zoom`, `pullback`, `punch` or `drift`; `startSec` trims the head of the clip; `px` and `py` aim the move. `validate` checks that the clip exists and is long enough for the cutaway. Works in portrait and landscape. Your own clips work the same way.
6. **Credits.** `npm run f48 -- stock credits` lists every clip with its credit line, ready to paste into your caption or description.

## Provider rules the tool follows
Check the current terms yourself before publishing commercially: https://www.pexels.com/api/documentation/ and https://pixabay.com/api/docs/ (plus each site's license page). Terms can change.
- **Show the source.** Search results always show Pexels or Pixabay, the creator and a link to the clip page. Crediting the creator in your post is good practice and is recorded for you.
- **Pixabay: 24-hour cache.** Search results are saved for 24 hours and reused, as Pixabay requires. The same search within a day does not call the API again.
- **No hotlinking.** Clips are downloaded into your project before use, never streamed from the provider.
- **No mass downloading.** One clip per pick, picked by a person from results they have seen. Do not script bulk downloads or build a library of clips you are not using.
- **Rate limits.** Both providers limit how many searches you can make (Pexels about 200 an hour, Pixabay about 100 a minute at the time of writing). If you see "too many requests", wait and try again.
- **License.** Both sites' licenses allow free use in videos, with limits (for example, no selling the clips as they are, and care with recognizable people and brands in commercial ads). Read the license page for anything sensitive.
