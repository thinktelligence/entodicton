const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const hierarchy_tests = require('./hierarchy.test.json')

// word is for one or many
const makeObject = ({config, context}) => {
  const { word, value, number } = context;
  config.addOperator(`([${value}])`)
  config.addBridge({ id: value, level: 0, bridge: "{ ...next(operator) }" })
  config.addWord(word, { id: value, initial: `{value: "${value}", number: ${number}}` } )
  if (number) {
    config.addGenerator({
        match: ({context}) => context.value == value && context.number == number && context.paraphrase,
        apply: () => word
    })
    // mark greg as an instance?
    // add a generator for the other one what will ask what is the plural or singluar of known
    /*
    if (number == 'many') {
    } else if (number == 'one') {
    }
    */
  }
}

const api = {
  isA(objects, child, parent) {
    return objects.parents[child].includes(parent);
  },
  rememberIsA(objects, child, parent) {
    if (!objects.parents[child]) {
      objects.parents[child] = []
    }
    if (!objects.parents[child].includes(parent)) {
      objects.parents[child].push(parent)
    }
    if (!objects.concepts.includes(child)) {
      objects.concepts.push(child)
    }
    if (!objects.concepts.includes(parent)) {
      objects.concepts.push(parent)
    }
  },
  conceptExists(objects, concept) {
    return objects.concepts.includes(concept)
  }
}
let config = {
  name: 'hierarchy',
  operators: [
    "([hierarchyAble|])",
  ],
  hierarchy: [
  ],
  bridges: [
    { id: 'hierarchyAble', level: 0, bridge: "{ ...next(operator) }" },
  ],
  hierarchy: [
    ['unknown', 'hierarchyAble'],
  ],
  words: {
  },
  priorities: [
    [['questionMark', 0], ['is', 0], ['a', 0]],
  ],
  generators: [
  ],
  semantics: [
    {
      match: ({context, hierarchy, args}) => hierarchy.isA(context.marker, 'is') && context.query && args( { types: ['hierarchyAble', 'hierarchyAble'], properties: ['one', 'two'] } ),
      apply: ({context, api, objects, g}) => {
        const one = context.one
        const two = context.two
        if (!api.conceptExists(objects, one.value)) {
          context.response = {
            verbatim: `I don't know about ${g({ ...one, paraphrase: true})}` 
          }
          return
        }
        if (!api.conceptExists(objects, two.value)) {
          context.response = {
            verbatim: `I don't know about ${g({ ...two, paraphrase: true})}` 
          }
          return
        }
        context.response = {
          verbatim: 'yes'
        }
      }
    },
    {
      notes: 'c is a y',
      match: ({context}) => context.marker == 'unknown' && !context.pullFromContext && !context.wantsValue && context.same && !context.same.pullFromContext && context.same.wantsValue,
      apply: ({context, api, objects}) => {
        // mark c as an instance?
        if (context.unknown) {
          makeObject({config, context})
        }
        if (context.same.unknown) {
          makeObject({config, context: context.same})
        }
        api.rememberIsA(objects, context.value, context.same.value)
        context.sameWasProcessed = true
      },
    },
    {
      notes: 'an x is a y',
      match: ({context}) => context.marker == 'unknown' && !context.pullFromContext && context.wantsValue && context.same,
      apply: ({context, api, objects, config}) => {
        if (context.unknown) {
          makeObject({config, context})
        }
        if (context.same.unknown) {
          makeObject({config, context: context.same})
        }
        api.rememberIsA(objects, context.value, context.same.value) 
        context.sameWasProcessed = true
      }
    },
  ]
};

config = new entodicton.Config(config)
config.api = api
config.add(dialogues)
config.initializer( ({objects}) => {
  objects.parents = {}
  objects.concepts = []
  /*
  objects.parents = {
    "greg": [ "human" ],
  }
  objects.concepts = [ "greg", "human" ]
  */
})

entodicton.knowledgeModule( { 
  module,
  description: 'hierarchy of objects',
  config,
  test: {
    name: './hierarchy.test.json',
    contents: hierarchy_tests
  },
  afterTest: ({query, config}) => {
    if (query == 'a cat is an animal') {
      debugger;
      const wordDef = config.config.words['cat'][0]
      failure = ''
      const expected = {
        id: 'cat',
        initial: '{value: "cat", number: undefined}',
      }
      for (key of Object.keys(expected)) {
        if (wordDef[key] !== expected[key]) {
          failure += `expected ${key} to be "${expected[value]}"\n`
        }
      }
      return failure
    }
  }
})

/* Random design notes
is greg a cat       fx fx    fxx
greg is a cat?
greg is a cat       fx xfi   xfy

is greg a cat joe a human and fred a dog


yfxx


1f00 == fxx -> xf
*/
