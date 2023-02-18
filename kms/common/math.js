const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const numbers = require('./numbers')
const math_tests = require('./math.test.json')

// TODO 10 dollars times 20 dollars
let config = {
  name: 'math',
  operators: [
    "(([number|]) [times] ([number|]))",
    "(([number|]) [plus] ([number|]))",
    "(([number|]) [minus] ([number|]))",
  ],
  bridges: [
    { id: "plus", level: 0, 
        bridge: "{ ...next(operator), x: before[0], y: after[0], number: 'one' }" ,
        isA: ['queryable', 'number'],
        words: ['+'],
        generatorp: ({gp, context}) => `${gp(context.x)} plus ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          context.value = e(context.x).value + e(context.y).value
        }
    },
    { id: "minus", level: 0, 
        bridge: "{ ...next(operator), x: before[0], y: after[0], number: 'one' }" ,
        isA: ['queryable', 'number'],
        words: ['-'],
        generatorp: ({gp, context}) => `${gp(context.x)} minus ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          context.value = e(context.x).value - e(context.y).value
        }
    },
    { id: "times", level: 0, 
        bridge: "{ ...next(operator), x: before[0], y: after[0], number: 'one' }" ,
        isA: ['queryable', 'number'],
        words: ['*'],
        generatorp: ({gp, context}) => `${gp(context.x)} times ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          context.value = e(context.x).value * e(context.y).value
        }
    },
  ],
};

config = new entodicton.Config(config, module)
config.add(numbers);
config.add(dialogues);
entodicton.knowledgeModule( { 
  module,
  config,
  description: 'talking about math',
  test: {
    name: './math.test.json',
    contents: math_tests
  },
})
