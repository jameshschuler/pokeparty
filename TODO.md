# TODO

What's left for Who's That Pokémon?, roughly in the order I'd build it. Sprite, silhouette, region and dex number modes are done, along with the 30/60/90s clock, quit, and the wrong-answer penalty.

## Game modes

### Time attack

Start at 30 seconds. Each right answer adds 3 seconds and each wrong one takes 2. The round ends at zero, and the score is how many you got right. It works with any mode, so it's a clock option next to 30/60/90 rather than its own mode.

- The clock already supports moving `endsAt`, but `QuizRound.penaltyMs` and `formatPenalty` only handle losses. Replace them with one signed `clockDeltaMs` (and a `formatClockDelta` that prints "+3s" or "−2s") rather than adding a separate bonus field.
- Cap how much time can build up (maybe 60 s).
- The clock setting stops being only a number of seconds. Make it `30 | 60 | 90 | "attack"` and carry it in the URL as `clock=attack`, so result links, the personal board and "Play this mode" all keep it. Today `parseQuizSettings` would turn an unknown value into 60.

## Results

### Shareable result page

`/quiz/result?mode=silhouette&clock=60&score=23&total=27&streak=11` shows a result card with Copy link, Share, and "Play this mode". The summary screen links to it.

Anyone can type a better score into the URL. That's fine until there's a global leaderboard, which needs the server anyway.

## Leaderboards

Two boards: a personal one that needs nothing new, and a global one that needs a server. Build the personal board with the result page. The global board is v2.

Both are ranked per mode and clock (Sprite 60s, Silhouette time attack, and so on). Mixing them would be meaningless. Ties go to accuracy, then to whoever got there first.

### Personal

Your own top 10 runs per mode and clock, kept in localStorage on this device.

- Save `{ score, wrong, bestStreak, playedAt }` when a round ends. Load it with the same validation as saved teams, so bad or old data is dropped instead of crashing. Sync across tabs with the `storage` event, the same way teams do.
- The summary says where the run landed: "New best!" or "#3 on your board".
- The setup screen shows your best for the selected mode under each clock button.
- A `/quiz/leaderboard` page lists your board per mode and clock. Add the Global tab only once global exists.
- Nothing stops someone editing their own localStorage. That doesn't matter, since it's only their board.

### Global

Everyone's top runs, which means scores have to be trustworthy. Nothing the browser says about itself can be trusted, so the server owns the round:

1. **Start:** the browser asks for a round (`POST /rounds` with mode and clock). The server stores the round with a secret seed and sends back only the first question.
2. **Images:** the question's image goes through the server under an opaque name (`/rounds/:id/image/3`). The sprite files are named by Pokémon ID, so linking them directly would give the answer away.
3. **Answer:** each answer goes to the server (`POST /rounds/:id/answers`). The server checks it, stamps the time itself, and replies with the result and the next question.
4. **Clock:** the server runs the clock from its own timestamps. It charges each question from when it sent it to when the answer arrived, and allows a capped amount for the image to load (a few seconds) so slow connections aren't punished. Answers that arrive faster than a person could manage, measured on the server, get the round flagged.
5. **Finish:** when the server's clock runs out it closes the round and records the score. The browser can't submit a score at all.

The seed never leaves the server, so there's nothing to precompute. Because the server makes the questions, the browser doesn't replay anything, which removes the risk of a client and server running different code or Pokédex data.

Identity starts as a nickname plus an anonymous device token, with no accounts. Nicknames go through a profanity filter. Rate-limit round starts per device and IP.

Boards: today, this week, and all time, per mode and clock. Days are UTC dates, so everyone shares the same "today". The daily challenge gets its own board, with that day's seed picked by the server.

Storage:

- `rounds`: id, seed, mode, clock, daily_date (null outside the daily challenge), started_at, finished_at, flagged.
- `answers`: round_id, question_index, pokemon_id, picked_id, sent_at, answered_at.
- `scores`: round_id, nickname, device_id, mode, clock, day (UTC), score, wrong, best_streak, created_at.
- An index on `(mode, clock, day, score desc, wrong asc, created_at)` covers the daily and weekly boards in ranking order. All-time uses the same order without `day`.

Open decisions:

- **Server language.** With the server making the questions, Go works fine, since nothing has to match the browser exactly. TypeScript could still share the question-building code in `src/lib/quiz.ts`. Either works; pick whichever you'd rather maintain.
- **Hosting.** Render's free web services sleep, which adds a 30–50 s delay before a round starts. Plan for a paid instance, or use a host that doesn't sleep, plus managed Postgres.

## Smaller follow-ups

- Warn before the browser's back button leaves a round. TanStack Router's `useBlocker` can do it, but some exits will show the browser's own "Leave site?" dialog.
- Daily challenge without a server: seed the deck with the UTC date so everyone plays the same Pokémon. Anyone can compute that seed, so it's for fun, not for a board (the global daily board uses the server's secret seed). It needs a fresh `createRng(seed)` per round: today the quiz context makes one random generator and Play Again keeps drawing from it.
- Fold the Party Builder filters into a collapsible panel. Three rows of chips take about a quarter of a phone screen.
- Swap the browser-tab favicon to match the chosen ball theme.

## Needs a server (v2)

- The global leaderboard.
- Accounts, or at least a device ID, so teams and bests sync across devices.
- Link previews that show the actual team or score.
