const entodicton= require('entodicton')
const _ = require('lodash')
entodicton.ensureTestFile(module, 'meta', 'test')
entodicton.ensureTestFile(module, 'meta', 'instance')
const meta_tests = require('./meta.test.json')
const meta_instance = require('./meta.instance.json')
const { hashIndexesGet, hashIndexesSet, translationMapping, } = require('./helpers_meta')

const template = {
    queries: [
//      "if f then g",
    ]
};

// TODO -> if a car's top speed is over 200 mph then the car is fast
let config = {
  name: 'meta',
  operators: [
    "((phrase) [means] (phrase))",
    // if x likes y then x wants y
    "([if] ([ifAble]) ([then] ([ifAble])))",
    // "cats is the plural of cat"
    // "is cat the plural of cats"
    { pattern: "([x])", development: true },
    // if f x then g x
    { pattern: "([f])", development: true },
    { pattern: "([g])", development: true },

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
  hierarchy: [
    { child: 'f', parent: 'ifAble', development: true },
    { child: 'g', parent: 'ifAble', development: true },
  ],
  bridges: [
    { id: "means", level: 0, bridge: "{ ...next(operator), from: before[0], to: after[0] }" },
    { id: "if", level: 0, bridge: "{ ...next(operator), antecedant: after[0], consequence: after[1].consequence }" },
    { id: "then", level: 0, bridge: "{ ...next(operator), consequence: after[0] }" },
    { id: "ifAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "x", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "f", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "g", level: 0, bridge: "{ ...next(operator) }", development: true },
//    { id: "testWord2", level: 0, bridge: "{ ...next(operator) }" },
  ],
  version: '3',
  words: {
  //  'testWord2': [{"id": "testWord2", "initial": "{ value: 'testWord2Value' }" }],
    // TODO make this development and select out for module
    // 'x': [{id: "x", initial: "{ value: 'x' }", development: true }],
    // 'f': [{id: "ifAble", initial: "{ word: 'f' }", development: true }],
    // 'g': [{id: "ifAble", initial: "{ word: 'g' }", development: true }],
    'x': [{id: "x", initial: "{ value: 'x', word: 'x' }", development: true }],
    'gq': [{id: "g", initial: "{ word: 'gq', query: true }", development: true }],
  },
  generators: [
    {
      match: ({context}) => context.response,
      apply: ({context}) => context.response.verbatim,
      development: true,
    },
    {
      match: ({context}) => context.marker == 'means' && context.paraphrase,
      apply: ({context, g}) => {
        const before = g({ ...context.from, paraphrase: true, debug: true})
        return `${g({ ...context.from, paraphrase: true})} means ${g(context.to)}`
      }
    },
    { 
      match: ({context}) => context.marker === 'ifAble',
      apply: ({context}) => context.value,
      development: true,
    },
    { 
      match: ({context}) => ['x', 'g', 'f', 'ifAble'].includes(context.marker),
      apply: ({context}) => `${context.word}`,
      development: true,
    },
    {
      match: ({context}) => context.marker === 'if',
      apply: ({context, g}) => {
        return `if ${g(context.antecedant)} then ${g(context.consequence)}`
      }
    },
  ],

  semantics: [
    {
      match: ({context}) => ['f', 'g'].includes(context.marker),
      apply: ({context}) => {
        context.response = {
          verbatim: `this is ${context.marker} response`
        }
      },
      development: true,
    },
    {
      match: ({context}) => context.marker == 'if',
      apply: ({config, context}) => {
        // setup the read semantic
       
          // !topLevel or maybe !value??!?! 
          const match = (defContext) => ({context}) => context.marker == (defContext.consequence || {}).marker && context.query // && !context.value
          const apply = (mappings, TO) => ({context, s, g, config}) => { 
            TO = _.cloneDeep(TO)
            for (let { from, to } of mappings) {
              hashIndexesSet(TO, to, hashIndexesGet(context, from))
            }
            // next move add debug arg to s and g
            TO.query = true
            toPrime = s(TO)
            // toPrime = s(TO, { debug: { apply: true } })
            // maps the response back?
            if (toPrime.response) {
              context.response = toPrime.response
            } else {
              context.response = toPrime
            }
          }
          // const mappings = translationMapping(context.from, context.to)
          const mappings = translationMapping(context.antecedant, context.consequence)
          const semantic = { 
            notes: "setup the read semantic",
            // match: match(context), 
            match: match(context),
            apply: apply(mappings, _.cloneDeep(context.antecedant)) ,
          }
          config.addSemantic(semantic)
      }
    },
    {
      match: ({context}) => context.marker == 'means',
      apply: ({config, context}) => {
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
//config.load(template, meta_instance)
// config.add(dialogue)
config.initializer( ({config, isModule}) => {
  if (!isModule) {
    config.addGenerator({
      match: ({context}) => context.marker == 'unknown',
      apply: ({context}) => `${context.word}`
    })
    //config.addPriorities([['then', 0], ['g', 0], ['if', 0], ['f', 0]])
    //config.addPriorities([['then', 0], ['if', 0], ['g', 0]])
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
    include: {
      words: true,
    }
  },
  template: {
    template,
    instance: meta_instance,
  },
})
