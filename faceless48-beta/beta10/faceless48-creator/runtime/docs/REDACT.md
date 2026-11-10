# Blur private details in a screen recording

Screen recordings often show things you do not want on the internet: an inbox, a share link, a key, a file path with a client name, your account picture. The redact tool blurs the areas you choose, for the seconds you choose, and writes a new clip. Your original is never changed.

Say **"Blur my private info"** and your assistant does the steps below. You can also run them yourself.

## The three commands

```
npm run f48 -- redact frame public/raw/lesson.mp4 30
npm run f48 -- redact check content/redact/lesson.json
npm run f48 -- redact apply content/redact/lesson.json
```

- `frame` saves a still of the clip at that second with a grid every 100 pixels, numbered every 200. Use it to read where a private area sits.
- `check` shows what will be blurred and warns about boxes outside the picture. It writes nothing.
- `apply` writes `lesson-redacted.mp4` next to the original, plus a still of every blurred box so you can confirm it is unreadable. It refuses to overwrite an existing file.

## The spec

```json
{
  "input": "public/raw/lesson.mp4",
  "strength": 24,
  "boxes": [
    {"x": 0, "y": 0, "w": 1920, "h": 72, "from": 0, "to": 30, "label": "bookmarks bar"},
    {"x": 28, "y": 20, "w": 312, "h": 545, "from": 54, "to": 69, "label": "first two Finder columns"}
  ]
}
```

- `x`, `y`, `w`, `h` are in the clip's own pixels. `x` and `y` are the top-left corner.
- `from` and `to` are seconds. Leave `to` out to blur until the end.
- `strength` is optional. 24 hides ordinary text; use a higher number for big type.
- `output` is optional. The default is `<input>-redacted.mp4`.

## Tips

- Scrolling and moving windows need a new box for each stretch of time. Add about half a second on each side so nothing shows as the window moves.
- Blur only what is private. If you want the third column of a window or a page title visible, keep your box off it.
- Look at a still from the middle of every box, then watch the new clip once all the way through. The tool blurs what you tell it to and cannot tell what is private.
- Edit from the redacted clip. The original still shows everything, so do not share it.
