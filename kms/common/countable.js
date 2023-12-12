const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const dialogues = require("./dialogues")
const numbers = require("./numbers")
const countable_tests = require('./countable.test.json')

// TODO 1 to 2 countables

let config = {
  name: 'countable',
  operators: [
    "(([number]) [counting] ([countable]))",
  ],
  bridges: [
    { id: "counting", level: 0, implicit: true, bridge: "{ ...after, quantity: before[0] }" },
    { id: "countable", level: 0, bridge: "{ ...next(operator) }" },
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => context.quantity,
      apply: ({context, g}) => {
        const countable = g({ ...context, quantity: undefined, number: context.quanity == 1 ? 'one' : 'many' })
        return `${g(context.quantity)} ${countable}`
      }
    },
  ]
};

config = new Config(config, module)
config.add(dialogues).add(numbers)

knowledgeModule({ 
  module,
  description: 'Countable things',
  config,
  test: {
    name: './countable.test.json',
    contents: countable_tests
  },
})
