# mini-games

Play: https://jae09082-sys.github.io/mini-games/

Mobile/desktop Minesweeper and 2–4 player Tetris battle. Tetris uses six-character room codes, guest names, opponent previews, next-piece preview, hold-to-move controls and a dashed landing ghost. Minesweeper supports touch long-press or explicit flag mode.

## Firebase

Project: `mini-games-5b34b`. Enable Anonymous Authentication and deploy `database.rules.json` to Realtime Database. Public web configuration is in `firebase-config.js`; never add service-account keys here.

Each tab has a session-scoped anonymous identity (survives reload, not closing the tab). Rankings keep the best submitted score per identity, with daily boards using Korea time and separate Minesweeper difficulty boards. These are casual, client-reported rankings, not cheat-proof server-validated results. Names and scores are public. The room host starts the battle; leaving as host ends the room. Create a new room to admit players after a round has started.

## Checks

`node --test tests/game.test.cjs` runs local game/control regression tests.

`node tests/firebase-live.mjs` requires internet; it creates temporary ranking entries under a unique test period, checks access controls, and removes those entries afterward.

Publish by committing and pushing to `master`; GitHub Pages serves the repository root. Firebase rules must be published separately in the Firebase console.
