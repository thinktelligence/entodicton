const { Config, knowledgeModule, ensureTestFile, where } = require('theprogrammablemind')
const hierarchy = require('./hierarchy')
ensureTestFile(module, 'foods', 'test')
ensureTestFile(module, 'foods', 'instance')

const foods_tests = require('./foods.test.json')
const foods_instance = require('./foods.instance.json')

// fix this
// fix loading ordering not working

const template ={
  "queries": [
    "chicken modifies strips",
    "chicken strips are food",
    "sushi is food",
  ],
}

const config = new Config({ name: 'foods' }, module)
config.add(hierarchy)
// config.load(template, foods_instance)

knowledgeModule( {
    module,
      description: 'foods related concepts',
      config,
      test: {
              name: './foods.test.json',
              contents: foods_tests
            },
      template: {
        template,
        instance: foods_instance,
      },
})
