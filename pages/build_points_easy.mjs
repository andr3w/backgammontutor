import { page, prose, question, made, clear, shots, hits, escapes } from '../lib/kit.mjs';
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

export default page('Build points (easy)', [

  prose`**If the roll makes a point, make it.** A point is permanent. The point
    you make now is still working for you twenty rolls from now.`,

  question({
    id: 'open-31',
    board: opening,
    dice: [3, 1],
    ask: prose`How do you play 3-1?`,
    goals: [
      made(5, prose`You've made the 5-point.
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
      made(4, prose`You've made home board point.`, `You have a chance to make a point in your home board.`),
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
      made(7, prose`You made the bar point. You are starting to trap your opponent's back pieces.`,
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
      made(3, prose`You built on the three point, even though it's not the
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
      made(5,'You built on the 5 point, that is the best point on the whole board',
              `You didn't make the 5 point when you could have.`),
    ],
    traps: {
    },
  }),

  question({
    id: 'hit-42',
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
o...x.||x.o..o`,
    dice: [4, 2],
    ask: prose`He has left one checker on your 4-point.`,
    goals: [
      made(4, prose`You made the 4-point and sent him back to the beginning.
        Two jobs in one roll.`,
        prose`There is a point to be made here, and a checker sitting on it.`),
      shots(0),
    ],
  }),

  question({
    id: 'double-33',
    board: board`
x...o.||o.o..x
x...o.||o.o..x
x.....||o.....
x.....||o.....
x.....||o.....
--------------
......||......
o.....||x.....
o.....||x.....
o...x.||x.x..o
o...x.||x.x..o`,
    dice: [3, 3],
    ask: prose`Doubles give you four moves.`,
    goals: [
      made(5, prose`The 5-point.`,
        prose`Four threes and you did not make the 5-point.`),
      made(3, prose`And the 3-point as well — two points from one roll.`,
        prose`You had enough threes to make a second point.`),
    ],
  }),

  question({
    id: 'double-55',
    board: board`
x...o.||o.o..x
x...o.||o.o..x
x.....||o.....
x.....||o.....
x.....||......
--------------
o.....||x.....
o.....||x.....
o...x.||x.....
o...x.||x....o
o...x.||x....o`,
    dice: [5, 5],
    ask: prose`Nothing lands on the 8-point that you want to keep there.`,
    goals: [
      made(3, prose`Two checkers travel the whole way from the 13-point to the
        3-point. A long way to go to build, and still worth it.`,
        prose`Four fives will build a point if you send the same two checkers
        twice.`),
      made(8, prose`And the 8-point is still yours.`,
        prose`You built the 3-point by taking the 8-point apart. Keep what you
        already own.`),
    ],
  }),

  question({
    id: 'double-44',
    board: board`
x...oo||o....x
x...oo||o....x
x.....||o.....
x.....||o.....
x.....||o.....
--------------
......||x.....
o.....||x.....
o...x.||x.....
o...x.||x....o
o...x.||x....o`,
    dice: [4, 4],
    ask: prose`Your two back checkers have four fours between them.`,
    goals: [
      made(20, prose`A point of your own inside his home board. Your back
        checkers are safe there, and they can wait as long as they like.`,
        prose`Your back checkers can reach a point of their own.`),
      made(9, prose`The 9-point too, and every checker is safe.`,
        prose`You had two fours left over for a second point.`),
    ],
  }),

  question({
    id: 'sixfive-5pt',
    board: board`
x...oo||o....x
x...oo||o....x
x.....||o.....
......||o.....
......||o.....
--------------
......||x.....
o.....||x.....
o...x.||x.....
o...x.||x....o
oxx.x.||x....o`,
    dice: [6, 5],
    ask: prose`Two checkers are already on their way.`,
    goals: [
      made(5, prose`The 11-point and the 10-point come together on the
        5-point. That is what those two checkers were for.`,
        prose`Look at the 11-point and the 10-point. A six and a five bring
        them to the same place.`),
      shots(0),
    ],
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
  prose`Building is not always the answer. That is the next tutorial.`,
], { next: 'build_points_medium' });
