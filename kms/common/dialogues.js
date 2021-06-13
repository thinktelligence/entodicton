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
  ],
  bridges: [
    { id: "what", level: 0, bridge: "{ ...next(operator), query: true }" },
    { id: "queryable", level: 0, bridge: "{ ...next(operator) }" },
    { id: "is", level: 0, bridge: "{ ...next(operator), one: before[0], two: after[0] }" },

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
        debugger;
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

url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
//url = "http://localhost:3000"
//key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
config = new entodicton.Config(config)
config.api = api

config.initializer( ({objects, api, uuid}) => {
  objects.dialog = {
      current: ['contextThatItRefersTo']
  }
})

entodicton.knowledgeModule( { 
  url,
  key,
  name: 'dialogues',
  description: 'framework for dialogues',
  config,
  isProcess: require.main === module,
  test: './dialogues.test',
  setup: () => {
  },
  process: (promise) => {
    return promise
      .then( async (responses) => {
        if (responses.errors) {
          console.log('Errors')
          responses.errors.forEach( (error) => console.log(`    ${error}`) )
        }
        console.log('This is the global objects from running semantics:\n', config.objects)
        if (responses.logs) {
          console.log('Logs')
          responses.logs.forEach( (log) => console.log(`    ${log}`) )
        }
        console.log(responses.trace);
        console.log('objects', JSON.stringify(config.get("objects"), null, 2))
        console.log(JSON.stringify(responses.results, null, 2));
        console.log(responses.generated);
      })
      .catch( (error) => {
        console.log(`Error ${config.get('utterances')}`);
        console.log('error', error)
        console.log('error.error', error.error)
        console.log('error.context', error.context)
        console.log('error.logs', error.logs);
        console.log('error.trace', error.trace);
      })
  },
  module: () => {
    config.initializer( ({objects, api, uuid}) => {
      objects.dialog = {
          current: []
      }
    })

    module.exports = config
  }
})
