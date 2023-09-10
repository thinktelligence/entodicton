const { Config, knowledgeModule, where } = require('theprogrammablemind')
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

const config = new Config({ name: 'kirk', }, module)
config.add(crew)
kirk_instance.base = 'crew'
// config.load(template, kirk_instance)
knowledgeModule( {
  module,
  description: 'Captain Kirk Simulator using a KM template',
  config,
  test: {
          name: './kirk.test.json',
          contents: kirk_tests,
        },
  template: {
    template,
    instance: kirk_instance,
  },
})
