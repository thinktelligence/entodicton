const entodicton = require('entodicton')
const properties = require('./properties')
const hierarchy_tests = require('./hierarchy.test.json')
const pluralize = require('pluralize')
const _ = require('lodash')
const { isMany } = require('./helpers')

const getTypes = ( km, concept, instance ) => {
  const propertiesAPI = km('properties').api;
  const digraph = propertiesAPI.digraph;
  const intersect = (set1, set2) => {
    return new Set([...set1].filter(x => set2.has(x)))
  }
  const descendants = digraph.descendants(concept.value)
  const ancestors = digraph.ancestors(instance.value)
  const common = intersect(ancestors, descendants)
  const answer = Array.from(digraph.minima(common))
  const words = answer.map( (value) => propertiesAPI.getWordForValue(value) )
  for (const word of words) {
    word.paraphrase = true
  }
  instance = {
    marker: 'list', 
    value: words,
    paraphrase: true,
  }
  instance.focus = true
  return instance
}

// TODO the types of rank are x y z ....
// TODO x is a kind of y
let config = {
  name: 'hierarchy',
  operators: [
    // "([hierarchyAble|])",
    "([type|type,types])",
  ],
  bridges: [
    // // { id: 'hierarchyAble', level: 0, bridge: "{ ...next(operator) }" },
    { id: 'type', level: 0, bridge: "{ ...next(operator), value: 'type' }" },
  ],
  hierarchy: [
    // ['unknown', 'hierarchyAble'],
    // ['hierarchyAble', 'queryable'],
    ['type', 'property'],
    ['type', 'whatAble'],
    ['have', 'canBeQuestion'],
    ['have', 'canBeDoQuestion'],
  ],
  priorities: [
    [['questionMark', 0], ['is', 0], ['a', 0]],
    // [['is', 0], ['hierarchyAble', 0]],
    // [['a', 0], ['is', 0], ['hierarchyAble', 0]],
  ],
  semantics: [
    {
      notes: 'what type is pikachu',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query && !['what'].includes(context.one.marker) && !['what'].includes(context.two.marker) && (context.one.query || context.two.query),
      apply: ({context, hierarchy, km, log, s}) => {
        const one = context.one;
        const two = context.two;
        let concept, value;
        if (one.query) {
          concept = one;
          value = two;
        } else {
          concept = two;
          value = one;
        }
        let instance = km('dialogues').api.evaluate(value, context, log, s)
        if (instance.verbatim) {
          context.response = { verbatim: instance.verbatim }
          return
        }
        instance = getTypes(km, concept, instance )

        // instance.focusable = ['one', 'two']
        // concept = JSON.parse(JSON.stringify(value)) 
        // greg
        concept = _.cloneDeep(value)
        concept.isQuery = undefined

        if (true) {
          const many = isMany(concept) || isMany(instance)
          const response = {
            "default": true,
            "marker": "is",
            "one": concept,
            "two": instance,
            "focusable": ['two', 'one'],
            "word": many ? "are" : "is",
            "number": many ? "many" : undefined,
          }
          context.response = response
        } else {
          context.response = {
            isResponse: true,
            instance,
            concept,
          }
        }
      },
    },
    {
      // type of pikachu        what is the type of pikachu -> this one
      // name of pikachu        what is the name of pikachu -> properties
      // types of job           what are the types of animals -> next one
      notes: 'type of pikachu',  // the types of type is the next one
      match: ({context}) => context.marker == 'type' && context.evaluate && context.object && context.objects[context.objects.length-1].number == 'one' && pluralize.isSingular(context.objects[0].word),
      apply: ({context, objects, gs, km, log, s}) => {
        const concept = context.objects[0];
        const value = context.objects[1];
        let instance = km('dialogues').api.evaluate(value, context, log, s)
        if (instance.verbatim) {
          context.response = { verbatim: instance.verbatim }
          return
        }
        instance = getTypes(km, concept, instance)
        context.value = instance
        context.evaluateWasProcessed = true
        if (context.value.value.length > 1) {
          context.number = 'many'
        }
      }
    },

    {
      notes: 'is x y',
      // debug: 'call2',
      match: ({context, hierarchy, args}) => hierarchy.isA(context.marker, 'is') && context.query && args( { types: ['hierarchyAble', 'hierarchyAble'], properties: ['one', 'two'] } ),
      apply: ({context, km, objects, g}) => {
        const api = km('properties').api
        const one = context.one
        const two = context.two
        const oneId = pluralize.singular(one.value);
        if (!api.conceptExists(oneId)) {
          context.response = {
            verbatim: `I don't know about ${g({ ...one, paraphrase: true})}` 
          }
          return
        }
        const twoId = pluralize.singular(two.value);
        if (!api.conceptExists(twoId)) {
          context.response = {
            verbatim: `I don't know about ${g({ ...two, paraphrase: true})}` 
          }
          return
        }
        context.response = {
          marker: 'yesno',
          value: api.isA(oneId, twoId)
        }
      }
    },
    {
      notes: 'c is a y',
      match: ({context, listable}) => listable(context.marker, 'hierarchyAble') && !context.pullFromContext && !context.wantsValue && context.same && !context.same.pullFromContext && context.same.wantsValue,
      apply: ({context, km, objects, asList}) => {
        const api = km('properties').api
        // mark c as an instance?
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            oneConcept = api.makeObject({config, context})
            twoConcept = api.makeObject({config, context: context.same})
            api.rememberIsA(oneConcept, twoConcept)
          }
        }
        context.sameWasProcessed = true
      },
    },
    {
      notes: 'an x is a y',
      match: ({context, listable}) => listable(context.marker, 'hierarchyAble') && !context.pullFromContext && context.wantsValue && context.same,
      apply: ({context, km, objects, config, asList}) => {
        const api = km('properties').api
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            oneConcept = api.makeObject({config, context})
            twoConcept = api.makeObject({config, context: context.same})
            api.rememberIsA(oneConcept, twoConcept) 
            context.sameWasProcessed = true
          }
        }
      }
    },
    {
      notes: 'humans are mammels',
      // match: ({context, listable}) => listable(context, 'unknown') && context.same,
      match: ({context, listable, hierarchy}) => {
        /*
        if (context.marker == 'list') {
          listable(context, 'unknown')
        }
        */
        // TODO some generalizaton for this? maybe canInstanceOfClass + canBeClass
        // greg
        //if ((context.marker === 'property') || ((context.same||{}).marker === 'readonly')) {
        //if ((hierarchy.isA(context.marker, 'property') && context.wantsValue && context.same)|| ((context.same||{}).marker === 'readonly')) {
        if ((hierarchy.isA(context.marker, 'property') && context.same && context.objects)|| ((context.same||{}).marker === 'readonly')) {
          return;
        }

        if (context.same && pluralize.isPlural(context.same.word)) {
          context.same.concept = true;
        }
        
        if (context.same && pluralize.isSingular(context.same.word)) {
          context.same.concept = true;
        }
       
        return listable(context, 'hierarchyAble') && context.same && context.same.concept && !context.query
      },
      apply: ({config, objects, km, context, asList, listable}) => {
        const api = km('properties').api
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            oneConcept = api.makeObject({config, context: oneConcept})
            twoConcept = api.makeObject({config, context: twoConcept})
            api.rememberIsA(oneConcept, twoConcept)
            context.sameWasProcessed = true
          }
        }
      }
    },
    // 'types of type'
    {
      // type of pikachu
      // types of job
      notes: 'types of type', // what are the types of animals
      match: ({context}) => context.marker == 'type' && context.evaluate && context.object,
      apply: ({context, objects, gs, km}) => {
        const api = km('properties').api
        const type = pluralize.singular(context.object.value);
        const children = api.children(type)
        const values = children.map( (t) => api.getWordForValue(t, { number: 'many'}))
        context.value = {
          marker: 'list',
          value: values,
        }
        if (children.length > 1) {
          context.number = 'many'
        }
        context.evaluateWasProcessed = true
      }
    },
  ]
};

config = new entodicton.Config(config, module)
config.add(properties)

entodicton.knowledgeModule( { 
  module,
  description: 'hierarchy of objects',
  config,
  test: {
    name: './hierarchy.test.json',
    contents: hierarchy_tests,
    includes: {
      words: true,
    }
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
