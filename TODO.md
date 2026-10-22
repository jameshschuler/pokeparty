# TODO

What's left to build. Done so far: Party Builder, Who's That Pokémon?, Dex Run and Simon (each game has a shareable result page), and the personal scores page (`/scores`).

## Simon sound

Each Pokémon plays its cry when it lights up (PokeAPI has the cries), with a mute button, since many people play with sound off. Check Safari, which may not play the `.ogg` files.

## Leaderboards

The personal boards on this device are done. A global board needs a server, so it's v2.

Each board is one game setting (Sprite 60s, Dex Run Gen 1, and so on). Ties go to fewer mistakes, then to whoever got there first.

Anyone can type a better score into a result link. That's fine until there's a global board.

### Global

Everyone's top runs, shown as a Global view on `/scores`. That means scores have to be trustworthy. Nothing the browser says about itself can be trusted, so the server owns the round. The steps below are written for the quiz; Dex Run and Simon follow the same pattern.

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
- **Hosting.** Stay on Render. Free web services sleep, which adds a 30–50 s delay before a round starts, so use a paid instance, plus managed Postgres.

## Needs a server (v2)

- The global leaderboard.
- Accounts, or at least a device ID, so teams and bests sync across devices.
- Link previews that show the actual team or score. Preview apps don't run JavaScript, so the server has to rewrite the preview tags for `/share`, `/quiz/result`, `/dex-run/result` and `/simon/result` and draw the image. It runs on the same Render web service as the global board.
