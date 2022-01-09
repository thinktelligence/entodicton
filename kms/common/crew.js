const entodicton = require('entodicton')
const avatar = require('./avatar')
const animals = require('./animals')
const crew_tests = require('./crew.test.json')
const crew_instance = require('./crew.instance.json')
const pluralize = require('pluralize')

const template = {
  queries: [
      "kirk's name is jim",
      "kirk's rank is captain",
      "kirk's eyes are blue",
      "kirk is a captain",
      "kirk is a crew member",
      "spock's rank is second",
      "spock's name is spock",
      "spock's eyes are brown",
      "spock is a doctor",
      "spock is a crew member",
      "mccoy's rank is doctor",
      "mccoy's name is mccoy",
      "mccoy's eyes are brown",
      "mccoy is a crew member",
      "mccoy is a doctor",
      "the status of the phasers is armed",
      "the status of the photon torpedoes is armed",
      "phasers are weapons",
      "torpedoes are weapons",
      "kirk is readonly",
      "spock is readonly",
      "mccoy is readonly",
      "arm the weapon means the status of the weapon is armed",
      "disarm the weapon means the status of the weapon is not armed",
  ],
};

const config = new entodicton.Config({ 
  name: 'crew',
})

config.add(avatar)
config.add(animals)
crew_instance.base = 'avatar'
config.initializer( ({config, km}) => {
  const api = km('properties').api
  api.kindOfConcept({ config, modifier: 'photon', object: 'torpedo' })
  api.kindOfConcept({ config, modifier: 'crew', object: 'member' })
  api.createActionPrefix({ 
                operator: 'arm', 
                create: ['arm', 'weapon'], 
                after: [{tag: 'weapon', id: 'weapon'}],
                config }, 
                ({context, km}) => {
            const value = {
                    "marker": "unknown",
                    "types": [
                      "unknown"
                    ],
                    "unknown": true,
                    "value": "armed",
                    "word": "armed",
                    "response": true
            }

            km("properties").api.setProperty(context.weapon.value, 'status', value, true) 
          }
          )
  
  api.createActionPrefix({ 
                operator: 'disarm', 
                create: ['disarm'/*, 'weapon'*/], 
                after: [{tag: 'weapon', id: 'weapon'}],
                config }) 
})
config.load(template, crew_instance)
entodicton.knowledgeModule( {
  module,
  description: 'Knowledge about the enterprise and crew using a KM template',
  config,
  test: {
          name: './crew.test.json',
          contents: crew_tests,
        },
})
