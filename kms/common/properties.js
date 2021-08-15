const entodicton = require('entodicton')
const dialogues = require('./dialogues')

//
// duck typing: 
//
//   1. Make your properties instances of 'property' add ['myProperty', 'property'] to the hierarchy
//   2. Make your objects an instance of 'object' add ['myObject', 'object'] to the hierarchy
//   3. Add semantics for getting the value
//        [
//          ({objects, context, args, hierarchy}) => 
//                hierarchy.isA(context.marker, 'property') && 
//                args({ types: ['myObjectType'], properties: ['object'] }) && context.evaluate, 
//          async ({objects, context}) => {
//          context.value = "value" // set the value here somehow
//          }
//        ],
//

let config = {
  name: 'properties',
  operators: [
    "(([property]) <([propertyOf|of] ([object]))>)",
  ],
  hierarchy: [
    ['property', 'queryable'],
    ['object', 'queryable'],
    ['property', 'theAble'],
    ['object', 'theAble'],
  ],
  bridges: [
    { id: "property", level: 0, bridge: "{ ...next(operator) }" },
    { id: "object", level: 0, bridge: "{ ...next(operator) }" },
    { id: "propertyOf", level: 0, bridge: "{ ...next(operator), object: after[0] }" },
    { id: "propertyOf", level: 1, bridge: "{ ...before[0], object: operator.object }" },
  ],
  priorities: [
    [['is', 0], ['propertyOf', 1]],
    [['propertyOf', 0], ['the', 0]],
  ],
  generators: [
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'property') && context.object && !context.value && !context.evaluate,
      ({context, g}) => {
        const property = Object.assign({}, context, { object: undefined })
        return `${g(property)} of ${g({ ...context.object, determined: false })}`
      }
    ]
  ],
  semantics: [
    [({objects, context, args, hierarchy}) => hierarchy.isA(context.marker, 'property') && args({ types: ['object'], properties: ['object'] }) && context.evaluate, async ({objects, context}) => {
      context.value = "value"
    }],
  ]
};

config = new entodicton.Config(config)
config.add(dialogues)

entodicton.knowledgeModule( { 
  module,
  description: 'properties of objects',
  config,
  test: './properties.test',
})
