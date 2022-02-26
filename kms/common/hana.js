const entodicton = require('entodicton')
entodicton.ensureTestFile(module, 'hana', 'test')
entodicton.ensureTestFile(module, 'hana', 'instance')

const kid = require('./kid')
const hana_tests = require('./hana.test.json')
const hana_instance = require('./hana.instance.json')

const template = {
  "queries": [
    "you are hana",
  ]
};

const config = new entodicton.Config({ name: 'hana', }, module)
config.add(kid)
config.load(template, hana_instance)
entodicton.knowledgeModule( {
  module,
  description: 'Kia Simulator using a KM template',
  config,
  test: {
          name: './hana.test.json',
          contents: hana_tests,
        },
})
