# TODO

What's left to build. What's already built is in the [README](README.md).

Suggested order: the server (Ranked rounds and the global boards), then multiplayer on the same server (starting with a Who's That Pokémon? race). Offline play comes later. Sprite Slide is Play only for now (no Ranked), so it needs no server and can be built at any point.

## New game: Sprite Slide

A sliding puzzle. A Pokémon's artwork is cut into a grid of tiles with one gap, and the tiles are shuffled. Slide them back until the picture is whole. Fewer moves wins, then the faster time. The Pokémon's name stays hidden until you solve it.

### How a game runs

1. **Setup (`/slide`):** pick a size: Easy (3×3, 8 tiles), Medium (4×4, 15 tiles) or Hard (5×5, 24 tiles).
2. **Loading:** the game picks a random species and waits for its artwork to load before showing the board, like Match. CSS backgrounds fire no load or error events, so the image is preloaded with `new Image()` to get them. A failed or slow image shows the existing "couldn't load" screen.
3. **Playing:** tap a tile in the same row or column as the gap and it slides toward it, pushing any tiles in between. Arrow keys work too. A small picture of the finished sprite sits above the board.
4. **Clock:** starts on your first move, stops when the board is solved, and pauses while the tab is hidden, the same as Match.
5. **Solved:** the gap fills in, the Pokémon's cry plays and its name shows. Then the summary: moves, time, and Play again or See result.
6. **Result (`/slide/result`):** a shareable card with size, moves, time and the Pokémon, like the other games.

### Rules for the edges

- **What a move is:** each tile that moves counts as one. Sliding three tiles in one tap is three moves. Counting taps would let a player shift a whole row for the price of one move.
- **Always solvable:** half of all random shuffles of a sliding puzzle can't be solved. The gap stays in the bottom-right corner and only the other tiles are shuffled. Then a board can be solved exactly when the number of tile pairs out of order is even, on every size. If it's odd, swap the first two tiles. Then, if the board is too close to solved, shuffle again: the Manhattan distance (how far each tile is from home, added up, which is the fewest moves the board could take) must be at least half the size's average. Some luck in the deal stays, as in Match. The shuffle uses the seeded `createRng`, so tests are deterministic.
- **Blank tiles:** the artwork has a lot of transparent space, so corner tiles are often empty and look the same. Two identical tiles in the wrong places would look solved but not count. Draw a background behind the whole picture and slice it with the sprite: the hue changes from left to right and the lightness from top to bottom. Every tile then has its own mix. A single diagonal gradient isn't enough, because tiles on the same diagonal would match. Coloring it by the Pokémon's type would need types in `pokedex.json`, which the offline plan adds.
- **Cutting the image:** each tile is a `div` with the sprite as its CSS background, sized to the whole board and offset to that tile's spot. No canvas, so the cross-site artwork needs no CORS.

### Later: Shiny and Silhouette

Add these once the basic game is in. Each is a style picked next to the size.

- **Shiny:** the shiny artwork (`spriteUrl(id, true)`). Same difficulty, it just looks different.
- **Silhouette:** the sprite layer is blacked out with CSS, the same as the quiz and Match. That's fine because Slide is Play only. A Ranked Slide would need server-made silhouettes, like the race. The background stays, and it's the only thing that tells the tiles apart. The preview picture is a silhouette too, and the name and colors show when it's solved. This is the hard mode.

The sprite and the background have to be separate layers in each tile, so the silhouette filter only hits the sprite. Build the tile that way from the start so these styles are a small change.

### Code

- **`src/lib/slide.ts`:** the pure game: sizes, shuffle with the parity fix, which tiles can move, sliding a row or column, the move count, solved check and the clock (start, pause, resume, stop). Table-driven tests: every shuffle is solvable and not already solved, a tap off the gap's row and column does nothing, a multi-tile slide counts each tile, the clock starts on the first move and stops on solve, no moves after solved.
- **`src/lib/slide-result.ts`:** the result and its URL (`size`, `moves`, `timeMs`, `id`), with parsing that rejects bad sizes, unknown Pokémon, odd move counts or fewer than 4 (the gap ends where it started, so every solve is even and the shortest is 4), and times over a day. Tests for each.
- **Leaderboard:** a `slide` entry in `src/lib/leaderboard.ts`, one board per size, ranked by `[-moves, -timeMs]` like Match. A Slide tab on `/scores`.
- **Screens:** `src/components/slide/` (setup, board, tile, HUD, summary, result card), a `slide-context.tsx` in `src/contexts/`, and routes `slide.index.tsx`, `slide.play.tsx`, `slide.result.tsx` and `scores.slide.tsx`.
- **Hub and preview:** a hub tile, and a card on the link-preview image: update `scripts/og-games.html`, regenerate `public/og-games.png`, bump its `?v=` in `index.html` so sites drop the cached image, and update the `og:image:alt` text and its test.

### Build steps

Each step is its own pull request.

1. **Game logic:** `slide.ts` and `slide-result.ts` with their tests.
2. **Screens:** setup, play and result routes, the hub tile, and the scores board. Check it on a phone: tiles should be big enough to tap on a 5×5 board.
3. **Preview image:** the link-preview card.
4. **Shiny and Silhouette:** the style option, a board per size and style, and the result URL gains `style`.

### Decided for now, easy to change

- Three sizes: 3×3, 4×4 and 5×5.
- The gap is the bottom-right tile.
- Any species, base forms only (`SPECIES`), like Match.
- A preview picture is always shown. A "no preview" option could come later as an extra-hard setting.
- No move limit and no time limit.

## Leaderboards

The personal boards on this device are done (`/scores`). Each board is one game setting (Sprite 60s, Dex Run Gen 1, and so on), and each game's ranking is in `scoring()` in `src/lib/leaderboard.ts`: the quiz and Dex Run rank by score then fewer mistakes, Simon by score, Match by fewer flips then the faster time, and Name Drop by score. Ties go to whoever got there first.

Every game gets two ways to play:

- **Play:** in the browser (and offline, once that exists), and scores go on your personal board. Anyone can edit their own board or type a better score into a result link, and that's fine.
- **Ranked:** opt-in and online only. You pick a nickname, the server runs the round, and the score goes on the global board.

A score from a round played in the browser can't go on the global board, online or offline. The browser can claim any score it likes, so only rounds the server ran count.

### Global

Everyone's top Ranked runs, shown as a Global view on `/scores`. The steps below are written for the quiz; the other games follow the same pattern.

1. **Start:** the browser asks for a round (`POST /rounds` with mode and clock). The server stores the round with a secret seed and sends back only the first question's locked image.
2. **Images:** the same locked images as the race (see How a game runs, under the race). Each question's image is sent encrypted ahead of time. The browser asks for the question once it has the image, or the server sends it anyway 5 seconds after it started sending the image. A download slower than that loses the extra time. The question (the choices and the key) comes all at once, so nothing can be read before the clock starts. The sprite files are named by Pokémon ID, so linking them directly would give the answer away.
3. **Answer:** each answer goes to the server (`POST /rounds/:id/answers`). The server checks it, stamps the time itself, and replies with the result and the next question's locked image.
4. **Clock:** the server runs the clock from its own timestamps. It charges each question from when it sent the key to when the answer arrived. The image is normally on the phone by then, so a slow download doesn't count. Asking for the key late gains nothing, since the image can't be read without it. Answers that arrive faster than a person could manage, measured on the server, get the round flagged.
5. **Finish:** when the server's clock runs out it closes the round and records the score. The browser can't submit a score at all.

The seed never leaves the server, so there's nothing to precompute. Because the server makes the questions, the browser doesn't replay anything, which removes the risk of a client and server running different code or Pokédex data.

Identity starts as a nickname plus an anonymous device token, with no accounts. Nicknames go through a profanity filter. Rate-limit round starts per device and IP.

Boards: today, this week, and all time, per game setting. Days are UTC dates, so everyone shares the same "today". The daily challenge gets its own board, with that day's seed picked by the server.

Ranked Name Drop can't use the question-and-answer steps above, because Pokémon fall in real time. The server runs the game and pushes each Pokémon over a live connection as it appears, so the browser can't work them out ahead of time. The server sends its clock time and each browser keeps the offset, so the browser draws each Pokémon where the server thinks it is. The browser sends each finished name, and the server checks it against what's still falling, using its own timestamp. Names finished faster than a person could type get the round flagged, since a script can read each name off the screen. Ranked rounds don't pause: hiding the tab or losing the connection doesn't stop the server's clock, and the browser says so before you start.

Storage:

- `rounds`: id, seed, game, setting, daily_date (null outside the daily challenge), started_at, finished_at, flagged.
- `moves`: round_id, seq, payload (JSON, shaped by each game), sent_at, received_at.
- `scores`: round_id, nickname, device_id, game, setting, day (UTC), rank_1, rank_2, details (JSON for display, like the best streak), created_at.
- Each game turns its result into `rank_1` and `rank_2` where higher is better: the quiz stores score and −wrong, and Match stores −flips and −milliseconds. Then one index on `(game, setting, day, rank_1 desc, rank_2 desc, created_at)` covers every game's daily and weekly boards. All-time uses the same order without `day`.

## Multiplayer

### Rooms package

A reusable WebSocket rooms library in `packages/rooms`. It knows nothing about Pokémon, so other games and apps can use it too. It's a library the server imports, not a service of its own, so it runs on the same Render server as the leaderboard.

- **What it does:** create a room, join it with a short code, track who's connected, and hand the host role to someone else when the host leaves. It also clears out rooms nobody is in.
- **Dropped connections:** a player who drops keeps their seat for a 30-second grace period, owned by the package. Rejoining inside it restores the seat; after it, the package calls the game's `leave`.
- **Room size:** a room holds up to its game's `maxPlayers`. People who join while a game is running wait in the room and are in the next game, so a game never has more players than that.
- **Server-run games:** each game plugs in as a definition, and the package runs it on the server:

  ```ts
  type PlayerId = string;
  type Rng = () => number;
  type Move<State> = { state: State } | { error: string };

  type GameDefinition<State, Options, Action, View, Result> = {
    minPlayers: number;
    maxPlayers: number;
    parseOptions: (raw: unknown) => Options | null;
    setup: (players: PlayerId[], options: Options, rng: Rng) => State;
    act: (
      state: State,
      player: PlayerId,
      action: Action,
      now: number,
    ) => Move<State>;
    connection: (
      state: State,
      player: PlayerId,
      connected: boolean,
      now: number,
    ) => State;
    leave: (state: State, player: PlayerId, now: number) => State;
    tick?: (state: State, now: number) => State;
    view: (state: State, player: PlayerId) => View;
    result: (state: State) => Result | null;
  };
  ```

  `parseOptions` checks what the host picked in the lobby (the quiz mode, for the race). If it returns null, the package refuses the start and sends the host an error, so `setup` only ever gets valid options. `act` validates a move and either applies it or rejects it with an error for that player. `connection` tells the game when someone drops or comes back inside the grace period, so it can stop waiting on them. `leave` decides what happens when someone is gone for good, so a turn-based game doesn't wait forever. `view` decides what each player sees, so answers and other players' hidden cards never reach the browser. The server stamps every move with its own time.

- **Client:** a framework-free connection with automatic reconnect, plus a separate React hook entry (`rooms/react`), so non-React apps can use it.
- **Protocol:** versioned JSON messages, with the types defined once in the package and validated on the server.
- **Limits:** a maximum message size, a per-connection message rate, and room codes without look-alike letters (no 0/O or 1/I). Rooms live in memory on a single server. That's fine at this size, but more than one server instance would need shared state (Redis or similar).
- **Docs and tests:** TSDoc on the public API. Test it with fake sockets and a fake clock, and include a tiny example game (tic-tac-toe) to prove nothing is Pokémon-specific.
- **Repo:** turn this repo into npm workspaces (`apps/web`, `apps/server`, `packages/rooms`). Publishing the package to npm or moving it to its own repo can come later.

### First multiplayer game: Who's That Pokémon? race

2–8 players join a room with a short code. Everyone gets the same question and taps one of four answers. The fastest right answer scores a point, and a wrong tap locks you out of that question. 10 questions, most points wins, and a tie is shared. It's tap-only, so it plays well on phones, and it needs no database.

#### How a game runs

1. **Lobby:** someone creates a room at `/race` and gets a code and a link (`/race/K7PX`) to send. Others open the link or type the code and pick a nickname. The host picks the quiz mode (Sprite, Silhouette, Region or Dex number) and taps Start once at least 2 players are in.
2. **Question:** the server builds each question from its own seed with `drawAnswer` and `buildQuestion` from the quiz code. Players see a 3-2-1 before the first question.
3. **Images, sent locked:** each question's images (from `questionSpriteIds`: the prompt sprite, or the four answer sprites in Dex number mode) are sent ahead of time, encrypted with a new key for that question. The server first shrinks each one to a fixed small size (256px WebP), then pads it to one fixed byte length (an image that comes out bigger is re-encoded at lower quality until it fits, with a test over every species and style), so the size of the encrypted file can't be matched against the public artwork. The real length goes in the first 4 bytes before encrypting, so the browser can strip the padding. Each image gets its own random IV (the value that makes each encryption unique), stored with it. Phones download them over HTTP from links that mean nothing (`/race/K7PX/images/f3a9…`). In Dex number mode the choices are these images, so each choice is sent with a key that means nothing, never its Pokémon ID or name. The first question's images download during the 3-2-1, and each later question's during the reveal before it. Each phone tells the server when it has them. Encrypted bytes don't match the public artwork files, so they give nothing away. The browser decrypts them with WebCrypto (`crypto.subtle`).
4. **Start:** the server sends the question (the choices and the key) to everyone at once. It waits until every connected player has the images, or 3 seconds after the 3-2-1 or the reveal ends, whichever comes first. Dropped players aren't waited for, and a player who misses the wait twice in a row isn't waited for again that game, so one phone can't slow down everyone. A player still loading gets the question too and loses that time. The key is a few bytes, and a small image decodes in a few milliseconds, so the question appears at about the same moment for everyone.
5. **Your clock:** your time runs from when the server sent the key to when your tap arrives, measured on the server. You get 10 seconds.
6. **Who wins the question:** everyone's clock starts at the same moment, so the first right answer to arrive wins. The question ends on that answer, when every connected player who got the question is locked out, or 10 seconds after the key went out. That hard limit means a stuck phone can't hold a question open.
7. **Reveal:** for 2 seconds everyone sees the right answer (in color, from its public artwork link, even in Silhouette mode), who got it, and the scores. Then the next question.
8. **Results:** final scores and the winner, then Play again (same room, the host can change the mode) or Leave.

#### Rules for the edges

- **Bots:** once the key arrives, a script could match the image against the public artwork and tap in milliseconds. Races are between friends with a room code, so for now the server only logs right answers under 250 ms.
- **Network lag:** the key's trip to you and your tap's trip back both count against you. Taking each player's ping off would be fairer, but a modified client can fake a slow ping and get that time off every answer. So for now nothing is taken off. The server logs each player's ping and how close every question was, so we can tell whether far-away players lose close races before building anything for it.
- **Dropping out:** a player in the grace period keeps their score, and the question doesn't wait on them. Someone who leaves for good stays on the final scores with what they had.
- **Joining mid-game:** you wait in the room and play the next game. The race's rooms hold 8 people.
- **Host leaves:** the rooms package hands the host role to the next player, and the game keeps going.
- **Silhouette mode:** the server blacks the image out before encrypting it, so the full-color art never reaches the browser. Blacking it out with CSS, like single player, would let anyone see the answer in devtools.

#### Build steps

Each step is its own pull request.

1. **Workspaces:** move to npm workspaces with `apps/web` (today's site), `apps/server` and `packages/rooms`. Move the pure Pokémon code the server needs (`quiz.ts`, `random.ts`, `pokedex.ts`, `pokemon.ts`, `regions.ts`, `src/types/pokemon.ts` and `pokedex.json`) into `packages/pokemon`, which both apps import. Update CI and CLAUDE.md to the new layout. No behavior changes.
2. **Server:** a TypeScript server in `apps/server` with a health check and WebSocket upgrade, deployed to Render as a paid web service. The site keeps its own static hosting.
3. **Rooms package:** as planned above, with the tic-tac-toe example and tests on fake sockets and a fake clock.
4. **Race game:** the race as a `GameDefinition` in `apps/server`. It's pure logic, so it gets table-driven tests with a fake clock: the first right answer wins and ends the question, wrong taps lock you out, the 3-second wait for images (skipping dropped players and players who missed it twice in a row), the hard limit with a player who never loads, dropped players not holding up a question, and game over after 10 questions.
5. **Locked images:** one server module, shared with Ranked rounds (whichever is built first builds it). It fetches the artwork from GitHub, shrinks it and blacks it out in Silhouette mode with `sharp`, pads it, and encrypts it with the question's key. Each question's locked images are built once and served to every player until the question ends. The shrunk images (before encrypting) go in an in-memory cache keyed by Pokémon and style, capped at 50 MB and dropping the least recently used first, so memory can't grow without limit and `sharp` doesn't redo the work. A miss fetches it again.
6. **Race screens:** in `apps/web`, under `/race` and `/race/$code`: create or join, the lobby, loading and decrypting the images, the question (reusing the quiz's answer buttons), the reveal and the results. A context in `src/contexts/` holds the connection and the latest view from the server, like the other games.
7. **Hub and preview:** a hub tile for the race, and a card on the link-preview image (regenerated, with its `?v=` bumped).

Testing on real phones is part of step 6: two phones and a laptop in one room, including locking a phone mid-question and switching from Wi-Fi to mobile data. WebCrypto only works on HTTPS pages or localhost, so the phones need the site over HTTPS (a deployed preview or a tunnel), not the dev server's LAN address.

#### Decided for now, easy to change

- 1 point per question, no speed bonus.
- 10 questions, 10 seconds each, a 2-second reveal, and a 30-second grace period for dropped players.
- A 3-second wait for images, 256px images, and a 50 MB image cache.
- No ping deduction. Revisit if the logs show far-away players losing close races.
- No race result page or leaderboard. Each game is a one-off, so there's nothing to rank across rooms.

### Later, maybe: Name Drop race

Name Drop still doesn't play well on phones, so this waits until it does. The idea: everyone sees the same Pokémon fall, the first player to finish a name claims its points, and a game lasts 90 seconds with no lives. The server spawns the Pokémon from its own seed and pushes each one as it appears.

## Server (v2)

What needs it:

- Ranked rounds and the global leaderboard.
- Multiplayer rooms.
- Accounts, or at least a device ID, so teams and bests sync across devices.
- Link previews that show the actual team or score. Preview apps don't run JavaScript, so the server has to rewrite the preview tags for `/share` and every result page (`/quiz/result`, `/dex-run/result`, `/simon/result`, `/match/result`, `/name-drop/result` and `/slide/result`) and draw the image.

Decided:

- **Language: TypeScript.** The server, the rooms package and the site share one language, so they can share the protocol types and the question-building code (`quiz.ts`, in `packages/pokemon` once the race's first build step lands).
- **Hosting: Render.** One paid web service (free ones sleep for 30–50 s, and WebSockets need it awake), plus managed Postgres.

Before the server work starts:

- **Update CLAUDE.md.** It describes a Go API in `v2/api` with sqlc, a web app in `v2/web`, `packages/data-client` and a `v2-ci.yml` workflow. None of those exist here. Change it now to today's layout (`src/`, `scripts/`) and the real CI (`ci.yml`), then again when the npm-workspaces restructure adds `apps/web`, `apps/server` and `packages/rooms`.

## Later: offline play

Make the site an installable PWA so every game works without a connection. Offline games count on your personal board only (see Leaderboards). Offline only works if every image and cry is already on the device, so caching them as you see them isn't enough: a Pokémon you haven't met yet would be blank or silent.

- **Self-hosted images, two sizes:** a `scripts/generate-sprites.ts` script, like the Pokédex generator, downloads each official artwork image and saves it as WebP in `public/sprites/` (using `sharp`): a small size (about 192px) for grids, cards and choices, and a large size (about 384px) for places that show one big Pokémon (the quiz prompt is up to 240 CSS px, so 2–3x screens need more than 192px). Same art, so nothing looks different. Generated output is never edited by hand.
- **Sizes:** the current artwork is 118–203 KB per image (measured), about 230 MB for all 1,143 Pokémon and forms with shiny versions. A 192px PNG is 30–48 KB (measured), and WebP should be well under that. Measure both sizes when the script exists before settling the numbers below.
- **Saving for offline:** a "Save for offline" button downloads the small images and every cry (an estimated 10–20 MB). It also runs automatically when the app is installed. Ordinary visitors don't download anything extra. Large images and shiny versions are cached as you see them. Offline, a missing large image falls back to the small one, and a missing shiny falls back to the regular art.
- **Fallbacks need code:** today a failed image goes to `onError`, which skips the question, and the team slots show nothing. Add the large→small and shiny→regular fallbacks to `PokemonSprite`.
- **Code that changes:** `spriteUrl` in `src/lib/pokemon.ts` and its tests, the hardcoded `width={475}`/`height={475}` in `PokemonSprite`, and the tests that read Pokémon IDs from `/(\d+)\.png$/` (QuizGame, DexRun, Scores).
- **Faster online too:** each image drops from about 150 KB to a small fraction of that, which helps phones even with a connection.
- **Cries stay cross-site:** they come from raw.githubusercontent.com with `fetch` (CORS is allowed there). The Workbox rule for them must only cache status 200 responses.
- **Type filter:** the Party Builder's type filter calls pokeapi.co live (`src/lib/pokeapi.ts`). Add each Pokémon's types to `src/data/pokedex.json` in the generator, so the filter needs no network at all.
- **Repo size:** committing the images adds 10–20 MB to git, and each regeneration adds that again. The Pokédex changes rarely, so committing is fine to start. Move them to Git LFS if regenerating becomes common.
- **Alternative:** PokeAPI's small pixel sprites are 0.5–1.7 KB each (about 2.5 MB). That's far smaller, but the look changes to pixel art, and many alternate forms and recent Pokémon have no pixel sprite.
- **Show the state:** an "Offline" badge in the header, and Ranked greyed out while offline. Share and Copy link keep working, since results live in the URL.
- **Tooling:** `vite-plugin-pwa` (Workbox) rather than a hand-written service worker.
