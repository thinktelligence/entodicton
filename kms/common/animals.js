const entodicton = require('entodicton')
const hierarchy = require('./hierarchy').copy()
const animals_tests = require('./animals.test.json')
const animals_instance = require('./animals.instance.json')

const template ={
  "queries": [
    "humans are mammals",
    "mammals are animals",
    "mammals have ears",
    "mammals dont have wings",
    "animals have skin",
    "birds are animals",
    "birds have wings",
    "felines are animals",
    "cats are felines",
    "canines are animals",
    "dogs are canines",
    "bats are mammals",
    "bats have wings"
  ],
}

const config = new entodicton.Config({ name: 'animals' })
config.add(hierarchy)
config.load(template, animals_instance)

entodicton.knowledgeModule( {
    module,
      description: 'animals related concepts',
      config,
      test: {
              name: './animals.test.json',
              contents: animals_tests
            },
})
