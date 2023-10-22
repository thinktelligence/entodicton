const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const dialogues = require('./dialogues')
const help_tests = require('./help.test.json')
const helpers = require('./helpers')

const getHelp = (config, indent=2) => {
  indent = ' '.repeat(indent)
  let help = ''
  help += `${indent}NAME: ${config.name}\n`
  help += `${indent}DESCRIPTION: ${config.description}\n\n`
  help += `${indent}SAMPLE SENTENCES\n\n`
  for (let test of config.tests) {
    if (test.developerTest) {
      continue
    }
    help += `${indent}  ${test.query}\n`
  }
  return help
}

let config = {
  name: 'help',
  operators: [
    "([help] ([withKM|with] ([km]))?)",
    // "([help])",
    // help with <km>
    // sentence with the word blah
    // sentences with concept blah
  ],
  bridges: [
    { 
      id: "km", 
      level: 0, 
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "help", 
      level: 0, 
      generatorp: () => 'help',
      generatorr: ({context, config}) => {
        let kms = helpers.propertyToArray(context.kms).map( (value) => value.value )
        const isAll = kms.length == 0
        let help = '';
        if (isAll) {
          help = `MAIN KNOWLEDGE MODULE\n\n`
        }
        if (isAll || kms.includes(config.name)) {
          help += getHelp(config, 2)
        }
        
        if (config.configs.length > 1) {
          if (isAll) {
            help += '\n\n'
            help += 'INCLUDED KNOWLEDGE MODULES\n'
          }
          for (km of config.configs) {
            if (km._config instanceof Config) {
              if (isAll || kms.includes(km._config.name)) {
                help += '\n' + getHelp(km._config, isAll ? 4 : 2)
              }
            }
          }
        }

        return help
      },
      optional: { withKM: "{ marker: 'km', kms: []}" },
      bridge: "{ ...next(operator), kms: after[0].kms, isResponse: true }" 
    },
    { id: "withKM", level: 0, bridge: "{ ...next(operator), kms: after[0] }" },
  ],
  debug: false,
  version: '3',
  words: {
    // "km1": { "the": [{"id": "the", "initial": "{ modifiers: [] }" }],
    'km1': [{id: "km", initial: "{ value: 'km1', word: 'km1' }", development: true }],
  },
};

config = new Config(config, module)
config.add(dialogues)

config.initializer( ({ isAfterApi, config }) => {
  if (isAfterApi) {
    const names = new Set()
    for (let c of config.configs) {
      names.add(c.name);
    }
    for (let name of names) {
      config.addWord(name, {id: "km", initial: `{ value: '${name}', word: '${name}' }`})
    }
  }
}, { initAfterApi: true })

knowledgeModule({
  module,
  description: 'Help the user with the current knowledge modules',
  config,
  test: {
    name: './help.test.json',
    contents: help_tests
  },

})
