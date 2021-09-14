const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const numbers = require('./numbers')
const scorekeeper_tests = require('./scorekeeper.test.json')

const game = {
  players: [],
  score: null
}


api = {
  _motivations: []
}

let config = {
  name: 'scorekeeper',
  operators: [
    "([start] (<a> ([game])))",
    "((<the> ([player|player,players])) [enumeration|are,is] ([person|person,people]))",
    "(([player]) [scored|got] ([score|score,scores]))",
    "(([number]) [point|point,points])",
    "(<winning|> ([score|]))",
  /*
  "start a new game" // -> creates motivations to ask for players and winning scope
  "the players are x y and x'
  "the winning score is 10000'
  'greg got 10
  'kia got 20 points'
  'who is winning'
  'what are the scores'
  */
  ],
  bridges: [
    { id: 'start', level: 0, bridge: '{ ...next(operator), arg: after[0] }' },
    { id: 'game', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'winning', level: 0, bridge: '{ ...after, winning: "winning", modifiers: append(["winning"], operator.modifiers)}' },
    //{ id: 'winning', level: 0, bridge: '{ ...after, winning23: "winning24"}' },
    { id: 'score', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'player', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'person', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'scored', level: 0, bridge: '{ ...next(operator), player: before[0], points: after[0] }' },
    { id: 'enumeration', level: 0, bridge: '{ ...next(operator), one: before[0], two: after[0] }' },

    // append will default undefineds to empty list
    //{ id: "point", level: 0, bridge: "{ ...next(operator), amount: before[0], modifiers: append(operator.modifiers, ['amount']) }" },
    { id: "point", level: 0, bridge: "{ ...next(operator), amount: before[0], modifiers: append(['amount']) }" },
  ],
  words: {
    "winning": [{"id": "winning", "initial": "{ modifiers: [] }" }],
    /*
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
    */
  },
  associations: {
    negative: [
      [['score', 0], ['enumeration', 0], ['point', 0]],
      [['score', 0], ['enumeration', 0], ['number', 0], ['point', 0]],
    ],
    positive: [
      [['score', 0], ['is', 0], ['point', 0]],
      [['score', 0], ['is', 0], ['number', 0], ['point', 0]],
    ]
  },

  priorities: [
    [['is', 0], ['the', 0], ['winning', 0]],
    [['is', 0], ['score', 0], ['the', 0], ['what', 0]],
  ],

  hierarchy: [
    ['enumeration', 'is'],
    ['point', 'score'],
    ['game', 'theAble'],
    ['player', 'theAble'],
    ['player', 'what'],
    ['person', 'theAble'],
    ['score', 'theAble'],
    ['score', 'queryable'],
    ['point', 'queryable'],
  ],

  generators: [
    {
      match: ({context}) => context.marker == 'scored' && context.paraphrase,
      apply: ({context, g}) => `${g(context.player)} got ${g(context.points)}`
    },
    /*
    {
      match: ({context}) => context.marker == 'enumeration' && context.paraphrase,
      apply: ({context, g}) => `${g(context.concept)} are ${g(context.items)}`
    },
    */
    {
      match: ({context}) => context.marker == 'start' && context.paraphrase,
      apply: ({context, g}) => `start ${g(context.arg)}`
    },

  ],

  semantics: [
    {
      match: ({context}) => context.marker == 'player' && context.evaluate && context.pullFromContext,
      apply: ({context, objects}) => {
        const players = Object.keys(objects.scores)
        if (players.length == 0) {
          context.value = 'no one'
        } else {
          context.value = players.join(' ')
        }
      }
    },
      // same
    {
      match: ({context}) => context.marker == 'score' && context.same && context.winning,
      apply: ({context, objects}) => {
        objects.winningScore = context.same.amount.value
      }
    },
    {
      match: ({context}) => context.marker == 'score' && context.evaluate && context.winning,
      apply: ({context, objects}) => {
        //context.value = { marker: 'point', value: objects.winningScore }
        // i got the value by running -q '20 points'
        context.value = {
            "amount": {
              "marker": "number",
              "types": [
                "number"
              ],
              "value": objects.winningScore,
              "word": `${objects.winningScore}`
            },
            "marker": "point",
            "modifiers": [
              "amount"
            ],
            "word": "points",
          }
      }
    },
    {
      match: ({context}) => context.marker == 'score' && context.evaluate,
      apply: ({context, objects}) => {
        const players = Object.keys(objects.scores);
        if (players.length == 0) {
          context.value = 'nothing for everyone'
        } else {
          const scores = players.map( (player) => `${player} has ${objects.scores[player]} points` )
          context.value = scores.join(' ')
        }
      }
    },
    {
      match: ({context}) => context.marker == 'scored',
      apply: ({context, objects}) => {
        const player = context.player.value;
        const points = context.points.amount.value;
        // add names to the known words
        if (objects.allPlayersAreKnown) {
          if (player != objects.players[objects.next]) {
            // some error about playing in the wrong order
          } else {
            objects.scores[player] += points
            objects.next = (objects.next + 1) % objects.players.length
          }
        }
        else if (objects.players.includes(context.player.value)) {
            objects.allPlayersAreKnown = true
            if (objects.allPlayersAreKnown && objects.players[0] != context.player.value) {
              // some error about not playing order
            } else {
              objects.next = 1 % objects.players.length;
              objects.scores[player] += points;
            }
        } else {
          objects.players.push(player)
          objects.scores[player] = points;
        }
        if (objects.scores[player] >= objects.winningScore) {
          context.verbatim = `${player} won with ${objects.scores[player]} points`
          context.response = true;
        }
      }
    },
  ],
};

config = new entodicton.Config(config)
config.add(dialogues)
config.add(numbers)
config.initializer( ({objects}) => {
  objects.players = []
  objects.nextPlayer = undefined;
  objects.scores = {};
  objects.winningScore = 20
  objects.allPlayersAreKnown = false;
})

entodicton.knowledgeModule( { 
  module,
  description: 'scorekeeper for card or dice games',
  config,
  test: {
    name: './scorekeeper.test.json',
    contents: scorekeeper_tests
  },
})
