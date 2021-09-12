const entodicton = require('entodicton')
const { characters } = require('ekms')
const suluKM = require('./sulu')
const spockKM = require('./spock')
const computerKM = require('./computer')
const game_tests = require('./game.test.json')

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

const computerAPI = {
  getName: () => "computer",

  process: (utterance) => {
    return computerKM.process(utterance)
  }
}

config = characters
config.api = spockAPI
config.api = suluAPI
config.api = computerAPI

entodicton.knowledgeModule( { 
  module,
  name: 'game',
  description: 'game',
  config,
  test: {
    name: './game.test.json',
    contents: game_tests
  }
})
