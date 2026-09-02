import { page, prose, question, makes, shots, escapes } from '../lib/kit.mjs';
import { board } from '../lib/board.mjs';

// Every question on this page starts from the same place.
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

export default page('Build if you can', [

  prose`**If the roll makes a point, make it.** A point is permanent. The point
    you make now is still working for you twenty rolls from now.`,

  question({
    id: 'open-31',
    board: opening,
    dice: [3, 1],
    ask: prose`How do you play 3-1?`,
    goals: [
      makes(5, prose`The best point on the board. It guards your home board, and
        it sits exactly where his back checkers want to land.`),
      shots(0, prose`And it is free. You finish with no blot.`),
    ],
    traps: {
      '24/23 13/10': prose`A reasonable shape with almost any other roll. Here it
        turns down the best point on the board.`,
      '24/20': prose`The four point anchor is worth having, but not at this
        price — and one checker there is not an anchor.`,
      '13/9': prose`Aims at the five point. You were offered it.`,
    },
    otherwise: prose`The roll makes the best point on the board, for free.
      Nothing beats that.`,
  }),

  question({
    id: 'open-42',
    board: opening,
    dice: [4, 2],
    ask: prose`And 4-2?`,
    goals: [
      makes(4, prose`Second only to the five point. A home board point, and
        safe.`),
      shots(0),
    ],
    traps: {
      '13/11 13/9': prose`Aims at the four point. It is yours right now if you
        take it.`,
      '24/20 13/11': prose`Starts the four point anchor. Making the four point
        outright is better than starting to.`,
    },
  }),

  question({
    id: 'open-61',
    board: opening,
    dice: [6, 1],
    ask: prose`And 6-1?`,
    goals: [
      makes(7, prose`The bar point. Eight, seven and six — three points in a row.
        His back checkers have to jump all three.`),
      shots(0),
    ],
    traps: {
      '24/23 13/7': prose`The right first half, then you stopped. The bar point
        wants both checkers.`,
      '24/23 24/18': prose`Two blots in front of his home board, and the bar
        point goes begging.`,
    },
  }),

  question({
    id: 'open-53',
    board: opening,
    dice: [5, 3],
    ask: prose`How about 5-3?`,
    goals: [
      makes(3, prose`The three point is deep, and it buries two checkers. Make it
        anyway. A point in hand beats a point in prospect.`),
      shots(0),
    ],
    traps: {
      '24/21 13/8': prose`The closest thing to a real alternative on this page.
        Still second.`,
      '13/10 13/8': prose`Safe, and you have made nothing. He may make that point
        next roll.`,
      '13/5': prose`Eleven pips down the board, alone, on the point he most wants
        to hit.`,
    },
  }),

  question({
    id: '45-34',
    board: board`
xo..o.||o....x
x...o.||o....x
x...o.||o.....
......||o.....
......||o.....
--------------
......||x.....
o...x.||x.....
o...x.||x.....
o...x.||x.....
o..xx.||x...oo`,
    dice: [3, 4],
    ask: prose`This second roll is great`,
    goals: [
      makes(5,'This is the golden point - good job'),
    ],
    traps: {
    },
  }),
/*
  question({
    id: 'open-65',
    board: opening,
    dice: [6, 5],
    ask: prose`And 6-5?`,
    goals: [
      escapes(24, prose`Lover's leap. Your back checkers are the problem in every
        game — this runs one of them the whole way to safety.`),
      shots(0, prose`It lands on a point you own. No risk.`),
    ],
    traps: {
      '24/18 13/8': prose`Leaves the checker alone in front of his home board,
        five pips short of safety.`,
      '13/8 13/7': prose`Safe, and both back checkers are exactly where they
        were.`,
    },
  }),
*/
  prose`The other ten rolls are on the next page.`,
]);
