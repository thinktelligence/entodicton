const entodicton = require('entodicton')
const dialogues = require('./dialogues')

const api = {
  //
  // duck typing: for operators you want to use here
  //
  //   1. Use hierarchy to make them an instance of queryable. For example add hierarchy entry [<myClassId>, 'queryable']
  //   2. For semantics, if evaluate == true then set value to the 'value' property of the operator to the value.
  //   3. Generators will get contexts with 'response: true' set. Used for converting 'your' to 'my' to phrases like 'your car' or 'the car'.
  //   4. Generators will get contexts with 'instance: true' and value set. For converting values like a date to a string.
  //

  // used with context sensitive words like 'it', 'that' etc. for example if you have a sentence "create a tank"
  // then call mentioned with the tank created. Then if one asks 'what is it' the 'it' will be found to be the tank.
}
// TODO implement what / what did you say ...
let config = {
  operators: [
    "(([property]) <([propertyOf|of] ([object]))>)",
  ],
  hierarchy: [
    ['property', 'queryable'],
    ['object', 'queryable'],
    ['property', 'theAble'],
  ],
  bridges: [
    { id: "property", level: 0, bridge: "{ ...next(operator) }" },
    { id: "object", level: 0, bridge: "{ ...next(operator) }" },
    { id: "propertyOf", level: 0, bridge: "{ ...next(operator), object: after[0] }" },
    { id: "propertyOf", level: 1, bridge: "{ ...before[0], object: operator.object }" },
  ],
  priorities: [
    [['is', 0], ['propertyOf', 1]],
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
    [({objects, context}) => context.marker == 'property' && context.evaluate, async ({objects, context}) => {
      context.value = "value"
    }],
  ]
};

config = new entodicton.Config(config)
config.add(dialogues)
config.api = api

entodicton.knowledgeModule( { 
  module,
  name: 'properties',
  description: 'properties for dialogues',
  config,
  test: './properties.test',
})
