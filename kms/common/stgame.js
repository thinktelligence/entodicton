const entodicton = require('entodicton')
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

  process: (utterance) => {
    return kirk.process(utterance, { credentials: this.credentials })
  },
  
  response: ({km, context, result}) => {
    km('stgame').api.response({context, result})
  },
}
characters.api = kirkAPI;

const spockAPI = {
  getName: () => "spock",

  process: (utterance) => {
    return spock.process(utterance, { credentials: this.credentials })
  },
  
  response: ({km, context, result}) => {
    km('stgame').api.response({context, result})
  },
}
characters.api = spockAPI;

const config = new entodicton.Config({ name: 'stgame', }, module)
config.api = api
config.add(characters)

entodicton.knowledgeModule( {
  module,
  description: 'Game simulator for trek-like characters',
  config,
  test: {
          name: './stgame.test.json',
          contents: stgame_tests
        },
})
