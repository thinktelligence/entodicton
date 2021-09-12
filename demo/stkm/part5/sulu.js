const entodicton = require('entodicton')
const crew = require('./crew')
const { enterprise } = require('./enterprise')
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
        enterprise.weapons.phasers.armed = true
        console.log("afterenterprise", JSON.stringify(enterprise, null, 2))
      }
    ],
    // evaluate
    [ 
      ({context}) => context.marker == 'status' && context.evaluate && context.subject == 'your', 
      ({context, api}) => {
        const phasers = enterprise.weapons.phasers.armed ? 'armed' : 'not armed';
        const photons = enterprise.weapons.photons.armed ? 'armed' : 'not armed';
        context.value = `phasers: ${phasers} photon torpedoes: ${photons}`
      }
    ],
  ]
}

config = new entodicton.Config(config)
config.add(crew)
config.getConfig('avatar').api = api

entodicton.knowledgeModule( { 
  module,
  name: 'sulu',
  description: 'sulu',
  config,
  test: {
    name: './sulu.test.json',
    contents: sulu_tests
  }
})
