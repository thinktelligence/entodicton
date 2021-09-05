const entodicton = require('entodicton')
const dialogues = require('./dialogues')

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
    { id: 'player', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'person', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'enumeration', level: 0, bridge: '{ ...next(operator), concept: before[0], items: after[0] }' },
  ],
  words: {
    /*
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
    */
  },

  priorities: [
  ],

  hierarchy: [
    ['game', 'theAble'],
    ['player', 'theAble'],
    ['person', 'theAble'],
  ],

  generators: [
    {
      match: ({context}) => context.marker == 'enumeration' && context.paraphrase,
      apply: ({context, g}) => `${g(context.concept)} are ${g(context.items)}`
    },
    {
      match: ({context}) => context.marker == 'start' && context.paraphrase,
      apply: ({context, g}) => `start ${g(context.arg)}`
    },
  ],

  semantics: [
  ],
};

config = new entodicton.Config(config)
config.add(dialogues)

entodicton.knowledgeModule( { 
  module,
  description: 'scorekeeper for card or dice games',
  config,
  test: './scorekeeper.test.json',
})
