const { Config, knowledgeModule, where } = require('entodicton')
const characters = require('./characters')
const stgame_tests = require('./stgame.test.json')
const crew = require('./crew')
const kirk = require('./kirk')
const spock = require('./spock')

const api = new Object({
  response: ({context, result}) => {
    console.log('----------------------------------------')
    console.log(`${context.value} says: `, result.paraphrases)
    console.log('----------------------------------------')
  },
})

const kirkAPI = {
  getName: () => "kirk",

  process: (config, utterance) => {
    kirk.server(config.getServer(), config.getAPIKey())
    return kirk.process(utterance, { credentials: this.credentials })
  },
  
  response: ({km, context, result}) => {
    km('stgame').api.response({context, result})
  },
}
characters.api = kirkAPI;

const spockAPI = {
  getName: () => "spock",

  process: (config, utterance) => {
    spock.server(config.getServer(), config.getAPIKey())
    return spock.process(utterance, { credentials: this.credentials })
  },
  
  response: ({km, context, result}) => {
    km('stgame').api.response({context, result})
  },
}
characters.api = spockAPI;

const config = new Config({ 
    name: 'stgame', 
    operators: [ "([a])" ],
    bridges: [ { id: 'a', level: 0, bridge: "{ ...next(operator) }" } ],
    words: {"?": [{"id": "a", "initial": "{}" }]},
}, module)
config.api = api
config.add(characters)

knowledgeModule( {
  module,
  description: 'Game simulator for trek-like characters',
  config,
  test: {
          name: './stgame.test.json',
          contents: stgame_tests
        },
})
