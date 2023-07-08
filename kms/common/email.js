const { Config, knowledgeModule, where } = require('entodicton')
const dialogues = require('./dialogues')
const help_tests = require('./help.test.json')

const getHelp = (config, indent=2) => {
  indent = ' '.repeat(indent)
  let help = ''
  help += `${indent}NAME: ${config.name}\n`
  help += `${indent}DESCRIPTION: ${config.description}\n\n`
  help += `${indent}SAMPLE SENTENCES\n\n`
  for (query of Object.keys(config.tests)) {
    help += `${indent}  ${query}\n`
  }
  return help
}

let config = {
  name: 'help',
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
    {
      match: ({context, config}) => context.marker == 'help' && context.paraphrase, 
      apply: () => `help`
    },
    { 
      match: ({context, config}) => context.marker == 'help' && context.evalue, 
      apply: ({context, config}) => {
        let help = `MAIN KNOWLEDGE MODULE\n\n`
        help += getHelp(config, 2)

        if (config.configs.length > 1) {
          help += '\n\n'
          help += 'INCLUDED KNOWLEDGE MODULES\n'
          for (km of config.configs) {
            if (km._config instanceof Config) {
              help += '\n' + getHelp(km._config, 4)
            }
          }
        }

        return help
      }
    },
  ],
};

config = new Config(config)
config.add(dialogues)
knowledgeModule({
  module,
  description: 'Help the user with the current knowledge modules',
  config,
  test: {
    name: './help.test.json',
    contents: help_tests
  },
})
