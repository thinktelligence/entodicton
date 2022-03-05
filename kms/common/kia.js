const entodicton = require('entodicton')
entodicton.ensureTestFile(module, 'kia', 'test')
entodicton.ensureTestFile(module, 'kia', 'instance')

const kid = require('./kid')
const kia_tests = require('./kia.test.json')
const kia_instance = require('./kia.instance.json')

const template = {
  "queries": [
    "you are kia",
  ]
};

const config = new entodicton.Config({ name: 'kia', }, module)
config.add(kid)
// config.load(template, kia_instance)
entodicton.knowledgeModule( {
  module,
  description: 'Kia Simulator using a KM template',
  config,
  test: {
          name: './kia.test.json',
          contents: kia_tests,
        },
  template: {
    template,
    instance: kia_instance,
  },
})
