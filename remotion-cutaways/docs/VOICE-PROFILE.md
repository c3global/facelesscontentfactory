# Dr. CK natural voice profile and Google Flow voice prompt

Source: measurements from eight voiceover recordings used in edited videos (terrace, cheered, reverse, reverse2, 20-years, four-places, wk2-1, wk2-2), about five minutes of speech. Pitch came from an autocorrelation tracker on the audio, pace and pauses from the word timings (whisper, snapped to the audio). Claude cannot hear audio, so anything that needs an ear (accent, texture, warmth, diction, emotion, habits) is not in the measured section and is listed as open.

## Measured

| Trait | Result |
| --- | --- |
| Pitch center | median about 158 Hz (recordings range 154 to 163 Hz), a low-to-mid female speaking register |
| Pitch movement | middle half of her pitch spans about 6 semitones: melodic, not sing-song. About 1 word in 5 lifts 3 or more semitones above her average, mostly question words and key nouns ("what", "people", "community") |
| Overall pace | about 154 words per minute including pauses (141 to 168) |
| Pace inside a phrase | about 200 words per minute (164 to 227): quick bursts |
| Pause frequency | about 25 pauses of 0.3 s or longer per minute |
| Pause length | after a sentence: median 0.54 s (up to 0.78 s). After a comma: median 0.49 s, almost as long. Mid-phrase gaps: median 0.19 s, up to 0.5 s before a key word |
| Pause placement | about two thirds of all gaps fall mid-phrase, not at punctuation |
| Sentence endings | statements never show a pronounced fall: flat in four recordings, rising 3 to 7 semitones in the others. Questions rise about 2 semitones on average |
| Loudness range | about 12 dB between quiet and loud syllables: medium dynamics, no shouting, no trailing off |
| Consistency | median pitch within 5 Hz across all eight recordings, made in different tools |
| Open question | about 15 percent of voiced frames track below 110 Hz in every recording, spread through sentences. It could be a low creaky texture or a measurement artifact; left out of the prompt |

## Open (needs Dr. CK's ear)
Accent or regional quality, vocal texture (smooth, raspy, breathy, bright), warmth, diction and articulation, emotional range, recurring vocal habits, and how conversational versus presenter-like she sounds. Also unknown: whether the recordings are her live voice or a clone made in an avatar tool. If they are clones, this profile describes the clone.

## Google Flow voice performance prompt (full)
Voice performance: a woman speaking in a low-to-mid register, alto range, with the fundamental around 155 to 165 Hz. Chest resonance, not breathy, not bright, not girlish. ACCENT LINE (choose one): A) General American accent, relaxed vowels. B) Light Southern American regional quality, slightly lengthened vowels, never exaggerated.
Pace: about 150 words per minute overall. Speak in quick conversational bursts of 4 to 7 words, then stop. After every sentence and after every comma hold a silence of about half a second. Add a shorter pause of about a fifth of a second, or occasionally half a second, mid-phrase right before a key word.
Pitch and emphasis: moderate melody. Lift the pitch on question words and key nouns, about 3 semitones, instead of getting louder. Keep volume even, with only a slight difference between the softest and loudest syllables. No shouting, no whispering.
Sentence endings: end statements level or with a slight lift. Do not drop pitch and trail off at the end of a sentence. Rise gently on questions.
Delivery: a person talking to one listener across a table. No announcer cadence, no sing-song, no uptalk on every line. Clear consonants, relaxed jaw. This is a style description, not an imitation of any specific person.

## Short version (2 to 3 sentences)
A woman with a low-to-mid, warm voice speaking at a conversational pace of about 150 words per minute, in short quick bursts with half-second pauses after every sentence and comma. She emphasizes by lifting pitch on key words, not by getting louder, and ends statements level or slightly up instead of dropping. Even volume, clear consonants, no announcer tone.

## Check loop
Send Claude a Flow clip and it can run the same measurements (median pitch, words per minute, pause lengths, sentence-end slope) and compare them with the table above.
