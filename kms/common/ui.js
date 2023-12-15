const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const dialogues = require('./dialogues')
const math = require('./math')
const ui_tests = require('./ui.test.json')

class API {
  move(direction, steps = 1) {
    this.objects.move = { direction, steps }
  }

  select(direction) {
    this.objects.select = true
  }

  cancel(direction) {
    this.objects.cancel = true
  }

  initialize() {
  }
}
const api = new API()

let config = {
  name: 'ui',
  operators: [
    "([select])",
    "([cancel])",
    "([move] ([direction]))",
    "([down])",
    "([up])",
    "([left])",
    "([right])",
    "(([direction]) [moveAmount|] ([number]))"
  ],
  bridges: [
    { 
       id: "select", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       semantic: ({api, context}) => {
         api.select()
       }
    },
    { 
       id: "moveAmount", 
       isA: ['preposition'],
       implicit: true,
       level: 0, 
       bridge: "{ ...before[0], postModifiers: ['steps'], steps: after[0] }",
    },
    { 
       id: "cancel", 
       isA: ['verby'],
       level: 0, 
       words: ['close'],
       bridge: "{ ...next(operator) }",
       semantic: ({api, context}) => {
         api.cancel()
       }
    },
    { 
       id: "move", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), direction: after[0] }",
       generatorp: ({context, g}) => `move ${g(context.direction)}`,
       semantic: ({api, context}) => {
         api.move(context.direction.value, context.direction.steps?.value || 1)
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
config.add(dialogues).add(math)
config.api = api

knowledgeModule({ 
  module,
  description: 'Control a ui with speech',
  config,
  test: {
    name: './ui.test.json',
    contents: ui_tests,
    check: ['select', 'move', 'cancel'],
  },
})
