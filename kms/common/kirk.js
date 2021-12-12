const entodicton = require('entodicton')
const crew = require('./crew')
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./kirk.instance.json')

const template = {
  "queries": [
    "you are kirk",
  ]
};

// TODO what is your name
// TODO what is the name of you
// TODO crew members -> who are the crew members

const config = new entodicton.Config({ 
  name: 'kirk',
})
config.add(crew)
kirk_instance.base = 'crew'
config.load(template, kirk_instance)
entodicton.knowledgeModule( {
  module,
  description: 'Captain Kirk Simulator using a KM template',
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
