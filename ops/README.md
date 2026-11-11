# 9V Clearance (ME2804)

A round-based tactical first-person shooter that teaches four air-legislation topics:
Singapore Air Operator · C of A & Export C of A · Aircraft Noise Certificate · Aircraft Permit to Fly.

## How it plays
- Pick a **specialist** (each has an ability and an ultimate) and an **operation** (one per topic).
- Read the **intel briefing** (taken from the slides).
- **Buy phase** each round: answer a true/false *recon check* for bonus credits, then buy weapons and armour.
- **Round**: one question, three answers projected on sites **A / B / C**. Fight past the hostile bots and hold `F` on the correct site to certify it. One wrong site brings reinforcements; two fail the round.
- Every round ends with the correct answer, the reason and the slide reference.
- 6 rounds per operation, clear 4 to pass. Clear all four to unlock the mixed **Check Ride** (6 of 8) and a certificate.
- Progress is saved in `localStorage`.

## Files
- `content.js` – intel cards, round questions, recon statements, specialists, weapons (edit here to change content)
- `game.js` – engine: map, combat, bots, rounds, shop, HUD
- uses `../game/three.min.js` (three.js r128, MIT)

Append `?nolock` to the URL to play without pointer lock (useful for automated testing).
