# Pencil Whip (ME2804)

An open-world driving game in the style of the classic crime sandbox games (original world, characters and art), teaching:
Aircraft Maintenance · Certificate of Release to Service (CRS) · Certificate of Maintenance Review (CMR) · Technical Log.
Content comes from slides 64–73, 99–104, 110, 116, 121, 125 and 127 of the ME2804 deck.

## How it plays
- Explore Vista Bay Airport on foot or in any vehicle (`F` to get in, or to take one; `W A S D` drive, `Space` handbrake).
- **Run**: hold `Shift` on foot to sprint (on touch: push the stick fully or hold **RUN**). Sprinting drains the stamina bar above the radar; run it empty and you're winded until it recovers.
- Walk or drive into a contact's coloured marker on the radar to start a mission. There are 5 contacts and 9 missions: each mission's cutscene teaches the rules, then you drive to objectives, chase down Pencil Whip vehicles and answer checks (quizzes, select-all, sort).
- **★ Heat**: taking occupied vehicles, hitting pedestrians, ramming inspectors or making a wrong call sends CAAS inspectors after you. Lose them by staying out of sight, or clear your heat at the pink **R** Records Desk by answering a question. If they box you in, you're busted and sent to the Training Centre for a refresher.
- Every fact you learn goes into the **Notebook** (`N`). 12 hidden logbook pages add more.
- Finish all 9 missions to open the **Licence Board** exam (10 questions, 8 to pass) and earn a certificate.
- Progress is saved in `localStorage`.

## Graphics
- Day–night cycle (one game hour every 30 seconds) with a sunset sky, stars, lit windows, street lamps and headlights at night; the clock is under your cash.
- Real-time shadows, glossy reflective car paint and glass, animated sea, tyre smoke and skid marks, crash dust, curbs, crossings, shop fronts and rooftop billboards.
- **Graphics: High / Low** in the pause menu. Low turns off shadows and uses a lower resolution; it's the default on phones and tablets.

## Files
- `content.js` – facts, contacts, missions and exam questions (edit here to change content)
- `game.js` – world, driving, traffic, pedestrians, heat/inspectors, missions, HUD
- uses `../game/three.min.js` (three.js r128, MIT)
