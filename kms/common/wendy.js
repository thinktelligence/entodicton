const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
ensureTestFile(module, 'wendy', 'test')
ensureTestFile(module, 'wendy', 'instance')

const kid = require('./kid')
const wendy_tests = require('./wendy.test.json')
const wendy_instance = require('./wendy.instance.json')

const template = {
  "queries": [
    "you are wendy",
  ]
};

const config = new Config({ name: 'wendy', }, module)
config.add(kid)
// config.load(template, wendy_instance)
knowledgeModule( {
  module,
  description: 'Kia Simulator using a KM template',
  config,
  test: {
          name: './wendy.test.json',
          contents: wendy_tests,
        },
  template: {
    template,
    instance: wendy_instance,
  },
})
