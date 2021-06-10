const entodicton = require('entodicton')
const dialogues = require('./dialogues')

api = {
}

let config = {
  operators: [
    "(<your> ([name]))",
    //"my name is blah",
  ],
  bridges: [
    { "id": "name", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "your", "level": 0, "bridge": "{ ...after, subject: 'your' }" },
  ],
  debug: false,
  version: '3',
  words: {
    /*
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
    */
  },

  hierarchy: [
    ['name', 'queryable']
  ],

  generators: [
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.response && context.subject == 'your', 
      ({context}) => `my ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.subject, 
      ({context}) => `${context.subject} ${context.word}` 
    ],
  ],

  semantics: [
    [ 
      ({context}) => context.marker == 'name' && context.evaluate && context.subject == 'your', 
      ({context, objects}) => {
        debugger; // here
        context.value = objects.me.name
      }
    ],
  ],
};

url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
//url = "http://localhost:3000"
//key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
config = new entodicton.Config(config)
config.add(dialogues)
config.api = api
config.initializer( ({objects, api, uuid}) => {
  objects.me = {
      name: 'molnius',
      age: 23,
      eyes: 'hazel',
    }
  })

entodicton.knowledgeModule( { 
  url,
  key,
  name: 'avavar',
  description: 'avatar for dialogues',
  config,
  isProcess: require.main === module,
  test: './avatar.test',
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
    module.exports = config
  }
})
