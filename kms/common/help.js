const entodicton = require('entodicton')

let config = {
  operators: [
    "([help])",
  ],
  bridges: [
    { "id": "help", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  debug: false,
  version: '3',
  words: {
  },

  generators: [
    [ ({context, config}) => context.marker == 'help', ({context, config}) => {
        let help = `Knowledge Module: ${config.name}\n`
        help += `  Description: ${config.description}\n`
        help += '  Sample sentences\n'
        for (query of Object.keys(config.tests)) {
          help += `    ${query}\n`
        }
        return help
      }
    ],
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
  name: 'help',
  description: 'Help the user with the current knowledge modules',
  config,
  isProcess: require.main === module,
  test: './help.test',
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
        for (response of responses.generated[0]) {
          console.log(response);
        }
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
