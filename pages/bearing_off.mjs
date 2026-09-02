import { page, prose, question, made, blot, clear, shots, numbers, off, hits, prime, board } from '../lib/kit.mjs';
import { board as pos } from '../lib/board.mjs';

export default page('Bearing off', [

  prose`**He is [[anchor|anchored]] and waiting. Take them off without leaving a
    [[blot]].** A checker off is worth nothing if he [[hit|hits]] you on the way,
    and one [[shot]] is all he needs.`,

  question({
    id: 'bo-12',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
......||......
--------------
......||....x.
......||....x.
......||....x.
......||....x.
......||....x.
......||x...xo
......||xxx.xo
off x4`,
    dice: [4, 3],
    ask: prose`He is waiting. Two checkers to place and one to take off.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
    ],
  }),

  question({
    id: 'bo-23',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
......||......
......||......
......||......
......||......
--------------
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||..xoxx
......||x.xoxx`,
    dice: [3, 1],
    ask: prose`A small roll, and every way of playing it looks the same.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
    ],
    antigoals: [
      off(1, prose`You can take 1 off with this roll and it is the wrong count.
        A checker off cannot be hit; the ones you left behind can.`),
    ],
  }),

  question({
    id: 'bo-33',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
......||......
......||......
......||......
--------------
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||x..oxx
......||xxxoxx`,
    dice: [5, 4],
    ask: prose`Two off with this roll. Which two?`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
    ],
  }),

  question({
    id: 'bo-137',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
--------------
......||.....x
......||.....x
......||....xx
......||....xx
......||.x.oxx
......||xxxoxx
off x1`,
    dice: [5, 4],
    ask: prose`You could take three off.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
    ],
    antigoals: [
      off(3, prose`You can take 2 off with this roll and it is the wrong count.
        A checker off cannot be hit; the ones you left behind can.`),
    ],
  }),

  question({
    id: 'bo-8',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
......||......
......||......
......||......
--------------
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||x..o.x
......||xx.oxx
off x2`,
    dice: [4, 2],
    ask: prose`One off, and a checker to tuck away.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
    ],
  }),

  question({
    id: 'bo-43',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
--------------
......||......
......||....xx
......||....xx
......||...oxx
......||xxxoxx
off x4`,
    dice: [6, 1],
    ask: prose`Six off already. The end is close.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
    ],
    antigoals: [
      off(6, prose`You can take 2 off with this roll and it is the wrong count.
        A checker off cannot be hit; the ones you left behind can.`),
    ],
  }),

  question({
    id: 'bo-44',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
......||......
......||......
......||......
......||......
--------------
......||....x.
......||....x.
......||....x.
......||....x.
......||....x.
......||....x.
......||....x.
......||....x.
......||..x.xo
......||xxxxxo`,
    dice: [6, 2],
    ask: prose`A big number and a small one.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
    ],
    antigoals: [
      off(2, prose`You can take 2 off with this roll and it is the wrong count.
        A checker off cannot be hit; the ones you left behind can.`),
    ],
  }),

  question({
    id: 'bo-67',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
......||......
--------------
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||xx..ox
......||xx.xox
off x3`,
    dice: [5, 3],
    ask: prose`Your back point is the one that matters.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
      clear(6, prose`And the 6 point is empty — clear from the back and the rest follows.`,
        prose`The 6 point is the one to empty. Leave checkers there and
        you will be forced off it later, at a worse moment.`),
    ],
    antigoals: [
      off(5, prose`You can take 2 off with this roll and it is the wrong count.
        A checker off cannot be hit; the ones you left behind can.`),
    ],
  }),

  question({
    id: 'bo-85',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
......||......
--------------
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||xxx.ox
......||xxxxox
off x1`,
    dice: [5, 2],
    ask: prose`The 5 point has one checker too many.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
      clear(5, prose`And the 5 point is empty — clear from the back and the rest follows.`,
        prose`The 5 point is the one to empty. Leave checkers there and
        you will be forced off it later, at a worse moment.`),
    ],
  }),

  question({
    id: 'bo-83',
    board: pos`
......||ooo...
......||ooo...
......||ooo...
......||ooo...
......||o.....
......||......
......||......
......||......
--------------
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||.....x
......||xx..ox
......||xxx.ox
off x2`,
    dice: [5, 1],
    ask: prose`Nearly home.`,
    goals: [
      shots(0, prose`Everything covered. He rolls, and there is nothing to shoot at.`,
        prose`There was a way to play this leaving nothing for him to hit.`),
      clear(5, prose`And the 5 point is empty — clear from the back and the rest follows.`,
        prose`The 5 point is the one to empty. Leave checkers there and
        you will be forced off it later, at a worse moment.`),
    ],
    antigoals: [
      off(4, prose`You can take 2 off with this roll and it is the wrong count.
        A checker off cannot be hit; the ones you left behind can.`),
    ],
  }),

  prose`Safe first. The checkers come off anyway.`,
]);
