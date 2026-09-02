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

export default page('Opening rolls everyone agrees on', [

  prose`Five opening rolls have one right answer. Not a preferred answer or a
    modern answer — one answer, played the same way by every strong player and
    every bot, and the same at every match score. Learn these five and you own a
    third of the opening outright.`,

  prose`Four of them follow the simplest rule in the game: **if the roll makes a
    point, make it.** A point is permanent. Builders and splits are hopeful. The
    point you make on the first roll is still working for you twenty rolls from
    now.`,

  question({
    id: 'open-31',
    board: opening,
    dice: [3, 1],
    ask: prose`How do you play 3-1?`,
    goals: [
      makes(5, prose`The five point is the most valuable point on the board. It
        is the front door of your home board and the anchor of any prime you
        build later. It also sits exactly where his back checkers want to land.`),
      shots(0, prose`And it costs nothing. Both checkers come from stacks you
        were happy to unstack, and you finish with no blot anywhere.`),
    ],
    traps: {
      '24/23 13/10': prose`Splitting and bringing down a builder is a perfectly
        sensible shape — with almost any other roll. Here it declines the best
        point in the game in order to hope for it later.`,
      '24/20': prose`The four point anchor is worth having, but not at this
        price, and one checker on the twenty point is not an anchor yet.`,
      '13/9': prose`A useful builder on the nine point, bearing on both the
        five and the four. But you were offered the five point itself, already
        made and already safe.`,
    },
    otherwise: prose`Whatever else you found, the roll makes the best point on
      the board with no downside. Nothing outranks that.`,
  }),

  prose`The next two are the same idea with different points, and they are worth
    doing in a row so the pattern sets.`,

  question({
    id: 'open-42',
    board: opening,
    dice: [4, 2],
    ask: prose`And 4-2?`,
    goals: [
      makes(4, prose`Second only to the five point. It blocks his sixes from the
        bar, it is a home board point, and again it is safe.`),
      shots(0),
    ],
    traps: {
      '13/11 13/9': prose`Builders aimed at the four and five points — but the
        four point is available now, for free.`,
      '24/20 13/11': prose`Splitting to the four point does have a point: if you
        cover next roll you have an advanced anchor. But making the four point
        outright is better than starting to.`,
    },
  }),

  question({
    id: 'open-61',
    board: opening,
    dice: [6, 1],
    ask: prose`And 6-1?`,
    goals: [
      makes(7, prose`The bar point. It gives you the eight, seven and six —
        three consecutive points, the beginning of a prime. His checkers on your
        one point now have to jump all three to get home.`),
      shots(0),
    ],
    traps: {
      '24/23 13/7': prose`You have found the right first half and then declined
        to finish it. The bar point wants both checkers.`,
      '24/23 24/18': prose`Running to the bar point and splitting behind it
        leaves two blots in front of his whole home board, and gives up the roll
        that makes the point outright.`,
    },
  }),

  prose`The fourth is the rule at its strongest, because here the point on
    offer is not a good one. Make it anyway.`,

  question({
    id: 'open-53',
    board: opening,
    dice: [5, 3],
    ask: prose`How about 5-3?`,
    goals: [
      makes(3, prose`The three point is deep — it blocks less than the five or
        the four, and it buries two checkers you might have wanted higher up.
        Make it anyway. A point in hand beats a point in prospect.`),
      shots(0),
    ],
    traps: {
      '24/21 13/8': prose`This is the respectable alternative, and it is much
        closer than anything else on this page. Splitting to the three point and
        filling the eight is a decent structure. It is still second best.`,
      '13/10 13/8': prose`Two good builders and a safe position. But you have
        made nothing, and next roll he may well make the point you were aiming at.`,
      '13/5': prose`One checker eleven pips down the board, sitting alone on the
        best point in the game where he would love to hit it.`,
    },
  }),

  prose`The fifth roll makes no point at all, and that brings in the second
    rule: **when you cannot make a point, get a back checker out.**`,

  question({
    id: 'open-65',
    board: opening,
    dice: [6, 5],
    ask: prose`And 6-5?`,
    goals: [
      escapes(24, prose`Lover's leap. Your back checkers are the problem in every
        backgammon game, and this roll solves half of it in one move: the runner
        goes all the way from the far corner to the safety of your midpoint.`),
      shots(0, prose`It lands on a point you already own, so you take no risk to
        do it.`),
    ],
    traps: {
      '24/18 13/8': prose`Running to the bar point looks constructive, but it
        leaves the checker alone in front of his whole home board, and it stops
        five pips short of safety.`,
      '13/8 13/7': prose`Safe, and builds nothing you could not build later,
        while both back checkers stay exactly where they were.`,
    },
  }),

  prose`Five rolls, two rules, nothing to remember beyond that. Play them
    without stopping to think and you have taken a third of the opening off the
    list of things you can get wrong. The other ten rolls are on the next page.`,
]);
