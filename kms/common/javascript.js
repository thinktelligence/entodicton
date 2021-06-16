const entodicton = require('entodicton')
const dialogues = require('./dialogues')

let config = {
  operators: [
    "((<let> ([variable|])) [assignment|] (value))",
    "(<the> ([variable]))",
    //"(((((console)[.](log))['(']) ([arg]) [')'])"
  ],
  bridges: [
    { "id": "let", "level": 0, "bridge": "{ ...after[0], scope: 'let' }" },
    { "id": "variable", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "assignment", "level": 0, "bridge": "{ ...next(operator), variable: before[0], value: after[0] }" },
  ],
  debug: false,
  version: '3',
  words: {
    "=": [{"id": "assignment", "initial": "{ value: 1 }" }],
    /*
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
    */
  },

  generators: [
    [ ({context}) => context.marker == 'number', ({context}) => `${context.value}` ],
  ],

  semantics: [
    [
      ({context}) => context.marker == 'assignment',
      ({context, objects}) => {
        objects.variables[context.variable.marker] = context.value.marker
      }
    ]
  ],
};

config = new entodicton.Config(config)
config.add(dialogues)

config.initializer( ({objects, api, uuid}) => {
  objects.variables = {}
})

entodicton.knowledgeModule( { 
  name: 'javascript',
  description: 'javascript interpreter -> lol',
  config,
  isProcess: require.main === module,
  test: './javascript.test',
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
        console.log(responses.generated);
        console.log(JSON.stringify(responses.results, null, 2));
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
    module.exports = config
  }
})
