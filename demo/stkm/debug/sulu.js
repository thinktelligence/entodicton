const entodicton = require('entodicton')
const { avatar } = require('ekms')

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

let config = {
  operators: [
    "([arm] (<the> ([weapon|phasers])))",
  ],
  bridges: [
    { id: 'weapon', level: 0, bridge: "{ ...next(operator) }" },
    { id: 'arm', level: 0, bridge: "{ ...next(operator), weapon: after[0] }" },
  ]
}

config = new entodicton.Config(config)
const avatarKM = avatar.copy()
avatarKM.api = api
config.add(avatarKM)

entodicton.knowledgeModule( { 
  module,
  name: 'sulu',
  description: 'sulu',
  config,
  test: './sulu.test',
})
