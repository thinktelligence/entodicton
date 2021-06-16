const entodicton = require('entodicton')

const getHelp = (config, indent=2) => {
  indent = ' '.repeat(indent)
  let help = ''
  help += `${indent}Name: ${config.name}\n`
  help += `${indent}Description: ${config.description}\n`
  help += `${indent}Sample sentences\n`
  for (query of Object.keys(config.tests)) {
    help += `${indent}  ${query}\n`
  }
  return help
}

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
        let help = `Main Knowledge Module\n\n`
        help += getHelp(config, 2)

        if (config.configs.length > 1) {
          help += '\n\n'
          help += 'Included Knowledge Modules\n'
          for (km of config.configs) {
            if (km._config instanceof entodicton.Config) {
              help += '\n' + getHelp(km._config, 4)
            }
          }
        }

        return help
      }
    ],
  ],
};

config = new entodicton.Config(config)

entodicton.knowledgeModule( { 
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
