const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const dialogues = require('./dialogues')
const ui_tests = require('./ui.test.json')

class API {
  move(direction) {
    this.objects.move = direction
  }
}
const api = new API()

let config = {
  name: 'ui',
  operators: [
    "([move] ([direction]))",
    "([down])",
    "([up])",
    "([left])",
    "([right])",
  ],
  bridges: [
    { 
       id: "move", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), direction: after[0] }",
       generatorp: ({context, g}) => `move ${g(context.direction)}`,
       semantic: ({api, context}) => {
         api.move(context.direction)
       }
    },
    { 
       id: "direction", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "up", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "down", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "left", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "right", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
  ],
};

config = new Config(config, module)
config.add(dialogues)
config.api = api

knowledgeModule({ 
  module,
  description: 'Control a ui with speech',
  config,
  test: {
    name: './ui.test.json',
    contents: ui_tests
  },
})
