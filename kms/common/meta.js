const entodicton= require('entodicton')
const dialogue = require('./dialogues')

let config = {
  operators: [
    "((word) [means] (word))"
    // undefine (word)
    // forget (word)
    // what does (word) mean
  ],
  bridges: [
    { "id": "means", "level": 0, "bridge": "{ ...next(operator), word: before[0], meaning: after[0] }" },
  ],
  "version": '3',
  "words": {
  },

  generators: [
    [
      ({context}) => context.marker == 'means',
      ({context, g}) => `${g(context.word)} means ${g(context.meaning)}`
    ]
  ],

  semantics: [
    ({context}) => context.marker == 'means',
    //({addWord}) => addWord(context.word.word, context.meaning.word)
  ],
};

config = new entodicton.Config(config)
config.add(dialogue)

entodicton.knowledgeModule({ 
  module,
  name: 'meta',
  description: 'Ways of defining new language elements',
  config,
  test: './meta.test',
})
