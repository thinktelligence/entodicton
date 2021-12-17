const entodicton = require('entodicton')
const avatar = require('./avatar')
const crew_tests = require('./crew.test.json')
const crew_instance = require('./crew.instance.json')
const pluralize = require('pluralize')

const template = {
  "queries": [
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
  ]
};

const config = new entodicton.Config({ 
  name: 'crew',
  priorities: [
    [['is', 0], ['crew', 0]],
    [['a', 0], ['is', 0], ['crew', 0]],
    [['is', 0], ['photon', 0], ['propertyOf', 0], ['the', 0], ['what', 0]],
    [['is', 0], ['unknown', 0], ['propertyOf', 0], ['the', 0], ['photon', 0]],
  ],
})

config.add(avatar)
crew_instance.base = 'avatar'
config.initializer( ({config, km}) => {
  const api = km('properties').api
  api.kindOfConcept(config, 'photon', 'torpedo')
  api.kindOfConcept(config, 'crew', 'member')
} )
config.load(template, crew_instance)
entodicton.knowledgeModule( {
  module,
  description: 'Knowledge about the enterprise and crew using a KM template',
  config,
  test: {
          name: './crew.test.json',
          contents: crew_tests,
          include: {
            words: true,
            bridges: true,
            operators: true,
            hierarchy: true,
            priorities: true,
          }
        },
})
