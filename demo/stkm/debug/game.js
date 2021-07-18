const entodicton = require('entodicton')
const { characters } = require('ekms')
const suluKM = require('./sulu')
const spockKM = require('./spock')

const spockAPI = {
  getName: () => "spock",

  process: (utterance) => {
    return spockKM.process(utterance)
  }
}

const suluAPI = {
  getName: () => "sulu",

  process: (utterance) => {
    return suluKM.process(utterance)
  }
}
config = characters
config.api = spockAPI
config.api = suluAPI

entodicton.knowledgeModule( { 
  module,
  name: 'game',
  description: 'game',
  config,
  test: './game.test',
})
