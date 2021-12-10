const entodicton = require('entodicton')
const avatar = require('./avatar')
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./kirk.instance.json')
const pluralize = require('pluralize')

const template = {
  "queries": [
      "your name is jim",
      "your rank is captain",
      "your eyes are blue",
      "you are a captain",
      "spock's rank is second",
      "spock's name is spock",
      "spock's eyes are brown",
      "spock is a doctor",
      "mccoy's rank is doctor",
      "mccoy is a doctor",
      "mccoy's name is mccoy",
      "mccoy's eyes are brown",
      "the status of the phasers is armed",
      "the status of the photon torpedoes is armed",
  ]
};

const config = new entodicton.Config({ 
  name: 'kirk',
  priorities: [
    [['is', 0], ['photon', 0], ['propertyOf', 0], ['the', 0], ['what', 0]],
    [['is', 0], ['unknown', 0], ['propertyOf', 0], ['the', 0], ['photon', 0]],
  ],
})

config.add(avatar)
kirk_instance.base = 'avatar'
config.initializer( ({config, km}) => {
  const api = km('properties').api
  api.kindOfConcept(config, 'photon', 'torpedo')
  // api.kindOfConcept(config, 'crew', 'member')
} )
config.load(template, kirk_instance)

entodicton.knowledgeModule( {
  module,
  description: 'Simulated Captain Kirk using a KM template',
  config,
  test: {
          name: './kirk.test.json',
          contents: kirk_tests,
          include: {
            words: true,
            bridges: true,
            operators: true,
            hierarchy: true,
            priorities: true,
          }
        },
})
