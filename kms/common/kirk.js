const entodicton = require('entodicton')
const base = require('./avatar').copy()
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./avatar.kirk.instance.json')
const pluralize = require('pluralize')

const config = new entodicton.Config({ 
  name: 'kirk',
})
config.add(base)
kirk_instance.base = 'avatar'
config.load(kirk_instance)
config.initializer( ({config, km}) => {
  const api = km('properties').api
  api.kindOfConcept(config, 'photon', 'torpedo')
  api.kindOfConcept(config, 'crew', 'member')
} )

entodicton.knowledgeModule( {
  module,
  description: 'kirk related concepts',
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
