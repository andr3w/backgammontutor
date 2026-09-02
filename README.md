# Backgammon Tutor

A web app that shows you a backgammon position and a dice roll, asks you to play
it, and grades your answer against engine analysis — with an explanation of what
you got right or wrong, for **every** answer you could have given, not just the
best one.

**Live at [b.pullrope.net](https://b.pullrope.net)**

## Status

Early. The authoring format, the build pipeline and the server are working, and
the first page renders. The answer interface, the validation pass and the
performance database are not built yet.

## The idea

Most backgammon trainers generate random positions and grade them live. That
makes their feedback generic — the engine can say *you lost 0.045 equity*, but
it has never seen the position before, so it cannot tell you which trap you fell
into.

Questions here are fixed, so the entire answer space is known before anyone
visits the page: gnubg enumerates every legal move with its equity in
milliseconds. That makes it possible to write real feedback for every response,
which is the whole point of the project.

## Authoring

Pages are plain JavaScript modules that export data. No template language — if
you are programming, program.

```js
const opening = board`
x...o.||o....x
x...o.||o....x
x...o.||o.....
x.....||o.....
x.....||o.....
--------------
o.....||x.....
o.....||x.....
o...x.||x.....
o...x.||x....o
o...x.||x....o`;

export default page('Opening rolls everyone agrees on', [
  prose`Four of them follow the simplest rule in the game: **if the roll makes
    a point, make it.**`,
  question({
    id: 'open-31',
    board: opening,
    dice: [3, 1],
    ask: prose`How do you play 3-1?`,
    goals: [
      makes(5, prose`The five point is the most valuable point on the board...`),
      shots(0, prose`And it costs nothing — you finish with no blot anywhere.`),
    ],
    traps: {
      '24/20': prose`The four point anchor is worth having, but not at this price.`,
    },
  }),
]);
```

`board` is a tagged template literal: six point-columns, `||`, six more, a `---`
fence between the halves, optional `bar x1` / `off o2` lines. Top row runs 13→18
then 19→24; bottom row 12→7 then 6→1 — the same numbering as gnubg's diagrams.
It parses to a 26-slot position and emits an XGID. Nothing is authored in XGID
by hand.

The parser is strict on purpose. A board that loses a character, a line break or
a checker in a copy-paste is rejected with a specific message rather than
silently becoming a different legal position:

```
short right-hand half  -> row "x...o.||o...x" has 11 point columns, need 12
dropped a checker      -> x has 14 checkers, need 15
```

**Goals** are structural predicates over the position and the move — `makes(5)`,
`shots(0)`, `escapes(24)` — each carrying the prose that explains why it matters.
Feedback for a played move comes from diffing its goal vector against the best
move's, so you write one paragraph per idea rather than one per move. `traps`
sits on top for named tempting errors that deserve their own words.

Because a page is code that returns data rather than a string, the build can walk
the result and check the goals against gnubg: the engine's best move must satisfy
every required goal (or the question is wrong), and no other move should satisfy
all of them (or the goals are under-specified). That check isn't written yet.

## Layout

| Path | |
|---|---|
| `pages/*.mjs` | one module per page — prose and questions |
| `lib/board.mjs` | the `board` literal → 26-slot position → XGID |
| `lib/kit.mjs` | `$m` hyperscript, `prose`, `page`, `question`, goals |
| `lib/render.mjs` | the SVG board, and the page as a pager of screens |
| `lib/check.mjs` | build-time analysis: is every question answerable, and answerable one way? |
| `lib/goalfind.mjs` | authoring: the smallest goal sets that pin a chosen play |
| `lib/design.mjs` | authoring: a position from counts, printed as a board literal |
| `static/rules.mjs` | legal moves, maximal plays, notation — no DOM, so the build uses it too |
| `static/goals.mjs` | what a goal means; shared by the grader and the checker |
| `static/play.mjs` | tap to move, undo, grading, medals |
| `build.mjs` | renders one page, or the contents index |
| `verify.mjs` | asks gnubg whether the play a page accepts is the best play |
| `server.py` | Flask; serves `built/<slug>.html`, rebuilding when stale |
| `nginx.conf`, `uwsgi.ini` | deployment, symlinked into `sites-enabled` / `apps-enabled` |

## Build

```sh
node build.mjs opening-agreed   # -> built/opening-agreed.html
node build.mjs --index          # -> built/index.html
```

Running a page module directly produces no output, which is correct — it exports
a value rather than doing anything.

The server rebuilds on demand: a request for `/<slug>` serves
`built/<slug>.html` if it is newer than `pages/<slug>.mjs`, every `lib/*.mjs`
and `build.mjs`, and otherwise rebuilds first. Editing the kit therefore
invalidates every page, not just one. Cold build is ~180 ms, cached ~20 ms.

## Running locally

```sh
python3 -m venv venv && venv/bin/pip install -r requirements.txt
venv/bin/python server.py        # http://127.0.0.1:5051
```

Needs Node 20+ (ES modules, top-level await) and Python 3.

## Analysis

Positions are analysed with [GNU Backgammon](https://www.gnu.org/software/gnubg/)
1.08 driven through its embedded Python interpreter. Evaluation is cheap — a
3-ply analysis of a 16-candidate position takes about 0.3 s — so the corpus can
be re-analysed whenever the engine or the questions change. Rollouts are roughly
900× that and are reserved for positions where the top two moves are too close
to separate.

Every position's XGID is checked by round-tripping it through gnubg and asserting
the resulting Position ID, because XGID has no checksum: a typo produces a
different legal position rather than an error.

### Checking a page

Two different questions, two different tools.

`build.mjs` runs `checkPage` and refuses to write a page that fails it: a trap
keyed to a play that is not legal, goals no play can meet, goals several plays
meet. That proves a question is *answerable*, and answerable one way.

It cannot tell you whether that answer is any good. Only an engine can:

```sh
node verify.mjs build_points_medium --gnubg     # GNUBG_SSH=host, default laalaa
```

For each question this prints gnubg's best play at 3-ply, whether the page
accepts it, and the equity loss of the runner-up. That last number decides
whether a question belongs on a page at all — if the second-best play is within
0.020 the question is a coin toss, and marking it wrong is a lie. `--suggest`
adds, for any question that fails, the goal sets that would have pinned gnubg's
choice.

Going the other way, `lib/goalfind.mjs` answers "I want this play to be the
answer, what goals say so?" Paired with an engine it becomes a search: evaluate
a batch of positions, keep the ones decided clearly, and ask which of those can
be expressed as goals at all. That is how the medium page was written.

## Grading bands

Verdict is a function of equity loss against the best move:

| Equity loss | Verdict |
|---|---|
| 0 | best |
| < 0.020 | negligible |
| 0.020 – 0.040 | doubtful |
| 0.040 – 0.080 | error |
| > 0.080 | blunder |

## Credits

`static/m.js` is a small hyperscript helper written for
[SQLZoo](https://sqlzoo.net) and reused here; `lib/kit.mjs` reimplements the same
`$m(...)` call signature with a server-side backend so pages can render to a
string at build time and to live DOM in the browser.
