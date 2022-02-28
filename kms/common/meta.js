const entodicton= require('entodicton')
const _ = require('lodash')

//const dialogue = require('./dialogues')
const { hashIndexesGet, hashIndexesSet, translationMapping, } = require('./helpers_meta')
const meta_tests = require('./meta.test.json')

let config = {
  name: 'meta',
  operators: [
    "((phrase) [means] (phrase))",
    // "cats is the plural of cat"
    // "is cat the plural of cats"
    /*
    if creating a new word make a motivation to ask if word is plura or singlar of anohter wordA

      make object -> operator+bridge made add word
      add word -> check fo plural or singular if so make motivate to ask (if yes update all contepts dups)
      update hierarchy
    */

    //"show the definition of word"
//    "([testWord2|])",
    // make end of sentence an operators -> so means sucks up all the words
    // undefine (word)
    // forget (word)
    // what does (word) mean
  ],
  bridges: [
    { "id": "means", "level": 0, "bridge": "{ ...next(operator), from: before[0], to: after[0] }" },
//    { "id": "testWord2", "level": 0, "bridge": "{ ...next(operator) }" },
  ],
  version: '3',
  words: {
  //  'testWord2': [{"id": "testWord2", "initial": "{ value: 'testWord2Value' }" }],
  },

  generators: [
    {
      match: ({context}) => context.marker == 'means' && context.paraphrase,
      apply: ({context, g}) => {
        const before = g({ ...context.from, paraphrase: true, debug: true})
        return `${g({ ...context.from, paraphrase: true})} means ${g(context.to)}`
      }
    },
  ],

  semantics: [
    {
      match: ({context}) => context.marker == 'means',
      apply: ({config, context}) => {

        // word means word
        /*
        if (context.from.marker == 'unknown') {
          let def;
          const defs = config.config.words[context.to.word]
          if (defs) {
            config.addWord(context.from.word, defs[0])
          } else if (context.to.marker == 'unknown') {
            const def = { id: context.to.value, initial: '{ value: "${context.from.value}' }
            config.addWord(context.from.word, def)
            if (!config.config.bridges.find( (bridge) => {
              if (bridge.id == context.to.value) {
                return true
              }
            })) {
              config.addOperator(`([${context.to.value}])`)
              config.addBridge({ id: context.to.value, level: 0, bridge: "{ ...next(operator) }" })
            }
          } 

          return
        }
        */
        /*
        const otherWord = context.meaning.word
        const word = context.word.word
        const defs = config.get('words')[otherWord]
        if (!defs) {
          context.response = true;
          context.value = `${otherWord} is not defined`
        } else if (defs.length == 1) {
          config.addWord(word, defs[0])
        } else {
        }
        */
       
        // phrase means phrase 

        // setup the write semantic
        {
          const matchByMarker = (defContext) => ({context}) => context.marker == defContext.from.marker && !context.query
          const matchByValue = (defContext) => ({context}) => context.value == defContext.from.value && !context.query
          const apply = (mappings, TO) => ({context, s}) => {
            TO = _.cloneDeep(TO)
            for (let { from, to } of mappings) {
              hashIndexesSet(TO, to, hashIndexesGet(context, from))
            }
            toPrime = s(TO)
            context.result = toPrime.result
          }
          const mappings = translationMapping(context.from, context.to)
          let match = matchByMarker(context)
          if (context.from.value) {
            match = matchByValue(context)
          }
          const semantic = { 
            notes: "setup the read semantic",
            // match: match(context), 
            match: match,
            apply: apply(mappings, _.cloneDeep(context.to)),
          }
          config.addSemantic(semantic)
        }

        // setup the read semantic
        {
          const matchByMarker = (defContext) => ({context}) => context.marker == defContext.from.marker && (context.query || context.evaluate)
          const matchByValue = (defContext) => ({context}) => context.value == defContext.from.value && (context.query || context.evaluate)
          const apply = (mappings, TO) => ({context, s, g, config}) => {
            TO = _.cloneDeep(TO)
            for (let { from, to } of mappings) {
              hashIndexesSet(TO, to, hashIndexesGet(context, from))
            }
            // next move add debug arg to s and g
            TO.query = true
            toPrime = s(TO)
            // toPrime = s(TO, { debug: { apply: true } })
            if (toPrime.response) {
              context.response = toPrime.response
            } else {
              context.response = toPrime
            }
          }
          const mappings = translationMapping(context.from, context.to)
          let match = matchByMarker(context)
          if (context.from.value) {
            match = matchByValue(context)
          }
          const semantic = { 
            notes: "setup the read semantic",
            // match: match(context), 
            match: match,
            apply: apply(mappings, _.cloneDeep(context.to)) ,
          }
          config.addSemantic(semantic)
        }

      }
    }
  ],
};

config = new entodicton.Config(config, module)
// config.add(dialogue)
config.initializer( ({config, isModule}) => {
  if (!isModule) {
    config.addGenerator({
      match: ({context}) => context.marker == 'unknown',
      apply: ({context}) => `${context.word}`
    })
    /*
    config.addWord('testword2', { id: "testword2", initial: "{ value: 'testWord2Value' }" })
    config.addBridge({ "id": "testword2", "level": 0, "bridge": "{ ...next(operator) }" })
    config.addOperator("([testword2|])")
    */
  }
})
config.afterTest = ({query, expected, actual, config}) => {
  /*
  if (query == 'testword means testword2') {
    expected = { id: "testword2", initial: "{ value: 'testWord2Value' }" }
    expect(config.get('words'))['testword'].toContainEqual(expected)
    return false;
  } else {
    return true;
  }
  */
}

entodicton.knowledgeModule({ 
  module,
  name: 'meta',
  description: 'Ways of defining new language elements',
  config,
  test: {
    name: './meta.test.json',
    contents: meta_tests,
  },
})
