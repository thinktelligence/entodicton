const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const properties_tests = require('./properties.test.json')
const pluralize = require('pluralize')

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

class API {

  getObject(object) {
    if (!this.objects.properties) {
      this.objects.properties = {}
    }
    if (!this.objects.properties[object]) {
      this.objects.properties[object] = {}
    }
    return this.objects.properties[object]
  }

  getProperty(object, property, g) {
    if (property == 'properties') {
      const objectProps = this.getObject(object)
      const values = []
      for (let key of Object.keys(objectProps)) {
        values.push(`${g(key)}: ${g({ ...objectProps[key], evaluate: true })}`)
      }
      return { marker: 'list', value: values }
    } else {
      return this.objects.properties[object][property]
    }
  }

  setProperty(object, property, value) {
    this.getObject(object)[property] = value || null
  }

  knownObject(object) {
    return !!this.objects.properties[object]
  }

  knownProperty(object, property) {
    if (property == 'properties') {
      return true;
    }
    return !!this.objects.properties[object][property]
  }

  learnWords(config, context) {
  }

  isA(child, parent) {
    return this.objects.parents[child].includes(parent);
  }

  rememberIsA(child, parent) {
    if (!this.objects.parents[child]) {
      this.objects.parents[child] = []
    }
    if (!this.objects.parents[child].includes(parent)) {
      this.objects.parents[child].push(parent)
    }

    if (!this.objects.children[parent]) {
      this.objects.children[parent] = []
    }
    if (!this.objects.children[parent].includes(child)) {
      this.objects.children[parent].push(child)
    }

    if (!this.objects.concepts.includes(child)) {
      this.objects.concepts.push(child)
    }
    if (!this.objects.concepts.includes(parent)) {
      this.objects.concepts.push(parent)
    }
  }

  children(parent) {
    return this.objects.children[parent]
  }

  conceptExists(concept) {
    return this.objects.concepts.includes(concept)
  }

}
const api = new API();

let config = {
  name: 'properties',
  operators: [
    "(([property]) <([propertyOf|of] ([object]))>)",
    "(<whose> ([property]))",
    "(<my> ([property]))",
    "(<your> ([property]))",
    "(<(([object]) [possession|])> ([property|]))",
    "(([object|]) [have|has,have] ([property|]))",
    "(([have/1]) <questionMark|>)",
    // the plural of cat is cats what is the plural of cat?
    // does greg have ears (yes) greg does not have ears does greg have ears (no)
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
    { id: "have", level: 0, bridge: "{ ...next(operator), object: before[0], property: after[0] }" },
    { id: "have", level: 1, bridge: "{ ...next(operator) }" },
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
    "have": [{ id: 'have', initial: "{ doesable: true }" }],
  },
  priorities: [
    [['is', 0], ['possession', 0], ['propertyOf', 0], ['what', 0]],
    [['is', 0], ['possession', 1]],
    [['is', 0], ['my', 0]],
    [['is', 0], ['your', 0]],
    [['is', 0], ['what', 0], ['propertyOf', 0], ['the', 0], ['property', 0]],
    [['is', 0], ['propertyOf', 1]],
    [['propertyOf', 0], ['the', 0]],
    [['the', 0], ['propertyOf', 0], ['property', 0]],
    [['questionMark', 0], ['have', 0]],
  ],
  generators: [
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'have') && context.paraphrase,
      ({context, g}) => {
        let query = ''
        if (context.query) {
          query = "?"
        }
        return `${g(context.object)} ${context.word} ${g(context.property)}${query}`
      }
    ],
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
    /*
        "objects": {
        "greg": {
          "age": {
            "marker": "unknown",
            "types": [
              "unknown"
            ],
            "unknown": true,
            "value": "23",
            "word": "23",
            "response": true
          }
        }
    */
    {
      notes: 'greg has eyes',
      match: ({context}) => context.marker == 'have' && !context.query,
      apply: ({context, objects, api}) => {
        api.setProperty(pluralize.singular(context.object.value), pluralize.singular(context.property.value))
        context.sameWasProcessed = true
      }
    },
    {
      notes: 'greg has eyes?',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'have') && context.query,
      apply: ({context, g, api, objects}) => {
        const object = pluralize.singular(context.object.value);
        const property = pluralize.singular(context.property.value);
        context.response = true
        if (!api.knownObject(object)) {
          context.verbatim = `There is no object named ${g({...context.object, paraphrase: true})}`
          return
        }
        if (!api.knownProperty(object, property)) {
          context.verbatim = 'No'
          return
        } else {
          context.verbatim = 'Yes'
          return
        }
      }
    },
    {
      match: ({context}) => context.marker == 'property' && context.same && context.object,
      apply: ({context, objects, api}) => {
        api.setProperty(context.object.value, context.value, context.same)
        context.sameWasProcessed = true
      }
    },
    {
      match: ({context}) => context.marker == 'property' && context.evaluate,
      apply: ({context, api, objects, g}) => {
        const object = context.object.value;
        if (!api.knownObject(object)) {
          context.verbatim = `There is no object named ${g({...context.object, paraphrase: true})}`
          return
        }
        if (!api.knownProperty(object, context.value)) {
          context.verbatim = `There is property no property ${g(context.word)} of ${g({...context.object, paraphrase: true})}`
          return
        }
        context.value = api.getProperty(context.object.value, context.value, g)
        context.object = undefined;
      }
    }
  ]
};

config = new entodicton.Config(config)
config.api = api
config.add(dialogues)
config.initializer( ({objects}) => {
  objects.concepts = []
  objects.properties = {}
  objects.parents = {}
  objects.children = {}
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
