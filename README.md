# gilded-hour-heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/golden-lark-12/gilded-hour-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/golden-lark-12/gilded-hour-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

Gilded Hour is a single-screen stealth heist game: one museum floorplan, three guard patrols with sweeping vision cones, rotating security cameras, a timed laser hall, two hackable terminals, four loot targets, and the Sun Dial in a vault behind a door only the vault terminal opens. Grab the dial, crack its case, and reach the EXIT stairs before the clock runs out.

Light is the economy. Your lantern reveals loot and terminals, but guards and cameras spot a lit thief from further away. Sneak to shrink your silhouette, dash to cross a cone, spend a smoke pellet to vanish, or fire the EMP to kill cameras and lasers for a few seconds. Every route — the main doors, the gallery, the vent gap — is a different read of the same patrols.

## Run it

```sh
python3 -m http.server 8080 --directory game
```

Open http://localhost:8080 in desktop Chrome. No build step, no network: every script is a file under `game/`, and all sound is synthesised in the browser.

## Controls

WASD / arrows move · SHIFT sneak · SPACE dash · E interact / hack / crack · 1 smoke · 2 EMP · L lantern · M mute · P pause · R retry after a win or a capture.

---

<sub>Entered on [make.fun](https://make.fun/?ref=golden-lark-12&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
