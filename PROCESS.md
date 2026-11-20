# Process

This repo is a published copy of GymTrack after one bounded Pi harness run on 20 Nov 2026. It is not a GitHub fork. GitHub does not fork a repository into the same account, and the source repo [tonihintikka/gymbuddypwa](https://github.com/tonihintikka/gymbuddypwa) stays on its own `main`.

Source commit: `0580c757cfd78633e54258a87a306d22f0a80d50`.

## What ran

The runner is `ui_loop.py` in the local sandbox `verda-agent-sandbox`. It is not part of this app. Pi 1.5.2 loaded the Verda models. The models had no tools.

| Step | Model | Thinking | What it did |
|---|---|---|---|
| Plan | `verda-kimi/kimi-k3-1-pro` | `low` | One plan. No file writes. |
| Edit | `verda-deepseek/deepseek-4-1-flash-1017` | `off` | Wrote at most eight files from the plan. |
| Check | local runner | none | `npm test`, then Vite on port 5137, then agent-browser. |

agent-browser used `/usr/lib/chromium/chromium`. The tour opened a 390×844 viewport, clicked Workout, Exercises, Programs, History, and Progress, filled the exercise search, and seeded two IndexedDB workout logs. The same failure signature stops the loop. There is at most one repair. `--look-only` makes no model call.

`thinking low` is the lowest effort this Pi map sends for Kimi. Verda's product default is `max`. That default can spend the whole completion on reasoning.

## What the checks found first

Before any edit, on 20 Nov 2026:

- `npm test`: 72 tests, 9 files, all passed.
- Search for `Bench` showed Bench Press. Search for `zzzz-no-match` hid it.
- After two seeded logs, History showed both rows.

The open bug checkboxes in `todo.md` were not reproduced. A first Kimi plan that set out to rewrite search, history loading, and workout save was discarded.

`npm ci` failed because `canvas@3.1.0` does not compile on Node 26. That package is imported only by `scripts/generate-icons.js`. The test install was `npm ci --ignore-scripts`. No dependency was added or upgraded. The 13-day package freeze was not involved.

## What was published

The applied plan took the unchecked items in `docs/modern-ui-and-navigation-todo.md` and named eight files:

- `src/App.tsx` and `src/App.test.tsx`: the five tabs follow the URL hash, invalid hashes fall back to Workout, and the nav exposes `aria-current="page"`.
- `src/components/SectionHeader.tsx`: one shared heading, used by Exercises, Programs, History, and Progress.
- `src/index.css`: spacing, type, and color tokens. Dark colors apply only under `[data-theme="dark"]`. The running theme stays light.
- The four screen files above, which mount `SectionHeader`.

Program edit, duplicate, and share stayed out. Package files and the Vite config were rejected by the runner if a model wrote them.

After the edit, `npm test` reported 81 tests, 10 files, all passed. The browser tour passed once the history check set `#history` before reload. The new app treats the hash as the source of truth, so a localStorage-only switch stayed on the previous tab.

Recorded list-price cost of the completed calls was about $0.098. Pi's `totalFromProvider` was false, so this is not a Console bill. One repair call was cut off locally after 600 seconds and left no usage line. Verda's FAQ says interrupted requests are not charged. That FAQ was not re-read on 20 Nov 2026.

## What is still rough

Exercises shows the title twice: `SectionHeader` and the heading inside `ExerciseList`. History shows "History" and "Workout History". Those list files were outside the eight-file cap.

The shell is still the 2025 light layout. The pass did not restyle cards, charts, or the workout logger.

## Counter-argument

A branch on `gymbuddypwa` would have kept one history. Toni asked for a separate repo so the existing repository stays untouched. This copy has no path back to the source except the commit named above. Later fixes should land here, not on `gymbuddypwa` `main`.

Harness: Grok / grok-4.7.
