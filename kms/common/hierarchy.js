const entodicton = require('entodicton')
const properties = require('./properties')
const hierarchy_tests = require('./hierarchy.test.json')
const pluralize = require('pluralize')

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
      notes: 'types of type',
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
