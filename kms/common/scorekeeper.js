const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const dialogues = require('./dialogues')
const numbers = require('./numbers')
const pluralize = require('pluralize')
//const people = require('./people')
const properties = require('./properties')
const scorekeeper_tests = require('./scorekeeper.test.json')
const scorekeeper_instance = require('./scorekeeper.instance.json')

/*
const game = {
  players: [],
  score: null
}
// TODO start a new game greg and elon who are the players

api = {
  _motivations: []
}
*/

const template = {
  queries: [
    // "start a new game\ngreg and jeff",
    // { query: "start a new game", development: true },
    // { query: "the winning score is 20", development: true },
  ],
}

const setPlayers = (objects, config, players) => {
  for (let player of players) {
    config.addWord(player, { "id": "player", "initial": `{ value: "${player}" }` })
  }
  objects.players = players;
}

const setNextPlayer = (km, objects) => {
  const turn = {
        marker: "turn",
        default: true,
        modifiers: [ "whose" ],
        number: "one",
        text: "whose turn is it",
        types: [ "turn" ],
        whose: objects.players[objects.nextPlayer] || "nobody's",
        word: "turn"
      }
  const api = km('dialogues').api
  api.mentioned(turn)
}

const addPlayer = (objects, config, player) => {
  config.addWord(player, { "id": "player", "initial": `{ value: "${player}" }` })
  objects.players.push(player);
}

let config = {
  name: 'scorekeeper',
  operators: [
    "([next])",
    "([turn])",
    //"([start] (<a> (<new> ([game]))))",
    "([start] (<a> (<new> ([game]))))",
    "(<new> ([game]))",
    //"([person|person,people])",
    "(([player|player,players]) [scored|got] ([score|score,scores]))",
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
    { id: 'next', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'game', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'turn', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'new', level: 0, bridge: '{ ...operator, ...after, new: "new", modifiers: append(["new"], operator.modifiers)}' },
    { id: 'winning', level: 0, bridge: '{ ...after, winning: "winning", modifiers: append(["winning"], operator.modifiers)}' },
    //{ id: 'winning', level: 0, bridge: '{ ...after, winning23: "winning24"}' },
    { id: 'score', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'player', level: 0, bridge: '{ ...next(operator) }' },
    //{ id: 'person', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'scored', level: 0, bridge: '{ ...next(operator), player: before[0], points: after[0] }' },

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
  /*
  associations: {
    negative: [
    ],
    positive: [
      [['score', 0], ['is', 0], ['point', 0]],
      [['score', 0], ['is', 0], ['number', 0], ['point', 0]],
    ]
  },
  */
  priorities: [
    [['is', 0], ['the', 0], ['winning', 0]],
  ],

  hierarchy: [
    ['point', 'score'],
    ['game', 'theAble'],
    ['player', 'theAble'],
    ['player', 'what'],
    ['player', 'unknown'],
    //['person', 'theAble'],
    ['score', 'theAble'],
    ['score', 'queryable'],
    ['point', 'queryable'],
    ['next', 'queryable'],
    ['turn', 'property'],
  ],

  generators: [
    {
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.isResponse && context.two && context.two.marker == 'next',
      apply: ({context, g}) => {
                const response = context.evalue;
                const concept = response.two;
                concept.paraphrase = true
                concept.isSelf = true
                const instance = g(concept.evalue)
                return instance
             }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'point' && context.isResponse && context.amount,
      apply: ({context, g}) => `${g(context.amount)} points` 
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'scored' && context.paraphrase,
      apply: ({context, g}) => `${g(context.player)} got ${g(context.points)}`
    },
    /*
    {
      where: where(),
      match: ({context}) => context.marker == 'enumeration' && context.paraphrase,
      apply: ({context, g}) => `${g(context.concept)} are ${g(context.items)}`
    },
    */
    {
      where: where(),
      match: ({context}) => context.marker == 'start' && context.paraphrase,
      apply: ({context, g}) => `start ${g(context.arg)}`
    },

  ],

  semantics: [
    {
      where: where(),
      match: ({context}) => context.marker == 'player' && context.same,
      apply: ({context, objects, config, km}) => {
        //objects.players = context.same.value.map( (props) => props.value )
        const players = context.same.value.map( (props) => props.value )
        setPlayers(objects, config, players)
        for (let player of objects.players) {
          objects.scores[player] = 0
        }
        objects.nextPlayer = 0;
        setNextPlayer(km, objects);
        objects.allPlayersAreKnown = true;
        context.sameWasProcessed = true
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'start' && context.topLevel, 
      apply: ({context, objects, km, config, ask}) => {
        objects.scores = {}
        objects.nextPlayer = 0
        setNextPlayer(km, objects);
        for (let player of objects.players) {
          objects.scores[player] = 0;
        }
        if (objects.winningScore) {
          context.value = `${objects.players[objects.nextPlayer]}'s turn`
          context.verbatim = `New game the winning score is ${objects.winningScore}. The players are ${objects.players}`
          context.isResponse = true;
        } else {
          ask([
            {
              where: where(),
              matchq: ({objects}) => !objects.winningScore,
              applyq: () => 'what is the winning score?',
              matchr: ({context}) => context.marker == 'point',
              applyr: ({context, objects}) => {
                          objects.winningScore = context.amount.value
                          context.verbatim = `The winning score is ${objects.winningScore}`
                          context.isResponse = true;
                      }
            },
            {
              where: where(),
              matchq: ({objects}) => objects.players.length == 0,
              applyq: () => 'who are the players?',
              matchr: ({context}) => context.marker == 'list',
              applyr: ({context, gs, objects, config}) => {
                        const players = context.value.map( (player) => player.value )
                        setPlayers(objects, config, players)
                        objects.allPlayersAreKnown = true;
                        context.verbatim = `The players are ${gs(objects.players, ' ', ' and ')}`
                        context.isResponse = true;
                      }
            }
          ])
        }
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'turn' && context.evaluate && context.whose,
      apply: ({context, objects}) => {
        if (Number.isInteger(objects.nextPlayer)) {
          context.evalue = `${objects.players[objects.nextPlayer]}'s turn`
        } else {
          context.evalue = "no one's turn"
        }
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'next' && context.evaluate,
      apply: ({context, objects}) => {
        if (Number.isInteger(objects.nextPlayer)) {
          context.evalue = objects.players[objects.nextPlayer]
        } else {
          context.evalue = 'no one'
        }
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'player' && context.evaluate && context.pullFromContext,
      apply: ({context, objects, gs}) => {
        const players = objects.players
        if (players.length == 0) {
          context.evalue = 'no one'
        } else {
          context.evalue = gs(players, ' ', ' and ')
        }
      }
    },
      // same
    {
      where: where(),
      match: ({context}) => context.marker == 'score' && context.same && context.winning,
      apply: ({context, objects}) => {
        // objects.winningScore = context.same.amount.value
        objects.winningScore = context.same.value
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'score' && context.evaluate && context.winning,
      apply: ({context, objects}) => {
        //context.value = { marker: 'point', value: objects.winningScore }
        // i got the value by running -q '20 points'
        context.evalue = {
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
      where: where(),
      match: ({context}) => context.marker == 'score' && context.evaluate,
      apply: ({context, objects}) => {
        const players = Object.keys(objects.scores);
        let allScoresAreZero = true
        for (let player of players) {
          if (objects.scores[player] != 0) {
            allScoresAreZero = false
            break;
          }
        }
        if (pluralize.isPlural(context.word)) {
          context.number = 'many'
        }
        if (allScoresAreZero) {
          context.evalue = 'nothing for everyone'
        } else {
          const scores = players.map( (player) => `${player} has ${objects.scores[player]} points` )
          context.evalue = scores.join(' ')
        }
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'scored',
      apply: ({context, objects, km}) => {
        const player = context.player.value;
        const points = context.points.amount.value;
        // add names to the known words
        if (objects.allPlayersAreKnown) {
          if (player != objects.players[objects.nextPlayer]) {
            // some error about playing in the wrong order
            context.verbatim = `The next player is ${objects.players[objects.nextPlayer]} not ${player}`
            context.isResponse = true;
          } else {
            if (!objects.scores[player]) {
              objects.scores[player] = 0
            }
            objects.scores[player] += points
            objects.nextPlayer = (objects.nextPlayer + 1) % objects.players.length
            setNextPlayer(km, objects);
          }
        }
        else if (objects.players.includes(context.player.value)) {
            objects.allPlayersAreKnown = true
            if (objects.allPlayersAreKnown && objects.players[0] != context.player.value) {
              // some error about not playing order
            } else {
              objects.nextPlayer = 1 % objects.players.length;
              setNextPlayer(km, objects);
              objects.scores[player] += points;
            }
        } else {
          //objects.players.push(player)
          addPlayer(objects, config, player)
          objects.scores[player] = points;
        }
        if (objects.scores[player] >= objects.winningScore) {
          context.verbatim = `${player} won with ${objects.scores[player]} points`
          context.isResponse = true;
        }
      }
    },
  ],
};

config = new Config(config, module)
config.add(dialogues)
config.add(numbers)
config.add(properties)
config.initializer( ({objects, km, isModule}) => {
  objects.players = []
  objects.nextPlayer = undefined;
  setNextPlayer(km, objects);
  objects.scores = {};
  objects.winningScore = null
  objects.allPlayersAreKnown = false;
})

startWithDefault20 = [
  "greg got 1 point hana got 2 points greg got 1 point start a new game who is next",
  "greg got 1 point hana got 2 points greg got 1 point start a new game",
  "start a new game greg got 10 points start a new game greg got 10 points what are the scores",
  "greg got 100 points start a new game what are the scores",
  "greg got 10 points sara got 3 points greg got 2 points whose turn is it",
  "greg got 10 points alice got 3 points greg got 5 points who is next",
  "greg got 10 points greg got 5 points who is next",
  "greg got 10 points who is next",
  "greg got 10 points what are the scores",
  "greg got 10 points what is the score",
  "what is the winning score",
  "greg got 20 points",
]

knowledgeModule( { 
  module,
  description: 'scorekeeper for card or dice games',
  config,
  test: {
    name: './scorekeeper.test.json',
    contents: scorekeeper_tests
  },
  template: {
    template,
    instance: scorekeeper_instance
  },

})
