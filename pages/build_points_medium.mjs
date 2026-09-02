import { page, prose, question, makes, shots, hits, keeps, escapes } from '../lib/kit.mjs';
import { board } from '../lib/board.mjs';

export default page('Build points (medium)', [

  prose`**Build if you can — unless something is worth more.** A checker of his
    left alone, a checker of yours that wants to get out, a roll with nothing
    safe about it.`,

  question({
    id: 'med-head',
    board: board`
x...o.||o....x
x...o.||o....x
x...o.||o.....
x.....||o.....
x.....||o.....
--------------
o.....||x.....
o.....||x.....
o...x.||x.....
o...x.||x.....
o...x.||xo...o`,
    dice: [3, 1],
    ask: prose`He has crept out to your 5-point.`,
    goals: [
      makes(5, prose`The golden point, made right on top of him.`,
        prose`The 5-point is there for the taking, as it always is.`),
      hits(5, prose`He goes back to the far corner and starts again.`,
        prose`Do not let him sit there.`),
    ],
  }),

  question({
    id: 'med-hit-build',
    board: board`
x...o.||ooo..x
x...o.||o....x
x.....||o.....
x.....||o.....
x.....||o.....
--------------
......||x.....
o.....||x.....
o...x.||x.....
o...x.||x....o
o...x.||x....o`,
    dice: [2, 2],
    ask: prose`Four twos, and two of his checkers standing alone.`,
    goals: [
      hits(20, prose`Your back checkers walk onto him and he is on the bar.`,
        prose`There is a checker of his alone on the 20-point, and you can reach it.`),
      makes(4, prose`Two more twos make the 4-point while he is not looking.`,
        prose`You had four twos. Hitting used only two of them.`),
    ],
  }),

  question({
    id: 'med-small-hit',
    board: board`
x...o.||ooo..x
x...o.||o....x
x.....||o.....
x.....||o.....
x.....||o.....
--------------
......||x.....
o.....||x.....
o...x.||x.....
o...x.||x....o
o...x.||x....o`,
    dice: [2, 1],
    ask: prose`The smallest roll in the game.`,
    goals: [
      hits(21, prose`One checker, three pips, and he is on the bar. Nothing you
        could build with 2-1 is worth as much.`,
        prose`He has a checker alone on the 21-point. Send it home.`),
    ],
  }),

  question({
    id: 'med-barpoint',
    board: board`
x...o.||o....x
x...o.||o....x
x...o.||o.....
x.....||o.....
x.....||o.....
--------------
......||x.....
o.....||x.....
o.....||x.....
o...x.||x....o
o..xxo||x....o`,
    dice: [5, 1],
    ask: prose`He has stepped onto your bar point.`,
    goals: [
      hits(7, prose`Straight down from the 13-point. He goes back, and the bar
        point is yours to cover next roll.`,
        prose`There is a lone checker of his on your bar point.`),
      keeps(8, prose`And the 8-point is untouched.`,
        prose`You hit, but you pulled the 8-point apart to do it.`),
    ],
  }),

  question({
    id: 'med-run-hit',
    board: board`
x..oo.||o....x
x...o.||o....x
x...o.||o.....
x.....||o.....
......||o.....
--------------
......||......
o.....||x.....
o...x.||x.....
o...x.||x....o
ox.xx.||x....o`,
    dice: [5, 3],
    ask: prose`He has left a checker out in the open.`,
    goals: [
      hits(16, prose`Out of the corner in one move, and he goes to the bar.
        That checker of yours had nowhere to go; now it is halfway home.`,
        prose`There is a checker of his alone on the 16-point.`),
    ],
  }),

  question({
    id: 'med-double-hit',
    board: board`
x...o.||ooo..x
x...o.||o....x
x.....||o.....
x.....||o.....
x.....||o.....
--------------
......||x.....
o.....||x.....
o...x.||x.....
o...x.||x....o
o...x.||x....o`,
    dice: [4, 3],
    ask: prose`Both of his stragglers are alone.`,
    goals: [
      hits(21, prose`You hit on the 21-point,`,
        prose`Two of his checkers are standing alone and you can reach both.`),
      hits(20, prose`and on the 20-point as well. Two on the bar, and a board of
        his own in the way when they come back.`,
        prose`One hit is good. Look again — there are two.`),
    ],
  }),

  question({
    id: 'med-hit-open',
    board: board`
x...o.||o....x
x...o.||o....x
x...o.||o.....
x.....||o.....
x.....||o.....
--------------
......||x.....
o.....||x.....
o.....||x.....
o...x.||x....o
o..xxo||x....o`,
    dice: [6, 5],
    ask: prose`He is on your bar point again, and nothing reaches him safely.`,
    goals: [
      hits(7, prose`Hit anyway. He loses his roll, and a checker on the bar is
        worth more than a tidy position.`,
        prose`He is sitting on your bar point and you left him there.`),
      shots(1, prose`You are open on the bar point now. One checker of his can
        answer, and that is the price.`,
        prose`Hitting is right; the other five is in the wrong place.`),
    ],
  }),

  question({
    id: 'med-anchor',
    board: board`
x...o.||o...xx
x...o.||o.....
x...o.||o.....
x.....||o.....
x.....||o.....
--------------
o.....||x.....
o.....||x.....
o...x.||x.....
o...x.||x....o
o...x.||x....o`,
    dice: [4, 3],
    ask: prose`Your two back checkers are apart.`,
    goals: [
      makes(20, prose`Together on the 20-point. Safe there, and squarely in the
        way of everything he wants to bring home.`,
        prose`Your two back checkers can meet on the same point.`),
    ],
  }),

  question({
    id: 'med-escape',
    board: board`
x.o.o.||o....x
x...o.||o....x
x...o.||o.....
x.....||o.....
......||o.....
--------------
......||......
o...x.||x.....
o...x.||x.....
o...x.||x....o
o.x.x.||x....o`,
    dice: [6, 5],
    ask: prose`6-5, and a long way to go.`,
    goals: [
      escapes(24, prose`One checker runs the whole way to your own 13-point.
        The hardest job in the game, done in a single roll.`,
        prose`A back checker can get right out with this roll.`),
      shots(1, prose`It leaves the other one alone for a roll. Take that trade.`,
        prose`Run one of them right out. Do not fiddle about.`),
    ],
  }),

  question({
    id: 'med-safe',
    board: board`
x...o.||ox.o..
x...o.||ox....
x...o.||o.....
x.....||o.....
x.....||......
--------------
o.....||......
o.....||x.....
o...x.||x.....
o...x.||x....o
o...x.||x.x..o`,
    dice: [5, 4],
    ask: prose`Nothing of his is within reach.`,
    goals: [
      makes(4, prose`One checker comes all the way down and covers the blot on
        your 4-point.`,
        prose`You have a checker standing alone on your 4-point.`),
      shots(0, prose`Nothing of yours can be touched.`,
        prose`You left something where he can reach it.`),
    ],
  }),

  prose`Building is the default. Look for a reason not to.`,
]);
