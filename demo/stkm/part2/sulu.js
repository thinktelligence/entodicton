const entodicton = require('entodicton')
const { avatar } = require('ekms')
const crew = require('./crew')
const { enterprise } = require('./enterprise')

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

config = {
  name: 'sulu',
  semantics: [
    [
      ({context}) => context.marker == 'arm',
      ({context}) => {
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        console.log("before enterprise", JSON.stringify(enterprise, null, 2))
        enterprise.weapons.phasers = true
        console.log("afterenterprise", JSON.stringify(enterprise, null, 2))

      }
    ]
  ]
}

config = new entodicton.Config(config)
config.add(crew)
const avatarKM = avatar.copy()
avatarKM.api = api
config.add(avatar)

entodicton.knowledgeModule( { 
  module,
  description: 'sulu',
  config,
  test: './sulu.test',
})
