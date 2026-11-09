---
name: handoff
description: "Keep Faceless48 work going across conversations without rereading old chats. Use when Dr. CK says 'wrap up', 'save where we are', 'pick up', 'where were we', or starts a new conversation about Faceless48, the plug-in, the course or the effects."
---

# Handoff

The one page that carries everything is `faceless48-beta/STATE.md`.

**Pick up** (start of a conversation, or "pick up", "where were we"): read `faceless48-beta/STATE.md` before anything else, then continue from "In progress". Do not ask her to repeat anything that is in it.

**Wrap up** ("wrap up", "save where we are", or before a long break):
1. Update `faceless48-beta/STATE.md`: what is live (ids, links, versions), what changed today, what is in progress and the next step, open questions for her. Keep it to one page; replace stale lines instead of appending history.
2. Save any files the next conversation will need into the repo (not /tmp, which is lost).
3. Commit and push, then tell her in one line that she can start a fresh conversation and say "pick up".
