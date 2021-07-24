const entodicton = require('entodicton')
const crew = require('./crew')
const { time } = require('ekms')

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
  test: './spock.test',
})
