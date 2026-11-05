# Air Legislation Academy (ME2804)

A Roblox-style 3D browser game that teaches slides 1–42 of *ME2804 Air Legislation*.

**Play:** open `game/index.html` in a modern browser (no install, works offline), or serve the folder:

```bash
python3 -m http.server 8000 --directory game
```

## How it works
- Roam the academy island as a blocky engineer (WASD/arrows, Shift run, Space jump, drag mouse to look, E to interact; touch controls on mobile).
- 9 zones, one per topic: Aviation history → Chicago Convention → ICAO → How ICAO works → Contracting States → Air Navigation Act → SAR & Regulations → ANO → UAS in Singapore.
- Each zone: read the expert's **briefing** (taken from the slides), then clear **challenges** (timeline/hierarchy ordering, true/false & sorting, quizzes, a 3D **warehouse dash**, a **flight challenge** through answer gates).
- Collect 16 ⭐ knowledge stars, earn XP and ranks, then pass the Chief Examiner's 10-question **final exam** for a certificate.
- Progress is saved in `localStorage`.

## Files
- `content.js` – all lesson text and questions (edit here to change content)
- `game.js` – 3D world, controls, challenge engines
- `three.min.js` – three.js r128 (MIT)
