const entodicton = require('entodicton')
const currencyKM = require('./currency.js')
const helpKM = require('./help.js')
const timeKM = require('./time.js')
const { table } = require('table')
const _ = require('lodash')
const characters_tests = require('./characters.test.json')

const api = {
  getName: () => "sally",

  process: (utterance) => {
    // call the characters config to get response and return that. this is testing so I am not doing that
    /*
    if (utterance == 'what is the time') {
      return 'the magic has happened'
    }
    */
    return timeKM.process(utterance)
  },
}

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
    "([([character])] (any))"
  ],
  bridges: [
    { id: 'character', level: 0, bridge: "{ ...next(operator), words: []  }" },
    { id: 'character', level: 1, bridge: "{ ...operator, words: append(operator.words, after) }" },
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
    ]
  ],

  semantics: [
    [
      ({context}) => context.marker == 'character',
      // ({context, config, km}) => {
      ({context, km}) => {
        const words = context.words.map( (context) => context.word )
        const utterance = words.join(' ')
        const config = km('characters')
        config._api.apis[context.value].process(utterance).then( (result) => {
          console.log('----------------------------------------')
          console.log(`${context.value} says: `, result.generated)
          console.log('----------------------------------------')
        })
        context.utterance = utterance
        context.response = true
      }
    ]
  ]
};

const api2 = {
  getName: () => "bob",

  process: (utterance) => {
    return currencyKM.process(utterance)
  },
}

const initializeApi = (config, api) => {
  const name = api.getName();
  config.addWord(name, {"id": "character", "initial": "{ value: '" + name + `', api: '${name}'}` })
}

config = new entodicton.Config(config)
config.initializer( ({isModule, config}) => {
  if (!isModule) {
    config.api = api2
    config.api = api
  }
})
config.multiApi = initializeApi
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
