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
      makes(5, prose`You've made the 5-point.
                     This is the best point on the board - so good it's called the "golden point".`,
               prose`Don't throw away a chance to make the 5-point.`),
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
      makes(4, prose`You've made home board point.`, `You have a chance to make a point in your home board.`),
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
      makes(7, prose`You made the bar point. You are starting to trap your opponent's back pieces.`,
               prose`You have a chance to build on the bar point (the 7-point). You should do that.`),
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
      makes(3, prose`You built on the three point, even though it's not the
               best place to build this is still the best move for this opening throw.`,
               prose`You have a chance to build inside your home board - you must do that.`),
      shots(0),
    ],
    traps: {
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
      makes(5,'You built on the 5 point, that is the best point on the whole board',
              `You didn't make the 5 point when you could have.`),
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
