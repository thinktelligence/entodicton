const entodicton = require('entodicton')
const hierarchy = require('./hierarchy')
entodicton.ensureTestFile(module, 'foods', 'test')
entodicton.ensureTestFile(module, 'foods', 'instance')

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

const config = new entodicton.Config({ name: 'foods' })
config.add(hierarchy)
config.load(template, foods_instance)

entodicton.knowledgeModule( {
    module,
      description: 'foods related concepts',
      config,
      test: {
              name: './foods.test.json',
              contents: foods_tests
            },
})
