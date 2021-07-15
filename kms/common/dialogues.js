const entodicton = require('entodicton')

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
  mentioned: (concept) => {
  }
}

let config = {
  operators: [
    "(([queryable]) [is] ([queryable|]))",
    "([it])",
    "([what])",
    "(<the> arg)",
  ],
  bridges: [
    { id: "what", level: 0, bridge: "{ ...next(operator), query: true }" },
    { id: "queryable", level: 0, bridge: "{ ...next(operator) }" },
    { id: "is", level: 0, bridge: "{ ...next(operator), one: before[0], two: after[0] }" },

    { id: "the", level: 0, bridge: "{ ...after[0], pullFromContext: true }" },

    // TODO make this hierarchy thing work
    { id: "it", level: 0, hierarchy: ['queryable'], bridge: "{ ...next(operator), pullFromContext: true }" },
  ],
  floaters: ['query'],
  priorities: [
    [["is",0],["the",0]]
  ],
  hierarchy: [
    ['it', 'queryable'],
    ['what', 'queryable'],
  ],
  debug: false,
  version: '3',
  generators: [
    [ 
      ({context}) => context.unknown, 
      ({context}) => JSON.stringify(context.marker)
    ],
    [ 
      ({context}) => context.marker == 'what' && (context.response || context.paraphrase), 
      ({context}) => `what` 
    ],
    [ 
      ({context}) => context.marker == 'it' && !context.isQuery && !context.instance, 
      ({context}) => `it` 
    ],
    [ 
      ({context}) => context.marker == 'it' && !context.isQuery && context.instance, 
      ({context}) => context.value
    ],
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.subject, 
      ({context}) => `${context.subject} ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'is' && context.paraphrase,
      ({context, g}) => {
        context.one.response = true
        context.two.response = true
        return `${g(context.one)} is ${g(context.two)}` 
      }
    ],
    [ 
      ({context}) => context.marker == 'is' && context.response,
      ({context, g}) => {
        const response = context.response;
        const concept = response.concept;
        concept.response = true
        const instance = g(response.instance)
        return `${g(concept)} is ${instance}` 
      }
    ],
    [ 
      ({context}) => context.marker == 'is' && !context.response,
      ({context, g}) => {
        return `${g(context.one)} is ${g(context.two)}`
      }
    ]
  ],

  semantics: [
    [ 
      ({context}) => context.marker == 'it' && context.pullFromContext,
      ({context, s, objects}) => {
        context.value = objects.dialog.current[0]
      },
    ],

    // query 
    [ 
      ({context}) => context.marker == 'is' && context.query,
      ({context, s}) => {
        const one = context.one;
        const two = context.two;
        let concept, value;
        if (one.query) {
          concept = one;
          value = two;
        } else {
          concept = two;
          value = one;
        }
        value = JSON.parse(JSON.stringify(value))
        value.evaluate = true;
        const instance = s(value) 
        delete instance.evaluate
        instance.instance = true;
        concept = JSON.parse(JSON.stringify(value)) 
        concept.isQuery = undefined

        context.response = {
          isResponse: true,
          instance,
          concept,
        }
      }
    ],

    // statement
    [ 
      ({context}) => context.marker == 'is' && !context.query,
      ({context, s}) => {
        const one = context.one;
        const two = context.two;
        one.same = two;
        s(one)
        one.same = undefined
        two.same = one
        s(two)
        two.same = undefined
      }
    ],
  ],
};

config = new entodicton.Config(config)
config.api = api

config.initializer( ({objects, isModule}) => {
  if (isModule) {
    objects.dialog = {
      current: []
    }
  } else {
    objects.dialog = {
      current: ['contextThatItRefersTo']
    }
  }
})

entodicton.knowledgeModule( { 
  module,
  name: 'dialogues',
  description: 'framework for dialogues',
  config,
  test: './dialogues.test',
  /*
  module: () => {
    config.initializer( ({objects, api, uuid}) => {
      objects.dialog = {
          current: []
      }
    })

    module.exports = config
  }
  */
})
