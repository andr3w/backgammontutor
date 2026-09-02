# Backgammon Tutor

A web app that presents the user with a backgammon position and a dice roll, asks them
to play it, and grades their answer against engine analysis with an explanation of what
they got right or wrong.

We might also have multiple choice options "On this board is white playing
a) blitz
b) prime
c) back game
d) running game"

## Site content

- Most pages of the site contains a themed tutorial - there are a number of questions posed to the user
- Every incorrect user response has instructive feedback - not just right or wrong but also why that
  option is wrong
- Users are not constrained by the interface they should be able to select their answer, see the feedback
  but then also explore the other options.
- There is no attempt to constrain the user - no barrier to starting with advanced pages before easy ones
  are completed.

## Stack

Assume unless told otherwise:

- Python 3 (Debian stable's version), flask
- MariaDB - for storing question performance and user performance

### Grading bands

Verdict is a function of the user's equity loss against best:

| Equity loss | Verdict |
|---|---|
| 0 (they found the best move) | best |
| < 0.020 | negligible — effectively correct, close call |
| 0.020 – 0.040 | doubtful |
| 0.040 – 0.080 | error |
| > 0.080 | blunder |

Put these thresholds in config, not scattered through the code. They are conventional
but adjustable, and the "negligible" band in particular may want tuning once there is
real usage.

If the user plays a legal move that is not in the stored candidate list, the correct
response is to say the position needs re-analysis and not to guess. Log it.

## Cube decisions

Include these. Cube errors cost
more equity in real play than checker errors and the interaction is simpler — four
answers (no double / double-take / double-pass / too good) rather than twenty moves.
gnubg supplies cubeful equities for no-double, double-take and double-pass, so grading
is the same arithmetic against the same bands.

