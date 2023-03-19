const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const numbers = require('./numbers')
const math_tests = require('./math.test.json')

// TODO 10 dollars times 20
/*
    units  -> 10 feet plus 2 meters
    contact the company using gpt chat for robots
    10 dollars * quantity
*/

const toValue = (context) => {
  while( true ) { 
    if (typeof context == 'number' || !context) {
      return context
    }
    context = context.value
  }
}

let config = {
  name: 'math',
  operators: [
    "(([number|]) [times] ([number|]))",
    "(([number|]) [plus] ([number|]))",
    "(([number|]) [minus] ([number|]))",
    { pattern: "([x])", development: true },
    { pattern: "([y])", development: true },
  ],
  bridges: [
    { id: "x", isA: ['number'], level: 0, bridge: '{ ...next(operator) }', development: true},
    { id: "y", isA: ['number'], level: 0, bridge: '{ ...next(operator) }', development: true},
    { 
        id: "plus", level: 0, 
        // bridge: "{ ...next(operator), types: append(type(before[0]), type(after[0])), x: before[0], y: after[0], number: 'one' }" ,
        bridge: "{ ...next(operator), x: before[0], y: after[0], number: 'one' }" ,
        isA: ['queryable', 'number'],
        words: ['+'],
        generatorp: ({gp, context}) => `${gp(context.x)} plus ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          context.value = toValue(e(context.x)) + toValue(e(context.y))
          context.evaluateWasProcessed = true
        }
    },
    {   
        id: "minus", level: 0, 
        bridge: "{ ...next(operator), x: before[0], y: after[0], number: 'one' }" ,
        isA: ['queryable', 'number'],
        words: ['-'],
        generatorp: ({gp, context}) => `${gp(context.x)} minus ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          context.value = toValue(e(context.x)) - toValue(e(context.y))
          context.evaluateWasProcessed = true
        }
    },
    {   
        id: "times", level: 0, 
        // bridge: "{ ...next(operator), types: lub(append(type(before[0]), type(after[0]))), x: before[0], y: after[0], number: 'one' }" ,
        bridge: "{ ...next(operator), x: before[0], y: after[0], value: null, number: 'one' }" ,
        isA: ['queryable', 'number'],
        before: [['plus', 0], ['minus', 0]],
        words: ['*'],
        generatorp: ({gp, context}) => `${gp(context.x)} times ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          context.value = toValue(e(context.x)) * toValue(e(context.y))
          context.evaluateWasProcessed = true
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
