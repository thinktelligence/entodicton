const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const crew = require('./crew')
const spock_tests = require('./spock.test.json')
const spock_instance = require('./spock.instance.json')

const template = {
  "queries": [
    "you are spock",
  ]
};

const config = new Config({ name: 'spock', }, module)
config.add(crew)
spock_instance.base = 'crew'
// config.load(template, spock_instance)
knowledgeModule( {
  module,
  description: 'Spock Simulator using a KM template',
  config,
  test: {
          name: './spock.test.json',
          contents: spock_tests,
        },
  template: {
    template,
    instance: spock_instance,
  },
})
