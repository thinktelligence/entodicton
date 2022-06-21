const entodicton = require('entodicton')
const currencyKM = require('./currency.js')
const helpKM = require('./help.js')
const timeKM = require('./time.js')
const { table } = require('table')
const _ = require('lodash')
const characters_tests = require('./characters.test.json')

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

class Sally {
  getName() {
    return "sally"
  }

  process(config, utterance) {
    // call the characters config to get response and return that. this is testing so I am not doing that
    /*
    if (utterance == 'what is the time') {
      return 'the magic has happened'
    }
    */
    timeKM.server(config.getServer(), config.getAPIKey())
    return timeKM.process(utterance)
  }

  response({context, result}) {
    console.log('----------------------------------------')
    console.log(`${context.value} says: `, result.generated)
    console.log('----------------------------------------')
  }
}
const api = new Sally()

/*
  get request 
    -> process to contexts 
    -> use "sally" to select user to send command to
    -> in semantics convert to paraphrase 
    -> send paraphrase to sally 
    -> get response back: sally said: blah
*/

let config = {
  name: 'characters',

  operators: [
    "([([character])] (any))",
    "([help])",
  ],
  bridges: [
    { id: 'character', level: 0, bridge: "{ ...next(operator), words: []  }" },
    { id: 'character', level: 1, bridge: "{ ...operator, words: append(operator.words, after) }" },
    { id: 'help', level: 0, bridge: "{ ...next(operator)  }" },
  ],
  "words": {
    "sally": [{"id": "character", "initial": "{ value: 'sally' }" }],
    "bob": [{"id": "character", "initial": "{ value: 'bob' }" }],
    //"product1": [{"id": "reportObject", "initial": "{ value: 'api1' }" }],
    //"api2": [{"id": "reportObject", "initial": "{ value: 'api2' }" }],
    //" ([0-9]+)": [{"id": "amount", "initial": "{ value: int(group[0]) }" }],
  },

  generators: [
    [
      ({context}) => context.marker == 'character' && context.paraphrase,
      ({context}) => context.value + ", " + context.utterance
    ],
    [
      ({context}) => context.marker == 'character' && context.response,
      ({context}) => 'Asked ' + context.value + " '" + context.utterance + "'"
    ],
    [
      ({context}) => context.marker == 'character',
      ({context}) => context.value
    ],
    {
      match: ({context, config}) => context.marker == 'help',
      apply: ({context, config}) => {
        let help = `MAIN KNOWLEDGE MODULE\n\n`
        help += getHelp(config, 2)

        if (config.configs.length > 1) {
          help += '\n\n'
          help += 'INCLUDED KNOWLEDGE MODULES\n'
          for (km of config.configs) {
            if (km._config instanceof entodicton.Config) {
              help += '\n' + getHelp(km._config, 4)
            }
          }
        }

        return help
      }
    },
  ],

  semantics: [
    [
      ({context}) => context.marker == 'character',
      // ({context, config, km}) => {
      (args) => {
        const {context, km, log} = args;
        const words = context.words.map( (context) => context.word )
        const utterance = words.join(' ')
        const config = km('characters')
        const api = config._api.apis[context.value]
        api.process(config, utterance).then( (result) => {
          if (!api.response) {
            throw `WARNING characters km: the "response" handler for the api "${api.getName()}" is not defined so no callback is made`
          } else {
            api.response({ ...args, result })
          }
        })
        context.utterance = utterance
        context.response = true
      }
    ]
  ]
};

class Bob {
  getName() {
    return "bob"
  }

  process(config, utterance) {
    currencyKM.server(config.getServer(), config.getAPIKey())
    return currencyKM.process(utterance, { credentials: this.credentials })
  }

  response({context, result}) {
    console.log('----------------------------------------')
    console.log(`${context.value} says: `, result.generated)
    console.log('----------------------------------------')
  }
}
const api2 = new Bob()

const initializeApi = (config, api) => {
  const name = api.getName();
  config.addWord(name, {"id": "character", "initial": "{ value: '" + name + `', api: '${name}'}` })
}

config = new entodicton.Config(config, module)
config.multiApi = initializeApi
config.initializer( ({isModule, config}) => {
  if (!isModule) {
    config.api = api2
    config.api = api
  }
})

// mode this to non-module init only
entodicton.knowledgeModule({
  module,
  description: 'this module is for creating a team of characters that can respond to commands',
  demo: "https://youtu.be/eA25GZ0ZAHo",
  config,
  test: {
    name: './characters.test.json',
    contents: characters_tests
  },
})
