const entodicton = require('entodicton')

const api = {
  //
  // duck typing: for operators you want to use here
  //
  //   1. Use hierarchy to make them an instance of queryable
  //   2. For semantics, if evaluate == true then set value to the value of the operator
  //   3. Generators will get contexts with 'response: true' set. Used for converting 'your' to 'my'
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

    { id: "the", level: 0, bridge: "{ ...next(operator), pullFromContext: true }" },

    // TODO make this hierarchy thing work
    { id: "it", level: 0, hierarchy: ['queryable'], bridge: "{ ...next(operator), pullFromContext: true }" },
  ],
  floaters: ['query'],
  hierarchy: [
    ['it', 'queryable'],
    ['what', 'queryable'],
  ],
  debug: false,
  version: '3',
  generators: [
    [ 
      ({context}) => context.unknown, 
      ({context}) => context.marker
    ],
    [ 
      ({context}) => context.marker == 'it' && !context.isQuery, 
      ({context}) => `it` 
    ],
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.subject, 
      ({context}) => `${context.subject} ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'is' && context.response,
      ({context, g}) => {
        const response = context.response;
        const concept = response.concept;
        concept.response = true
        const instance = response.instance.value
        return `${g(concept)} is ${g(instance)}` 
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

config.initializer( ({objects, api, uuid}) => {
  objects.dialog = {
      current: ['contextThatItRefersTo']
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
