const entodicton = require('entodicton')
const { avatar } = require('ekms')
const sulu_tests = require('./sulu.test.json')

let data = {
  me: {
    name: 'sulu',
    age: 23,
    eyes: 'hazel',
  },
  other: {
    name: 'unknown'
  }
}

api = {
  // who in [me, other]
  get: (who, property) => {
    return data[who][property]
  },
                
  set: (who, property, value) => {
    data[who][property] = value
  },
}

config = avatar.copy()
config.api = api

entodicton.knowledgeModule( { 
  module,
  name: 'sulu',
  description: 'sulu',
  config,
  test: {
    name: './sulu.test.json',
    contents: sulu_tests
  },
})
