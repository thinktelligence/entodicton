const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const hierarchy = require('./hierarchy')
const emotions = require('./emotions')
const avatar_tests = require('./avatar.test.json')
 
let config = {
  name: 'avatar',

  // TODO make different response for answerNotKnown based on emotions
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

  generators: [
    {
      notes: "unknown answer default response for avatar",
      match: ({context}) => context.marker == 'answerNotKnown',
      apply: ({context}) => `I don't know`,
    },
    {
       notes: 'paraphrase: add possession ending for your/my',
       priority: -1,
       match: ({context}) => !context.isResponse && context.possessive && ['self', 'other'].includes(context.value),
       apply: ({context, g}) => { return { "self": "your", "other": "my" }[context.value] },
    },
    {
       notes: 'not paraphrase: add possession ending for your/my',
       priority: -1,
       match: ({context}) => context.isResponse && context.possessive && ['self', 'other'].includes(context.value),
       apply: ({context, g}) => { return { "self": "my", "other": "your" }[context.value] },
    },
  ],

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
config.add(emotions)

entodicton.knowledgeModule( { 
  module,
  description: 'avatar for dialogues',
  config,
  test: {
    name: './avatar.test.json',
    contents: avatar_tests
  }
})
