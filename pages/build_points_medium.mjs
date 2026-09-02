import { page, prose, question, made, clear, shots, hits, escapes } from '../lib/kit.mjs';
import { board } from '../lib/board.mjs';

export default page('Build points (medium)', [

  prose`**Build if you can — unless something is worth more.** A [[blot|checker of
    his left alone]], a [[back checkers|checker of yours that wants to get
    out]], a roll with nothing [[safe]] about it.`,

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
      made(5, prose`The [[golden point]], made right on top of him.`,
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
      hits(20, prose`Your [[back checkers]] walk onto him and he is on the [[bar]].`,
        prose`There is a [[blot|checker of his alone]] on the 20-point, and you can reach it.`),
      made(4, prose`Two more twos make the 4-point while he is not looking.`,
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
......||o.....
--------------
......||......
o.....||x.....
o...x.||x.....
o..xx.||x....o
o..xx.||x....o`,
    dice: [2, 1],
    ask: prose`The smallest roll in the game.`,
    goals: [
      hits(21, prose`One checker, three pips, and he is on the [[bar]]. There
        was a point you could have made instead. It was not worth as much.`,
        prose`He has a [[blot]] on the 21-point. Send it home.`),
    ],
    antigoals: [
      made(7, prose`It is tempting to make the [[bar point]], and with almost
        any other roll you should. Here it costs you something better.`),
    ],
  }),

  question({
    id: 'med-outfield',
    board: board`
x...oo||o...xx
x...o.||o.....
x...o.||o.....
x.....||o.....
......||o.....
--------------
......||......
o.....||x.....
o...x.||x.....
ox..x.||x....o
ox..x.||x....o`,
    dice: [4, 1],
    ask: prose`He has left a checker in his own outfield.`,
    goals: [
      hits(18, prose`Your back checker steps up and knocks him off. He loses the
        roll, and yours is out of the corner.`,
        prose`There is a [[blot]] on the 18-point.`),
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
......||o.....
--------------
......||......
o.....||x.....
o...x.||x.....
o..xx.||x....o
o..xx.||x....o`,
    dice: [4, 3],
    ask: prose`Both of his stragglers are alone.`,
    goals: [
      hits(21, prose`You hit on the 21-point,`,
        prose`Two of his [[blot|blots]] are standing alone and you can reach both.`),
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
      hits(7, prose`[[hit|Hit]] anyway. He loses his roll, and a checker on the [[bar]] is
        worth more than a tidy position.`,
        prose`He is sitting on your bar point and you left him there.`),
      shots(1, prose`You are open on the [[bar point]] now. One checker of his gets a
        [[return shot]], and that is the price.`,
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
    ask: prose`Your two [[back checkers]] are apart.`,
    goals: [
      made(20, prose`Together on the 20-point — an [[advanced anchor]]. Safe there, and squarely
        in the way of everything he wants to bring home.`,
        prose`Your two back checkers can meet on the same point, giving you an [[anchor]].`),
    ],
  }),

  question({
    id: 'med-escape',
    board: board`
x...o.||o....x
x...o.||o....x
x...o.||o.....
......||o.....
......||o.....
--------------
......||......
o.....||x.....
o.....||x.....
ox.xx.||x....o
ox.xx.||xo...o`,
    dice: [6, 5],
    ask: prose`6-5, and a long way to go.`,
    goals: [
      escapes(24, prose`One checker [[run|runs]] the whole way to your own [[mid point]].
        The hardest job in the game, done in a single roll.`,
        prose`A [[back checkers|back checker]] can [[escape]] with this roll.`),
      shots(1, prose`It leaves the other one a [[blot]] for a roll. Take that trade.`,
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
      made(4, prose`One checker comes all the way down and covers the blot on
        your 4-point.`,
        prose`You have a [[blot]] on your 4-point.`),
      shots(0, prose`Nothing of yours can be [[hit]].`,
        prose`You left a [[blot]] where he can reach it.`),
    ],
  }),

  prose`Building is the default. Look for a reason not to.`,
], { next: ['blitz', 'prime'] });
