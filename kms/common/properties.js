const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const properties_tests = require('./properties.test.json')

//
// duck typing: 
//
//   1. Make your properties instances of 'property' add ['myProperty', 'property'] to the hierarchy
//   2. Make your objects an instance of 'object' add ['myObject', 'object'] to the hierarchy
//   3. Add semantics for getting the value
//        [
//          ({objects, context, args, hierarchy}) => 
//                hierarchy.isA(context.marker, 'property') && 
//                args({ types: ['myObjectType'], properties: ['object'] }) && context.evaluate, 
//          ({objects, context}) => {
//          context.value = "value" // set the value here somehow
//          }
//        ],
//

const api = {
  getObject(objects, object) {
    if (!objects.objects) {
      objects.objects = {}
    }
    if (!objects.objects[object]) {
      objects.objects[object] = {}
    }
    return objects.objects[object]
  },
  getProperty(objects, object, property, g) {
    if (property == 'properties') {
      const objectProps = api.getObject(objects, object)
      const values = []
      debugger;
      for (let key of Object.keys(objectProps)) {
        values.push(`${g(key)}: ${g({ ...objectProps[key], evaluate: true })}`)
      }
      return { marker: 'list', value: values }
    } else {
      return objects.objects[object][property]
    }
  },
  setProperty(objects, object, property, value) {
    api.getObject(objects, object)[property] = value
  },
  knownObject(objects, object) {
    return !!objects.objects[object]
  },
  knownProperty(objects, object) {
    return !!objects.objects[object]
  },
  learnWords(config, context) {
  },
}

let config = {
  name: 'properties',
  operators: [
    "(([property]) <([propertyOf|of] ([object]))>)",
    "(<whose> ([property]))",
    "(<my> ([property]))",
    "(<your> ([property]))",
    "(<(([object]) [possession|])> ([property|]))",
    // the plural of cat is cats what is the plural of cat?
  ],
  hierarchy: [
    ['property', 'queryable'],
    ['object', 'queryable'],
    ['property', 'theAble'],
    ['property', 'unknown'],
    ['object', 'theAble'],
    ['whose', 'object'],
  ],
  bridges: [
    { id: "property", level: 0, bridge: "{ ...next(operator) }" },
    { id: "object", level: 0, bridge: "{ ...next(operator) }" },
    { id: "possession", level: 0, bridge: "{ ...next(operator), object: before[0] }" },
    { id: "possession", level: 1, bridge: "{ ...after[0], object: operator.object, marker: operator('property', 0) }" },
    { id: "propertyOf", level: 0, bridge: "{ ...next(operator), object: after[0] }" },
    { id: "propertyOf", level: 1, bridge: "{ ...before[0], object: operator.object }" },
    { id: "whose", level: 0, bridge: '{ ...after[0], query: true, whose: "whose", modifiers: append(["whose"], after[0].modifiers)}' },
    { id: "your", level: 0, bridge: "{ ...after, subject: 'your' }" },
    { id: "my", level: 0, bridge: "{ ...after, subject: 'my' }" },

  ],
  words: {
    "<<possession>>": [{ id: 'possession', initial: "{ value: 'possession' }" }],
    " 's": [{ id: 'possession', initial: "{ value: 'possession' }" }],
  },
  priorities: [
    [['is', 0], ['possession', 1]],
    [['is', 0], ['my', 0]],
    [['is', 0], ['your', 0]],
    [['is', 0], ['what', 0], ['propertyOf', 0], ['the', 0], ['property', 0]],
    [['is', 0], ['propertyOf', 1]],
    [['propertyOf', 0], ['the', 0]],
    [['the', 0], ['propertyOf', 0], ['property', 0]],
  ],
  generators: [
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'property') && context.object && !context.value && !context.evaluate,
      ({context, g}) => {
        const property = Object.assign({}, context, { object: undefined })
        return `${g(property)} of ${g({ ...context.object, paraphrase: true })}`
      }
    ],
    {
      match: ({context}) => context.paraphrase && context.modifiers && context.object, 
      apply: ({context, g}) => {
               const base = { ...context }
               base.object = undefined;
               // TODO make paraphrase be a default when paraphrasing?
               return `${g(base)} of ${g({...context.object, paraphrase: true})}`
             },
      notes: 'the property of object'
    },
    {
      match: ({context}) => context.paraphrase && !context.modifiers && context.object, 
      apply: ({context, g}) => {
               const base = { ...context }
               base.object = undefined;
               // TODO make paraphrase be a default when paraphrasing?
               return `${g({...context.object, paraphrase: true})}'s ${g(base)}`
             },
      notes: "object's property"
    },
  ],
  semantics: [
    {
      match: ({context}) => context.marker == 'property' && context.same && context.object,
      apply: ({context, objects, api}) => {
        api.setProperty(objects, context.object.value, context.value, context.same)
        context.sameWasProcessed = true
      }
    },
    {
      match: ({context}) => context.marker == 'property' && context.evaluate,
      apply: ({context, api, objects, g}) => {
        const object = context.object.value;
        if (!api.knownObject(objects, object)) {
          context.verbatim = `There is no object named ${g({...context.object, paraphrase: true})}`
          return
        }
        if (!api.knownProperty(objects, object, context.value)) {
          context.verbatim = `There is property no property ${g(context.word)} of ${g({...context.object, paraphrase: true})}`
          return
        }
        context.value = api.getProperty(objects, context.object.value, context.value, g)
        context.object = undefined;
      }
    }
  ]
};

config = new entodicton.Config(config)
config.api = api
config.add(dialogues)
config.initializer( ({objects}) => {
  objects.objects = {
  }
})

entodicton.knowledgeModule( { 
  module,
  description: 'properties of objects',
  config,
  test: {
    name: './properties.test.json',
    contents: properties_tests
  },
})
