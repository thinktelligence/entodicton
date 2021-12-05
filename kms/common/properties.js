const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const properties_tests = require('./properties.test.json')
const pluralize = require('pluralize')

// TODO blue is a colour my eyes are blue what color are my eyes
// TODO for my have a way to set context with current my and its changable
// TODO mccoy is a crew member
// TODO crew member is a type of person
// TODO you are a captain are you a captain
// TODO captain is a type of job
// TODO do you know any captains / who are the captains
// TODO you hate brocoli do you want some brocoli
/*
V1
   "mccoy's rank is doctor",
   "mccoy is a doctor",

   if class is a value of property then class is a type of property

V2
   "mccoy's rank is doctor",
   infer doctor is a type of rank
*/

// your name is greg  -> greg is value
// you are a captain  -> a captain is class

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

// property value has four cases. 
//   Property has known value                           { has: true, value }
//   Property exists but has unknown value              { has: true }
//   Property exists and the object does not have it    { has: false }
//   Property is not know to exist                      undefined
//
//   value is (has, value)

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
        if (objectProps[key].has) {
          values.push(`${g(key)}: ${g({ ...objectProps[key].value, evaluate: true })}`)
        }
      }
      return { marker: 'list', value: values }
    } else {
      return (this.objects.properties[object][property] || {}).value
    }
  }

  hasProperty(object, property, has) {
    this.getObject(object)[property].has
  }

  setProperty(object, property, value, has) {
    this.getObject(object)[property] = {has, value} || undefined
    if (has && value) {
      this.objects.property[property] = (this.objects.property[property] || []).concat(value)
      // "mccoy's rank is doctor",
      // infer doctor is a type of rank
      this.rememberIsA(value.value, property);
    }
    if (!this.objects.concepts.includes(object)) {
      this.objects.concepts.push(object)
    }
  }

  knownObject(object) {
    return !!this.objects.properties[object]
  }

  hasProperty(object, property) {
    if (property == 'properties') {
      return true;
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if (((this.objects.properties[next] || {})[property] || {}).has) {
        return true
      }
      const parents = this.objects.parents[next] || [];
      for (let parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  knownProperty(object, property) {
    if (property == 'properties') {
      return true;
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if ((this.objects.properties[next] || {})[property] !== undefined) {
        return true
      }
      const parents = this.objects.parents[next] || [];
      for (let parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  learnWords(config, context) {
  }
/*
  ensureDefault(map, key, default) {
    if (!this.objects[map][key]) {
      this.objects[map][key] = default
    }
    return this.objects[map][key]
  }

  pushListNoDups(list, value) {
    if (list.includes(value)) {
      return
    }
    list.push(value)
  }

  ensureConcept(concept) {
    ensureDefault(this.properties, concept, {})
    ensureDefault(this.concepts, concept, [])
  }

  canDo(object, ability) {
    this.ensureConcept(object)
    this.pushListNoDups(this.ensureList('abilities', object), ability)
  }
*/
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

    if (!this.objects.properties[child]) {
      this.objects.properties[child] = {}
    }

    if (!this.objects.properties[parent]) {
      this.objects.properties[parent] = {}
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
    "(<objectPrefix|> ([property]))",
    "(<(([object]) [possession|])> ([property|]))",
    "(([object|]) [have|has,have] ([property|]))",
    "(<doesnt|doesnt,dont> ([have/0]))",
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
    ['have', 'canBeDoQuestion'],
    ['have', 'canBeQuestion'],
  ],
  bridges: [
    { id: "doesnt", level: 0, bridge: "{ ...after, negation: true }" },
    { id: "have", level: 0, bridge: "{ ...next(operator), object: before[0], property: after[0] }" },
    { id: "have", level: 1, bridge: "{ ...next(operator) }" },
    { id: "property", level: 0, bridge: "{ ...next(operator) }" },
    { id: "object", level: 0, bridge: "{ ...next(operator) }" },
    { id: "possession", level: 0, bridge: "{ ...next(operator), object: before[0] }" },
    { id: "possession", level: 1, bridge: "{ ...after[0], object: operator.object, marker: operator('property', 0) }" },
    { id: "propertyOf", level: 0, bridge: "{ ...next(operator), object: after[0] }" },
    { id: "propertyOf", level: 1, bridge: "{ ...before[0], object: operator.object }" },
    { id: "whose", level: 0, bridge: '{ ...after[0], query: true, whose: "whose", modifiers: append(["whose"], after[0].modifiers)}' },
    { id: "objectPrefix", level: 0, bridge: '{ ...after[0], object: operator }' },
  ],
  words: {
    "<<possession>>": [{ id: 'possession', initial: "{ value: 'possession' }" }],
    " 's": [{ id: 'possession', initial: "{ value: 'possession' }" }],
    "have": [{ id: 'have', initial: "{ doesable: true }" }],
    // "my": [{ id: 'objectPrefix', initial: "{ value: 'other' }" }],
    // "your": [{ id: 'objectPrefix', initial: "{ value: 'self' }" }],
  },
  priorities: [
    [['have', 0], ['a', 0]],
    [['does', 0], ['have', 0]],
    [['does', 0], ['have', 1]],
    [['is', 0], ['possession', 0], ['propertyOf', 0], ['what', 0]],
    [['is', 0], ['possession', 1]],
    [['is', 0], ['objectPrefix', 0]],
    [['is', 0], ['what', 0], ['propertyOf', 0], ['the', 0], ['property', 0]],
    [['is', 0], ['propertyOf', 1]],
    [['propertyOf', 0], ['the', 0]],
    [['the', 0], ['propertyOf', 0], ['property', 0]],
    [['questionMark', 0], ['have', 0]],
    [['questionMark', 0], ['have', 1], ['is', 1], ['have', 0]],
    [['is', 0], ['objectPrefix', 0], ['what', 0]],
  ],
  generators: [
    {
      match: ({context}) => context.marker == 'objectPrefix' && context.value == 'other' && context.paraphrase,
      apply: ({context}) => `my`
    },
    {
      match: ({context}) => context.marker == 'objectPrefix' && context.value == 'other',
      apply: ({context}) => `your`
    },
    {
      match: ({context}) => context.marker == 'objectPrefix' && context.value == 'self' && context.paraphrase,
      apply: ({context}) => `your`
    },
    {
      match: ({context}) => context.marker == 'objectPrefix' && context.value == 'self',
      apply: ({context}) => `my`
    },
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'have') && context.paraphrase && context.negation,
      ({context, g}) => {
        /*
        let query = ''
        if (context.query) {
          query = "?"
        }
        return `${g(context.object)} ${context.word} ${g(context.property)}${query}`
        */
        return `${g(context.object)} doesnt ${context.word} ${g(context.property)}`
      }
    ],
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'have') && context.paraphrase && context.query,
      ({context, g}) => {
        /*
        let query = ''
        if (context.query) {
          query = "?"
        }
        return `${g(context.object)} ${context.word} ${g(context.property)}${query}`
        */
        return `does ${g(context.object)} ${context.word} ${g(context.property)}`
      }
    ],
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'have') && context.paraphrase && !context.query,
      ({context, g}) => {
        return `${g(context.object)} ${context.word} ${g(context.property)}`
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

               if (context.object.marker == 'objectPrefix') {
                 return `${g(context.object)} ${g(base)}`
               } else {
                 // TODO make paraphrase be a default when paraphrasing?
                 return `${g(base)} of ${g({...context.object, paraphrase: true})}`
               }
             },
      notes: 'the property of object'
    },
    {
      match: ({context}) => context.paraphrase && !context.modifiers && context.object, 
      apply: ({context, g}) => {
               const base = { ...context }
               base.object = undefined; // TODO make paraphrase be a default when paraphrasing?
               if (context.object.marker == 'objectPrefix') {
                 return `${g(context.object)} ${g(base)}`
               } else {
                 return `${g({...context.object, paraphrase: true})}'s ${g(base)}`
               }
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
        if (context.negation) {
          api.setProperty(pluralize.singular(context.object.value), pluralize.singular(context.property.value), null, false)
        } else {
          api.setProperty(pluralize.singular(context.object.value), pluralize.singular(context.property.value), null, true)
        }
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
        if (!api.hasProperty(object, property)) {
          context.response = {
            marker: 'yesno', 
            value: false,
          }
        } else {
          context.response = {
            marker: 'yesno', 
            value: true,
          }
          return
        }
      }
    },
    {
      notes: 'set the property of an object',
      match: ({context}) => context.marker == 'property' && context.same && context.object,
      apply: ({context, objects, api}) => {
        api.setProperty(context.object.value, context.value, context.same, true)
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
  // object -> property -> {has, value}
  objects.properties = {}
  // property -> values
  objects.property = {}
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
