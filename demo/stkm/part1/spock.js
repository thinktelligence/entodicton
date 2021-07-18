const entodicton = require('entodicton')
const { avatar, time } = require('ekms')

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
  test: './spock.test',
})
