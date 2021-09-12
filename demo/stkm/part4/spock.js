const entodicton = require('entodicton')
const crew = require('./crew')
const { time } = require('ekms')
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

let config = {
  name: 'spock',
}

config = new entodicton.Config(config)
config.add(time)
config.add(crew)
config.getConfig('avatar').api = api

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
