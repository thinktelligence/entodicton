const entodicton= require('entodicton')
const _ = require('lodash')
entodicton.ensureTestFile(module, 'meta', 'test')
entodicton.ensureTestFile(module, 'meta', 'instance')
const meta_tests = require('./meta.test.json')
const meta_instance = require('./meta.instance.json')
const { hashIndexesGet, hashIndexesSet, translationMapping, translationMappings } = require('./helpers/meta.js')
const { zip } = require('./helpers.js')
const { unflatten, flattens } = require('entodicton')

const template = {
    queries: [
//      "if f then g",
      //"if e or f then g",
    ]
};

// TODO -> if a car's top speed is over 200 mph then the car is fast
let config = {
  name: 'meta',
  operators: [
    "((phrase) [means] (phrase))",
    // if x likes y then x wants y
    "([if] ([ifAble]) ([then] ([ifAble])))",
    "(([orAble|]) [orList|or] ([orAble|]))",
    // "cats is the plural of cat"
    // "is cat the plural of cats"
    { pattern: "([x])", development: true },
    // if f x then g x
    { pattern: "([e])", development: true },
    { pattern: "([f])", development: true },
    { pattern: "([g])", development: true },
    { pattern: "([undefined])", development: true },
    { pattern: "([defined])", development: true },

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
  priorities: [
    [['if', 0], ['then', 0], ['orList', 0]],
  //  [['means', 0], ['is', 0]],
  ],
  hierarchy: [
    { child: 'e', parent: 'orAble', development: true },
    { child: 'f', parent: 'orAble', development: true },
    { child: 'g', parent: 'ifAble', development: true },
    { child: 'orAble', parent: 'ifAble' },
  ],
  bridges: [
    {id: "orList", level: 0, selector: {left: [{ marker: 'orAble' }], right: [{ marker: 'orAble' }], passthrough: true}, bridge: "{ ...next(operator), value: append(before, after) }"},
    {id: "orList", level: 1, selector: {left: [{ marker: 'orAble' }], passthrough: true}, bridge: "{ ...operator, value: append(before, operator.value) }"},

    // {id: "orList", level: 0, selector: {/*match: "same", type: "infix",*/ left: [{ marker: 'orAble'}], right: [{ marker: 'orAble' }], passthrough: true}, bridge: "{ ...next(operator), value: append(before, after) }"},
    // {id: "orList", level: 1, selector: {/*match: "same",*/ left: [{ marker: 'orAble' }], passthrough: true}, bridge: "{ ...operator, value: append(before, operator.value) }"},


    { id: "means", level: 0, bridge: "{ ...next(operator), from: before[0], to: after[0] }" },
    { id: "if", level: 0, bridge: "{ ...next(operator), antecedant: after[0], consequence: after[1].consequence }" },
    { id: "then", level: 0, bridge: "{ ...next(operator), consequence: after[0] }" },
    { id: "ifAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "orAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "x", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "e", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "f", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "g", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "undefined", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "defined", level: 0, bridge: "{ ...next(operator) }", development: true },
//    { id: "testWord2", level: 0, bridge: "{ ...next(operator) }" },
  ],
  version: '3',
  words: {
  //  'testWord2': [{"id": "testWord2", "initial": "{ value: 'testWord2Value' }" }],
    // TODO make this development and select out for module
    // 'x': [{id: "x", initial: "{ value: 'x' }", development: true }],
    // 'f': [{id: "ifAble", initial: "{ word: 'f' }", development: true }],
    // 'g': [{id: "ifAble", initial: "{ word: 'g' }", development: true }],
    'f': [{id: "f", initial: "{ value: 'f', word: 'f' }", development: true }],
    'x': [{id: "x", initial: "{ value: 'x', word: 'x' }", development: true }],
    'gq': [{id: "g", initial: "{ word: 'gq', query: true }", development: true }],
  },
  generators: [
    {
      match: ({context}) => context.marker == 'undefined',
      apply: ({context}) => 'undefined',
      development: true,
    },
    {
      match: ({context}) => context.marker == 'defined',
      apply: ({context}) => 'defined',
      development: true,
    },
    {
      match: ({context}) => context.response && !context.paraphrase,
      apply: ({context}) => context.response.verbatim,
      development: true,
    },
    {
      match: ({context}) => context.marker == 'orList' && context.paraphrase,
      apply: ({context, gs}) => {
        return gs(context.value, ', ', ' or ')
      },
      priority: -1,
    },
    {
      priority: -1,
      match: ({context}) => context.marker == 'means' && context.paraphrase,
      apply: ({context, g}) => {
        // const before = g({ ...context.from, paraphrase: true, debug: true})
        const before = g({ ...context.from, paraphrase: true})
        return `${g({ ...context.from, paraphrase: true})} means ${g(context.to)}`
      }
    },
    { 
      match: ({context}) => context.marker === 'ifAble',
      apply: ({context}) => context.value,
      development: true,
    },
    { 
      match: ({context}) => ['x', 'g', 'f', 'e', 'ifAble'].includes(context.marker),
      apply: ({context}) => `${context.word}`,
      development: true,
    },
    {
      match: ({context}) => context.marker === 'if',
      apply: ({context, g}) => {
        return `if ${g(context.antecedant)} then ${g(context.consequence)}`
      },
      priority: -1,
    },
  ],

  semantics: [
    {
      match: ({context}) => ['e', 'f', 'g'].includes(context.marker),
      apply: ({context}) => {
        context.response = {
          verbatim: `this is ${context.marker} response`
        }
      },
      development: true,
    },
    {
      match: ({context}) => context.marker == 'orList',
      apply: ({context, s}) => {
        const response = []
        for (const value of context.value) {
          response.push(s(value))
        }
        context.response = {
          marker: 'orList', 
          value: response
        }
      },
    },
    {
      match: ({context}) => context.marker == 'if',
      apply: ({config, context}) => {
        // setup the read semantic
       
          // !topLevel or maybe !value??!?! 
          const match = (defContext) => ({context}) => context.marker == (defContext.consequence || {}).marker && context.query // && !context.value
          const apply = (DEFINITIONs, DERIVED) => {
            const mappingss = translationMappings(DEFINITIONs, DERIVED)
            const invertMappings = (mappings) => mappings.map( ({ from, to }) => { return { to: from, from: to } } )
            return ({context, s, g, config}) => { 
              DEFINITIONs = _.cloneDeep(DEFINITIONs)
              //const mappings = mappingss[0]
              let toPrimes = []
              for (const [TO, mappings] of zip(DEFINITIONs, mappingss)) {
                for (let { from, to } of invertMappings(mappings)) {
                  hashIndexesSet(TO, to, hashIndexesGet(context, from))
                }
                // next move add debug arg to s and g
                TO.query = true
                toPrimes.push([s(TO), mappings])
                // toPrime = s(TO, { debug: { apply: true } })
              }

              let hasResponse = false
              let hasValue = false
              for (const [tp, _] of toPrimes) {
                if (tp.response) {
                  hasResponse = true
                  if (tp.response.value) {
                    hasValue = true
                  }
                }
              }

              // maps the response back
              let response;
              if (hasResponse) {
                if (hasValue) {
                  const valuesPrime = []
                  toPrimes = toPrimes.filter( (toPrime) => (toPrime[0].response || {}).truthValue )
                  // const valueAndMappings = toPrimes.filter((toPrime) => toPrime[0].response && toPrime[0].response.value).map((toPrime) => [toPrime[0].response.value, toPrime[1]])
                  for (const [relations, mappings] of toPrimes) {
                    for (const relation of relations.response.value) {
                      valuePrime = _.cloneDeep(DERIVED)
                      for (let { from, to } of mappings) {
                        hashIndexesSet(valuePrime, to, hashIndexesGet(relation, from))
                      }
                      valuePrime.paraphrase = true
                      valuesPrime.push(valuePrime)
                    }
                  }
                  response = { marker: 'list', truthValue: valuesPrime.length > 0, value: unflatten(valuesPrime, context.flatten || []) }
                } else {
                  const toPrime = toPrimes[0][0]
                  response = toPrime.response
                }
              } else {
                const toPrime = toPrimes[0][0]
                response = toPrime
              }

              context.response = response
            }
          }

          let antecedants = [_.cloneDeep(context.antecedant)]
          if (context.antecedant.marker == 'orList') {
            antecedants = antecedants[0].value
          }

          const semantic = { 
            notes: "setup the read semantic (1)",
            // match: match(context), 
            match: match(context),
            apply: apply(antecedants, _.cloneDeep(context.consequence)) ,
          }
          config.addSemantic(semantic)
      }
    },
    {
      notes: 'from means to where from is unknown',
      match: ({context}) => context.marker == 'means' && context.from.marker == 'unknown',
      apply: ({config, context, kms, isTest}) => {
        if (isTest) {
          return
        } else {
          if (context.to.value) {
            kms.dialogues.api.setVariable(context.from.value, context.to.value)
          } else {
            // config.addWord(context.from.word, 
            kms.dialogues.api.setVariable(context.from.value, context.to)
          }
        }
      }
    },
    {
      notes: 'x means y where x and y have known markers',
      match: ({context}) => context.marker == 'means',
      apply: ({config, context, g}) => {
        // setup the write semantic
        {
          const matchByMarker = (defContext) => ({context}) => context.marker == defContext.from.marker && !context.query && !context.objects
          const matchByValue = (defContext) => ({context}) => context.evalue == defContext.from.value && !context.query && !context.objects
          const apply = (mappings, TO) => ({context, s}) => {
            debugger
            TO = _.cloneDeep(TO)
            for (let { from, to } of mappings) {
              hashIndexesSet(TO, to, hashIndexesGet(context, from))
            }
            toPrime = s(TO)
            context.result = toPrime.result
          }
          const mappings = translationMapping(context.from, context.to)
          let match = matchByMarker(context)
          if (context.from.evalue) {
            match = matchByValue(context)
          }
          const semantic = { 
            notes: "setup the read semantic (2)",
            // match: match(context), 
            match: match,
            apply: apply(mappings, _.cloneDeep(context.to)),
          }
          config.addSemantic(semantic)
        }

        // setup the read semantic
        {
          const matchByMarker = (defContext) => ({context, uuid}) => context.marker == defContext.from.marker && (context.query || context.evaluate) && !context[`disable${uuid}`]
          const matchByValue = (defContext) => ({context, uuid}) => context.value == defContext.from.value && (context.query || context.evaluate) && !context[`disable${uuid}`]
          const apply = (mappings, TO) => ({uuid, context, s, g, config}) => {
            TO = _.cloneDeep(TO)
            for (let { from, to } of mappings) {
              hashIndexesSet(TO, to, hashIndexesGet(context, from))
            }
            // next move add debug arg to s and g
            // TODO why is there query and evaluate?
            if (context.query) {
              TO.query = context.query
            } else {
              TO.evaluate = context.evaluate
            }
            TO[`disable${uuid}`] = true
            // toPrime = s(TO, { debug: { apply: true } })
            toPrime = s(TO)
            if (context.query) {
              if (toPrime.response) {
                context.response = toPrime.response
              } else {
                context.response = toPrime
              }
            } else {
              context.evalue = toPrime.evalue
            }
          }
          const mappings = translationMapping(context.from, context.to)
          let match = matchByMarker(context)
          context.metaInfo = `The mapping from from the expression being defined "${g({...context.from, paraphrase: true})}" to the definition phrase "${g({...context.to, paraphrase: true})}" is ${JSON.stringify(mappings)}`
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
