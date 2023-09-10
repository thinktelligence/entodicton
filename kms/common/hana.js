const { Config, knowledgeModule, ensureTestFile, where } = require('theprogrammablemind')
ensureTestFile(module, 'hana', 'test')
ensureTestFile(module, 'hana', 'instance')

const kid = require('./kid')
const hana_tests = require('./hana.test.json')
const hana_instance = require('./hana.instance.json')

const template = {
  "queries": [
    "you are hana",
  ]
};

const config = new Config({ name: 'hana', }, module)
config.add(kid)
// config.load(template, hana_instance)
knowledgeModule( {
  module,
  description: 'Kia Simulator using a KM template',
  config,
  test: {
          name: './hana.test.json',
          contents: hana_tests,
        },
  template: {
    template,
    instance: hana_instance,
  },
})
