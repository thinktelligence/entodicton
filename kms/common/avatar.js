const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const hierarchy = require('./hierarchy')
const avatar_tests = require('./avatar.test.json')
 
let config = {
  name: 'avatar',

  operators: [
    "([self])",
  ],

  bridges: [
    { id: 'self', level: 0, bridge: "{ ...next(operator) }" },
  ],

  hierarchy: [
    ['self', 'queryable'],
  ],

  words: {
    "my": [{ id: 'objectPrefix', initial: "{ variable: true, value: 'other' }" }],
    "your": [{ id: 'objectPrefix', initial: "{ variable: true, value: 'self' }" }],
    "you": [{ id: 'self', initial: "{ variable: true, value: 'self' }" }],
    "i": [{ id: 'self', initial: "{ variable: true, value: 'speaker' }" }],
  },

  semantics: [
    {
      notes: 'you are x',
      match: ({context, listable}) => context.marker == 'self',
      apply: ({context, km}) => {
        km("dialogues").api.setVariable('self', context.same.value)
        context.sameWasProcessed = true
      }
    },
  ],

};

config = new entodicton.Config(config, module)
config.add(hierarchy)

entodicton.knowledgeModule( { 
  module,
  description: 'avatar for dialogues',
  config,
  test: {
    name: './avatar.test.json',
    contents: avatar_tests
  }
})
