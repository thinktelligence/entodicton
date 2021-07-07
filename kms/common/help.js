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
    // help with <km>
    // sentence with the word blah
    // sentences with concept blah
  ],
  bridges: [
    { "id": "help", "level": 0, "bridge": "{ ...next(operator), response: true }" },
  ],
  debug: false,
  version: '3',
  words: {
  },

  generators: [
    [({context, config}) => context.marker == 'help' && context.paraphrase, () => `help`],
    [ 
      ({context, config}) => context.marker == 'help' && context.response, ({context, config}) => {
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
entodicton.knowledgeModule({
  module,
  name: 'help',
  description: 'Help the user with the current knowledge modules',
  config,
  test: './help.test',
})
