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
    // sentence with the word blah
    // sentences with concept blah
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
config.server('http://Deplo-Entod-17F6HL7NB1AL5-515954428.ca-central-1.elb.amazonaws.com', 'f4a879cd-6ff7-4f14-91db-17a11ba77103')
entodicton.knowledgeModule({
  module,
  name: 'help',
  description: 'Help the user with the current knowledge modules',
  config,
  test: './help.test',
})
