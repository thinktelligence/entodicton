const entodicton = require('entodicton')
const base = require('./hierarchy').copy()
const animals_tests = require('./animals.test.json')
const animals_instance = require('./hierarchy.animals.instance.json')

const config = new entodicton.Config({ name: 'animals' })
config.add(base)
config.load(animals_instance)

entodicton.knowledgeModule( {
    module,
      description: 'animals related concepts',
      config,
      test: {
              name: './animals.test.json',
              contents: animals_tests
            },
})
