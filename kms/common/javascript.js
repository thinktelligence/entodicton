const entodicton = require('entodicton')

let config = {
  operators: [
    "[let] ((c) [=] (23))",
    "(((((console)[.](log))['(']) ([arg]) [')'])"
  ],
  bridges: [
    { "id": "number", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  debug: false,
  version: '3',
  words: {
    " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
    "one": [{"id": "number", "initial": "{ value: 1 }" }],
    "ten": [{"id": "number", "initial": "{ value: 10 }" }],
  },

  generators: [
    [ ({context}) => context.marker == 'number', ({context}) => `${context.value}` ],
  ],

  semantics: [
  ],
};

url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
//url = "http://localhost:3000"
//key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
config = new entodicton.Config(config)

entodicton.knowledgeModule( { 
  url,
  key,
  name: 'javascript',
  description: 'javascript interpreter',
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
