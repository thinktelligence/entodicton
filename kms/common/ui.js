const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const dialogues = require('./dialogues')
const math = require('./math')
const ui_tests = require('./ui.test.json')
const ui_instance = require('./ui.instance.json')

class API {
  move(direction, steps = 1) {
    this.objects.move = { direction, steps }
  }

  select(item) {
    this.objects.select = { item }
  }

  cancel(direction) {
    this.objects.cancel = true
  }

  initialize() {
  }
}
const api = new API()

/*
  TODO

  select 2
  select twice
  again
*/
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
         api.move(context.direction.value, context.direction.steps ? context.direction.steps.value : 1)
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

const template = {
  fragments: [
    "move direction",
  ],
}

config = new Config(config, module)
config.add(dialogues).add(math)
config.api = api
config.initializer( ({config, baseConfig}) => {
  // TODO fix this config/baseConfig thing
  baseConfig.addMotivation({
    repeat: true,
    where: where(),
    match: ({context, isA}) => isA(context, 'direction'),
    apply: ({context, insert, s}) => {
      const direction = context
      const fragment = config.fragment("move direction")
      const mappings = [{
        where: where(),
        match: ({context}) => context.value == 'direction',
        apply: ({context}) => Object.assign(context, direction),
      }]
      const instantiation = fragment.instantiate(mappings)
      s(instantiation)
    }
  })
})

knowledgeModule({ 
  module,
  description: 'Control a ui with speech',
  config,
  test: {
    name: './ui.test.json',
    contents: ui_tests,
    check: ['select', 'move', 'cancel'],
  },
  template: {
    template,
    instance: ui_instance
  }
})
