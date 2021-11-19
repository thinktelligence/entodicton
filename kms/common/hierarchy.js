const entodicton = require('entodicton')
const properties = require('./properties')
const hierarchy_tests = require('./hierarchy.test.json')
const pluralize = require('pluralize')

// word is for one or many
const makeObject = ({config, context}) => {
  const { word, value, number } = context;
  const concept = pluralize.singular(value)
  config.addOperator(`([${concept}])`)
  config.addBridge({ id: concept, level: 0, bridge: "{ ...next(operator) }" })
  
  const addConcept = (word, number) => {
    config.addWord(word, { id: concept, initial: `{ value: "${concept}", number: "${number}" }` } )
    config.addHierarchy(concept, 'theAble')
    config.addHierarchy(concept, 'queryable')
    config.addHierarchy(concept, 'hierarchyAble')
    config.addHierarchy(concept, 'object')
    config.addGenerator({
        match: ({context}) => context.value == concept && context.number == number && context.paraphrase,
        apply: () => word
    })
  }

  if (pluralize.isSingular(word)) {
    addConcept(word, 'one')
    addConcept(pluralize.plural(word), 'many')
  } else {
    addConcept(pluralize.singular(word), 'one')
    addConcept(word, 'many')
  }

  // mark greg as an instance?
  // add a generator for the other one what will ask what is the plural or singluar of known
  /*
  if (number == 'many') {
  } else if (number == 'one') {
  }
  */
  return concept;
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

    if (!objects.children[parent]) {
      objects.children[parent] = []
    }
    if (!objects.children[parent].includes(child)) {
      objects.children[parent].push(child)
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
    "([type|type,types])",
  ],
  hierarchy: [
    ['type', 'property'],
    ['have', 'canBeQuestion'],
  ],
  bridges: [
    { id: 'hierarchyAble', level: 0, bridge: "{ ...next(operator) }" },
    { id: 'type', level: 0, bridge: "{ ...next(operator) }" },
  ],
  hierarchy: [
    ['unknown', 'hierarchyAble'],
    ['hierarchyAble', 'queryable'],
    ['type', 'property'],
  ],
  words: {
  },
  priorities: [
    [['questionMark', 0], ['is', 0], ['a', 0]],
    [['is', 0], ['hierarchyAble', 0]],
    [['a', 0], ['is', 0], ['hierarchyAble', 0]],
  ],
  generators: [
  ],
  semantics: [
    {
      notes: 'is x y',
      match: ({context, hierarchy, args}) => hierarchy.isA(context.marker, 'is') && context.query && args( { types: ['hierarchyAble', 'hierarchyAble'], properties: ['one', 'two'] } ),
      apply: ({context, km, objects, g}) => {
        const api = km('properties').api
        const one = context.one
        const two = context.two
        if (!api.conceptExists(objects, pluralize.singular(one.value))) {
          debugger;
          context.response = {
            verbatim: `I don't know about ${g({ ...one, paraphrase: true})}` 
          }
          return
        }
        if (!api.conceptExists(objects, pluralize.singular(two.value))) {
          debugger;
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
      match: ({context, listable}) => listable(context.marker, 'unknown') && !context.pullFromContext && !context.wantsValue && context.same && !context.same.pullFromContext && context.same.wantsValue,
      apply: ({context, km, objects, asList}) => {
        const api = km('properties').api
        // mark c as an instance?
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            if (context.unknown) {
              oneConcept = makeObject({config, context})
            }
            if (context.same.unknown) {
              twoConcept = makeObject({config, context: context.same})
            }
            api.rememberIsA(objects, oneConcept, twoConcept)
          }
        }
        context.sameWasProcessed = true
      },
    },
    {
      notes: 'an x is a y',
      match: ({context, listable}) => listable(context.marker, 'unknown') && !context.pullFromContext && context.wantsValue && context.same,
      apply: ({context, km, objects, config, asList}) => {
        const api = km('properties').api
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            if (context.unknown) {
              oneConcept = makeObject({config, context})
            }
            if (context.same.unknown) {
              twoConcept = makeObject({config, context: context.same})
            }
            api.rememberIsA(objects, oneConcept, twoConcept) 
            context.sameWasProcessed = true
          }
        }
      }
    },
    {
      notes: 'humans are mammels',
      // match: ({context, listable}) => listable(context, 'unknown') && context.same,
      match: ({context, listable}) => {
        if (context.marker == 'list') {
          listable(context, 'unknown')
        }
        return listable(context, 'unknown') && context.same
      },
      apply: ({objects, km, context, asList, listable}) => {
        const api = km('properties').api
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            if (oneConcept.unknown) {
              oneConcept = makeObject({config, context: oneConcept})
            } else {
              oneConcept = oneConcept.value;
            }
            if (twoConcept.unknown) {
              twoConcept = makeObject({config, context: twoConcept})
            } else {
              twoConcept = twoConcept.value;
            }
            api.rememberIsA(objects, oneConcept, twoConcept)
            context.sameWasProcessed = true
          }
        }
      }
    },

    // 'types of type'
    {
      notes: 'types of type',
      match: ({context}) => context.marker == 'type' && context.evaluate && context.object,
      apply: ({context, objects, gs}) => {
        const type = pluralize.singular(context.object.value);
        context.value = gs(objects.children[type].map( (t) => pluralize.plural(t) ), ', ', ' and ')
      }
    },
  ]
};

config = new entodicton.Config(config)
config.api = api
config.add(properties)
config.initializer( ({objects}) => {
  objects.parents = {}
  objects.children = {}
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
      const wordDef = config.config.words['cat'][0]
      failure = ''
      const expected = {
        id: 'cat',
        initial: '{ value: "cat", number: "one" }',
      }
      for (key of Object.keys(expected)) {
        if (wordDef[key] !== expected[key]) {
          failure += `expected ${key} to be "${expected[expected]}"\n`
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

cats and dogs are animals

1f00 == fxx -> xf
*/
