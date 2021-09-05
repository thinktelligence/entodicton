const entodicton= require('entodicton')
const dialogue = require('./dialogues')

let config = {
  operators: [
    "((word) [means] (word))",
    //"show the definition of word"
//    "([testWord2|])",
    // make end of sentence an operators -> so means sucks up all the words
    // undefine (word)
    // forget (word)
    // what does (word) mean
  ],
  bridges: [
    { "id": "means", "level": 0, "bridge": "{ ...next(operator), word: before[0], meaning: after[0] }" },

//    { "id": "testWord2", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  version: '3',
  words: {
  //  'testWord2': [{"id": "testWord2", "initial": "{ value: 'testWord2Value' }" }],
  },

  generators: [
    [
      ({context}) => context.marker == 'means' && !context.response,
      ({context, g}) => `${g(context.word)} means ${g(context.meaning)}`
    ],
    [
      ({context}) => context.response,
      ({context, g}) => context.value
    ]
  ],

  semantics: [
    [
      ({context}) => context.marker == 'means',
      ({config, context}) => {
        const otherWord = context.meaning.word
        const word = context.word.word
        const defs = config.get('words')[otherWord]
        debugger;
        if (!defs) {
          context.response = true;
          context.value = `${otherWord} is not defined`
        } else if (defs.length == 1) {
          config.addWord(word, defs[0])
        } else {
        }
      }
    ]
  ],
};

config = new entodicton.Config(config)
config.add(dialogue)
config.initializer( ({config, isModule}) => {
  if (!isModule) {
    config.addWord('testword2', { id: "testword2", initial: "{ value: 'testWord2Value' }" })
    config.addBridge({ "id": "testword2", "level": 0, "bridge": "{ ...next(operator) }" })
    config.addOperator("([testword2|])")
  }
})
config.afterTest = ({query, expected, actual, config}) => {
  if (query == 'testword means testword2') {
    expected = { id: "testword2", initial: "{ value: 'testWord2Value' }" }
    expect(config.get('words'))['testword'].toContainEqual(expected)
    return false;
  } else {
    return true;
  }
}

entodicton.knowledgeModule({ 
  module,
  name: 'meta',
  description: 'Ways of defining new language elements',
  config,
  test: './meta.test.json',
})
