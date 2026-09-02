// The glossary.
//
// The definitions are ours, written for a student rather than a player: one
// plain sentence, and no term inside it that is not itself in the list. That
// is the difference worth having. The USBGF's entry for builder -- "a checker
// in range of a vacant or slotted point" -- is correct and no use at all to
// someone who does not yet know vacant, slotted or point.
//
// They are also ours for a duller reason. The good glossaries on the web are
// under ordinary copyright (usbgf.org carries a bare (c) notice and offers no
// licence), and Wiktionary's is CC BY-SA, whose share-alike would attach to
// this page. Every entry cites where the term can be checked instead, which
// costs nothing and is worth more than a copied sentence.
//
// `[[term]]` inside a definition links to another entry. Use it freely -- the
// point of a glossary the student can browse is that one word leads to the
// next.

export const SOURCES = {
  usbgf: { name: 'USBGF', title: 'US Backgammon Federation glossary',
           url: 'https://usbgf.org/backgammon-glossary/' },
  gnubg: { name: 'GNU Backgammon', title: 'GNU Backgammon',
           url: 'https://www.gnu.org/software/gnubg/' },
};

const g = (term, def, opts = {}) => ({ term, def, ...opts });

export const GLOSSARY = [

  // --- the board ---------------------------------------------------------
  g('checker', `One of the fifteen pieces you move. Some people call them
    stones or men.`, { src: 'usbgf' }),
  g('point', `One of the twenty-four triangles. You own a point when you have
    two or more [[checker|checkers]] on it, and then your opponent cannot land
    there.`, { src: 'usbgf' }),
  g('made point', `A [[point]] you hold with two or more checkers. He cannot
    land on it, so it is both a home for your checkers and a wall in his
    way.`, { src: 'usbgf', see: ['block', 'prime'] }),
  g('open point', `A point you are allowed to land on: empty, yours, or holding
    just one enemy checker — a [[blot]] you would [[hit]].`, { src: 'usbgf' }),
  g('blot', `A single checker alone on a point. He can [[hit]] it and send it
    to the [[bar]].`, { src: 'usbgf' }),
  g('spare', `A checker on a point you already hold, beyond the two that hold
    it. Spares are the checkers you are free to move.`,
    { src: 'usbgf', see: ['builder', 'timing'] }),
  g('stack', `Too many checkers piled on one point. They cannot all be doing
    useful work, and they are not where the next point wants to be made.`,
    { src: 'usbgf', see: ['spare', 'builder'] }),
  g('bar', `The ridge down the middle of the board. A checker that has been
    [[hit]] waits there until it can [[enter]] again.`, { src: 'usbgf' }),
  g('home board', `Your last six points, 1 to 6. Every one of your checkers has
    to reach it before you may [[bear off]].`,
    { src: 'usbgf', see: ['outer board', 'board strength'] }),
  g('outer board', `The quadrant next to your [[home board]], points 7 to
    12.`, { src: 'usbgf' }),
  g('outfield', `The middle of the board, away from either [[home board]] —
    roughly the 7 to 18 points.`, { src: 'usbgf' }),
  g('quadrant', `One of the four sixes of the board. Counting how many times a
    checker must cross from one to the next is a quick way to compare two
    positions late in a game.`, { src: 'usbgf', see: ['crossover'] }),
  g('mid point', `Your 13 point, where five of your checkers start.`,
    { src: 'usbgf' }),
  g('bar point', `Your 7 point, the one beside the [[bar]]. Made, it joins your
    8 and 6 points into a wall of three.`, { src: 'usbgf', see: ['prime'] }),
  g('golden point', `The 5 point. The best point to make early: it guards your
    [[home board]] and it stands exactly where his [[back checkers]] want to
    go.`, { src: 'usbgf' }),
  g('ace point', `The 1 point, the deepest in your [[home board]]. Checkers put
    there early are usually wasted.`, { src: 'usbgf', see: ['bury'] }),
  g('bury', `To move a checker so deep into your [[home board]] that it can no
    longer help make a point or [[hit]] anything.`,
    { src: 'usbgf', see: ['ace point', 'wastage'] }),
  g('wastage', `Pips spent on checkers that will do no more work — buried deep,
    or stacked where they cannot be used.`, { src: 'usbgf', see: ['bury'] }),
  g('anchor', `A [[point]] you hold in or near his [[home board]]. It gives
    your [[back checkers]] somewhere safe to stand and something to wait
    for.`, { src: 'usbgf', see: ['advanced anchor', 'deep anchor'] }),
  g('advanced anchor', `An [[anchor]] on his 4, 5 or [[bar point]] — far enough
    forward to be useful in a race as well as safe.`, { src: 'usbgf' }),
  g('deep anchor', `An [[anchor]] on his 1, 2 or 3 point. Safe, but a long way
    from home and in nobody's way.`, { src: 'usbgf', see: ['back game'] }),
  g('back checkers', `The two checkers that start furthest from home, on your
    24 point. Getting them out is the hardest job in the game.`,
    { src: 'usbgf', see: ['escape', 'anchor'] }),
  g('straggler', `A checker left far behind the rest of your army.`,
    { src: 'usbgf' }),

  // --- moving ------------------------------------------------------------
  g('pip', `One step of a checker's journey. Also one of the spots on a
    die.`, { src: 'usbgf' }),
  g('pip count', `How many [[pip|pips]] you need to bring every checker home
    and off. The lower count is ahead in the [[race]].`, { src: 'usbgf' }),
  g('crossover', `A checker moving from one [[quadrant]] into the next.`,
    { src: 'usbgf' }),
  g('enter', `To bring a checker from the [[bar]] back onto the board, into his
    [[home board]]. You may do nothing else until you have.`,
    { src: 'usbgf', see: ['dance'] }),
  g('dance', `To sit on the [[bar]] unable to [[enter]], because he holds every
    point you could come in on. Also called fanning.`,
    { src: 'usbgf', see: ['close out'] }),
  g('run', `To move a [[back checkers|back checker]] a long way towards home in
    one go.`, { src: 'usbgf', see: ['escape', 'running game'] }),
  g('escape', `To get a [[back checkers|back checker]] out past his
    blockade.`, { src: 'usbgf' }),
  g('split', `To move one of your two [[back checkers]], leaving each of them
    alone. It aims at an [[anchor]] and it accepts being [[hit]].`,
    { src: 'usbgf' }),
  g('slot', `To put a lone checker on a point you mean to make next roll,
    inviting a [[hit]] for the chance to [[cover]] it.`, { src: 'usbgf' }),
  g('cover', `To add a second checker to a [[blot]], turning it into a [[made
    point]].`, { src: 'usbgf' }),
  g('hit', `To land on his [[blot]] and send it to the [[bar]]. He loses the
    ground that checker had made and must [[enter]] before doing anything
    else.`, { src: 'usbgf' }),
  g('break a point', `To move a checker off a [[point]] you hold, leaving fewer
    than two behind.`, { src: 'usbgf', see: ['clear a point'] }),
  g('clear a point', `To move every checker off a point. Different from
    [[break a point|breaking]] it: a point with one checker left on it is
    neither held nor cleared.`, { src: 'usbgf' }),
  g('bear in', `To bring your last checkers into your [[home board]], ready to
    take off.`, { src: 'usbgf' }),
  g('bear off', `To take checkers off the board. You may start once all fifteen
    are in your [[home board]]. First to take all fifteen off wins.`,
    { src: 'usbgf' }),
  g('safe', `Out of reach: no [[blot]] of yours where he can get at it.`,
    { src: 'usbgf', see: ['shot'] }),

  // --- shots -------------------------------------------------------------
  g('shot', `A chance to [[hit]].`, { src: 'usbgf' }),
  g('direct shot', `A [[blot]] six [[pip|pips]] away or fewer, so a single die
    reaches it. The closer it is the more numbers hit.`, { src: 'usbgf' }),
  g('indirect shot', `A blot more than six pips away, so hitting needs both
    dice. Much less likely than a [[direct shot]].`, { src: 'usbgf' }),
  g('return shot', `The [[shot]] he gets at you immediately after you have
    [[hit]] him.`, { src: 'usbgf' }),
  g('double hit', `Hitting two of his [[blot|blots]] with one roll. He then has
    two checkers to bring back in.`, { src: 'usbgf' }),
  g('pick and pass', `To [[hit]] with one die and carry the same checker on to
    safety with the other.`, { src: 'usbgf' }),
  g('point on a blot', `To make a [[point]] on the very square his [[blot]] was
    standing on, hitting it as you do. Two jobs in one roll.`,
    { src: 'usbgf' }),
  g('duplication', `Arranging your checkers so that the same number he wants
    for one job is the number he needs for another. He cannot do both.`,
    { src: 'usbgf' }),
  g('diversification', `Arranging your checkers so that as many of your numbers
    as possible have something useful to do next roll.`, { src: 'usbgf' }),

  // --- structure ---------------------------------------------------------
  g('builder', `A [[spare]] checker close enough to a point to help make it
    next roll.`, { src: 'usbgf', see: ['slot', 'stack'] }),
  g('block', `A [[made point]] standing in the way of his checkers.`,
    { src: 'usbgf' }),
  g('prime', `Made points in a row. Four or five in a row is very hard to jump;
    each one you add makes his escape harder.`,
    { src: 'usbgf', see: ['full prime', 'broken prime'] }),
  g('full prime', `Six [[made point|made points]] in a row. Nothing can jump
    it — a checker behind a full prime cannot move past at all until you break
    it.`, { src: 'usbgf' }),
  g('broken prime', `A run of blocking points with a gap in it. The gap is the
    number he is hoping to roll.`, { src: 'usbgf' }),
  g('close a point', `To make one of the six points in your [[home
    board]].`, { src: 'usbgf', see: ['close out', 'board strength'] }),
  g('close out', `All six of your [[home board]] points made while he has a
    checker on the [[bar]]. He cannot move at all until you open one.`,
    { src: 'usbgf', see: ['blitz'] }),
  g('board strength', `How many points of your [[home board]] you hold. It
    decides how much a [[hit]] is worth: hitting into a strong board may cost
    him several rolls.`, { src: 'usbgf' }),
  g('timing', `Having moves to spare. If every checker is already as far
    forward as it can safely go, you are forced to [[break a point|break]]
    something.`, { src: 'usbgf', see: ['spare'] }),

  // --- plans -------------------------------------------------------------
  g('race', `The contest to get all your checkers round and off first. Once
    neither side can [[hit]] the other, the [[pip count]] decides it.`,
    { src: 'usbgf' }),
  g('running game', `A plan of simply running for home, taken when you are
    ahead in the [[race]].`, { src: 'usbgf' }),
  g('holding game', `Holding an [[anchor]] while he brings his checkers home,
    waiting for the [[shot]] he must eventually leave.`, { src: 'usbgf' }),
  g('back game', `Holding two [[deep anchor|deep anchors]] and playing for a
    late [[hit]]. Hard to play and easy to get wrong.`, { src: 'usbgf' }),
  g('blitz', `Attacking his [[blot|blots]] in your [[home board]], hitting
    again and again to keep him on the [[bar]] while you [[close a point|close
    points]] behind him.`, { src: 'usbgf', see: ['close out'] }),
  g('priming game', `Building a [[prime]] in front of his back checkers and
    walking it home.`, { src: 'usbgf' }),
  g('ace-point game', `A [[back game]] played from his [[ace point]] alone. The
    last hope of a lost position.`, { src: 'usbgf' }),

  // --- stakes ------------------------------------------------------------
  g('gammon', `Winning before he has borne off a single checker. Worth double.`,
    { src: 'usbgf' }),
  g('backgammon', `Winning while he still has a checker on the [[bar]] or in
    your [[home board]]. Worth triple, and rare.`, { src: 'usbgf' }),
  g('doubling cube', `The die marked 2, 4, 8, 16, 32, 64, used to raise the
    stakes.`, { src: 'usbgf', see: ['double', 'take', 'drop'] }),
  g('double', `To offer to play on for twice the stake. He must [[take]] or
    [[drop]] before he rolls.`, { src: 'usbgf' }),
  g('take', `To accept a [[double]] and play on for twice the stake, with the
    [[doubling cube]] now on your side.`, { src: 'usbgf' }),
  g('drop', `To refuse a [[double]] and concede the current stake rather than
    play on.`, { src: 'usbgf' }),
  g('beaver', `In money play, to [[take]] a [[double]] and immediately turn the
    cube again, keeping it.`, { src: 'usbgf' }),
  g('too good to double', `So far ahead that offering the [[doubling cube]]
    would be a mistake — he would [[drop]], when playing on is likely to win
    you a [[gammon]].`, { src: 'usbgf' }),
  g('lose your market', `To get so far ahead between one turn and the next that
    the [[double]] you did not offer would now be dropped.`,
    { src: 'usbgf' }),
  g('crawford game', `In match play, the single game after one player reaches
    one point from victory, played without the [[doubling cube]].`,
    { src: 'usbgf' }),
  g('jacoby rule', `In money play, [[gammon|gammons]] and
    [[backgammon|backgammons]] count only if the [[doubling cube]] has been
    turned.`, { src: 'usbgf' }),
  g('match play', `A series of games played to a target score.`,
    { src: 'usbgf' }),
  g('money game', `Games played for a stake each, rather than to a target
    score.`, { src: 'usbgf' }),

  // --- what the bots say -------------------------------------------------
  g('equity', `What a position is worth, counted in points, taking into account
    how often it wins, loses, and wins or loses a [[gammon]].`,
    { src: 'usbgf' }),
  g('ply', `One level of looking ahead. At 0-ply the engine judges the position
    in front of it; at 2-ply it considers your move, all twenty-one of his
    possible rolls, and his best reply to each.`, { src: 'gnubg' }),
  g('rollout', `Playing a position out to the end many thousands of times and
    averaging the result. Slower than a [[ply|ply-based]] guess, and more
    trustworthy.`, { src: 'gnubg' }),
  g('error rate', `The average [[equity]] you throw away per decision. It is
    how a bot measures a player.`, { src: 'gnubg', see: ['pr'] }),
  g('pr', `Performance rating: [[error rate]] multiplied by 500, so that a
    world-class player scores under 5 and a beginner well over 15.`,
    { src: 'gnubg' }),
  g('blunder', `A move that throws away a lot of [[equity]] — on these pages,
    more than 0.080.`, { src: 'gnubg' }),
];

export const slugOf = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** term (or alias) -> entry, for validating [[links]] and rendering them. */
export const INDEX = new Map(GLOSSARY.map(e => [e.term.toLowerCase(), e]));
