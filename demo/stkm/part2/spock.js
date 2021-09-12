const entodicton = require('entodicton')
const { avatar, time } = require('ekms')
const spock_tests = require('./spock.test.json')

let data = {
  me: {
    name: 'spock',
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
config.add(time)
config.api = api

entodicton.knowledgeModule( { 
  module,
  name: 'spock',
  description: 'spock',
  config,
  test: {
    name: './spock.test.json',
    contents: spock_tests
  }
})
