"""Rank later musical sections by energy change, bass entrance, and cue strength."""
import json
from pathlib import Path
import subprocess
import sys

import numpy as np

SAMPLE_RATE = 11025
HOP = 220
WINDOW = 1024


def mean_range(values, times, start, end):
    selected = values[(times >= start) & (times < end)]
    return float(selected.mean()) if len(selected) else 0.0


def analyze(path, duration, tip_lengths):
    decoded = subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", str(path), "-ac", "1",
        "-ar", str(SAMPLE_RATE), "-f", "f32le", "-"
    ])
    audio = np.frombuffer(decoded, dtype=np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(audio, WINDOW)[::HOP]
    times = (np.arange(len(frames)) * HOP + WINDOW / 2) / SAMPLE_RATE
    spectrum = np.abs(np.fft.rfft(frames * np.hanning(WINDOW)))
    frequencies = np.fft.rfftfreq(WINDOW, 1 / SAMPLE_RATE)
    energy = np.sqrt(np.mean(frames * frames, axis=1))
    bass = np.sqrt(np.mean(spectrum[:, (frequencies >= 35) & (frequencies < 180)] ** 2, axis=1))
    onset = np.zeros(len(frames))
    for low, high, weight in [(35, 180, 1.3), (180, 1600, 1.0), (1600, 5200, .9)]:
        band = np.log1p(spectrum[:, (frequencies >= low) & (frequencies < high)])
        change = np.maximum(0, np.diff(band, axis=0, prepend=band[:1])).mean(axis=1)
        onset += weight * np.minimum(change / (np.percentile(change, 95) + 1e-8), 4)
    onset = np.convolve(onset, [.2, .6, .2], mode="same")

    # Keep distinct attacks, then test cue spacing against the copy's reading time.
    peaks = np.flatnonzero((onset[1:-1] >= onset[:-2]) & (onset[1:-1] > onset[2:])) + 1
    threshold = np.percentile(onset[peaks], 60)
    peaks = peaks[onset[peaks] >= threshold]
    ordered = sorted(peaks, key=lambda index: -onset[index])
    retained = []
    occupied = np.zeros(len(onset), dtype=bool)
    radius = round(.12 * SAMPLE_RATE / HOP)
    for index in ordered:
        if occupied[index]:
            continue
        retained.append(index)
        occupied[max(0, index - radius):index + radius + 1] = True
    retained = np.array(sorted(retained))
    peak_times = times[retained]
    peak_values = onset[retained]
    max_value = np.percentile(peak_values, 95) + 1e-8

    reading = [max(1.7, min(2.45, length / 20)) for length in tip_lengths]
    first_cue = 1.35 if len(tip_lengths) == 4 else 2.0
    spacing = (duration - first_cue - max(2.0, reading[-1])) / (len(reading) - 1)
    candidates = []
    for first in range(len(retained)):
        start = peak_times[first] - first_cue
        if start < 15 or start + duration > len(audio) / SAMPLE_RATE - .5:
            continue
        cue_indices = [first]
        valid = True
        for position in range(1, len(reading)):
            target = peak_times[first] + position * spacing
            options = np.flatnonzero(
                (np.abs(peak_times - target) <= .30)
                & (peak_times >= peak_times[cue_indices[-1]] + reading[position - 1])
                & (peak_times <= start + duration - reading[-1])
            )
            if not len(options):
                valid = False
                break
            scores = peak_values[options] / max_value - np.abs(peak_times[options] - target) * .7
            cue_indices.append(int(options[np.argmax(scores)]))
        if not valid:
            continue
        entrance = peak_times[first]
        before = mean_range(energy, times, entrance - 2.8, entrance - .15)
        after = mean_range(energy, times, entrance + .10, entrance + 1.7)
        bass_before = mean_range(bass, times, entrance - 2.8, entrance - .15)
        bass_after = mean_range(bass, times, entrance + .10, entrance + 1.7)
        energy_rise = float(np.clip(np.log((after + 1e-5) / (before + 1e-5)), -1, 2))
        bass_rise = float(np.clip(np.log((bass_after + 1e-5) / (bass_before + 1e-5)), -1, 2))
        average_level = mean_range(energy, times, start, start + duration)
        activity = average_level / (np.percentile(energy, 85) + 1e-8)
        strength = float(np.mean(peak_values[cue_indices] / max_value))
        score = strength + .40 * energy_rise + .27 * bass_rise + .25 * min(1.5, activity)
        cues = [round(float(peak_times[index] - start) * 24) / 24 for index in cue_indices]
        candidates.append({
            "start": round(float(start), 3), "duration": duration, "cue_seconds": cues,
            "score": round(float(score), 3), "energy_change": round(energy_rise, 3),
            "bass_change": round(bass_rise, 3),
        })

    chosen = []
    for candidate in sorted(candidates, key=lambda item: -item["score"]):
        if all(abs(candidate["start"] - prior["start"]) >= duration for prior in chosen):
            chosen.append(candidate)
        if len(chosen) == 3:
            break
    return {"source_seconds": round(len(audio) / SAMPLE_RATE, 2), "candidates": chosen}


if __name__ == "__main__":
    manifest = json.loads(Path(sys.argv[1]).read_text())
    result = {}
    for item in manifest:
        analysis = analyze(Path(item["source"]), item["duration"], item["tip_lengths"])
        result[item["day"]] = {**item, **analysis}
        print(item["day"], json.dumps(analysis), flush=True)
    Path(sys.argv[2]).write_text(json.dumps(result, indent=2) + "\n")
