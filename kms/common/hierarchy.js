const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const hierarchy_tests = require('./hierarchy.test.json')

const api = {
}

let config = {
  name: 'hierarchy',
  operators: [
    "(([property]) <([propertyOf|of] ([object]))>)",
    "(<whose> ([property]))",
    "(<my> ([property]))",
    "(<your> ([property]))",
    "(<(([object]) [possession|])> ([property|]))",
  ],
  hierarchy: [
  ],
  bridges: [
  ],
  words: {
  },
  priorities: [
  ],
  generators: [
  ],
  semantics: [
  ]
};

config = new entodicton.Config(config)
config.api = api
config.add(dialogues)
config.initializer( ({objects}) => {
  objects.objects = {
  }
})

entodicton.knowledgeModule( { 
  module,
  description: 'hierarchy of objects',
  config,
  test: {
    name: './hierarchy.test.json',
    contents: hierarchy_tests
  },
})
