const entodicton = require('entodicton')
const dialogues = require('./dialogues')
const properties_instance = require('./properties.instance.json')
const properties_tests = require('./properties.test.json')
const { API } = require('./helpers/properties')
const pluralize = require('pluralize')

// TODO blue is a colour my eyes are blue what color are my eyes
// TODO for my have a way to set context with current my and its changable
// TODO crew member is a type of person
// TODO captain is a type of job
// TODO do you know any captains / who are the captains
// TODO you hate brocoli do you want some brocoli
//
// TODO the photon torpedoes are armed <- have a learning mode which is more flexible?
// TODO mccoy is a crew member
// TODO status can be armed or not armed (only)
// TODO my -> have a dialog thing
// TODO pretend you are spock what is your name stop pretending what is your name
// TODO who are the crew members / who are they
// TODO the/a means put it in the context for reference
// TODO the crew members are sss                abc are crew members
// TODO who are they / what are they
// TODO kirk: are you a captain
// TODO macro for verb forms -> arm x | go to y | i like x
// TODO READONLY
// TODO pokemon what is the attack/i own a pikachu/ what do i own
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

const template = {
  fragments: [
    "the property1 of object1 is value1",
  ],
}

const api = new API();

let config = {
  name: 'properties',
  operators: [
    "(([property]) <([propertyOf|of] ([object]))>)",
    "(<whose> ([property]))",
    "([concept])", 
    "((modifier) [modifies] (concept))", 
    "([readonly])", 
    "([readonly])", 
    "(<objectPrefix|> ([property]))",
    "(<(([object]) [possession|])> ([property|]))",
    "(([object|]) [have|has,have] ([property|]))",
    "(<doesnt|doesnt,dont> ([have/0]))",
    "(([have/1]) <questionMark|>)",
    // the plural of cat is cats what is the plural of cat?
    // does greg have ears (yes) greg does not have ears does greg have ears (no)
  ],
  /*
    [('is', 0), ('property', 0)]-('property', 0)


    got from -> 
    ['property', 'queryable']
    "(([queryable]) [is|is,are] ([queryable|]))"

    <> implies output is property/1 so that should be used to put propertyOf/0 below property/1
    "(([property]) <([propertyOf|of] ([object]))>)",
  */
  hierarchy: [
    ['readonly', 'queryable'],
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
    { id: "modifies", level: 0, bridge: "{ ...next(operator), modifier: before[0], concept: after[0] }" },
    { id: "readonly", level: 0, bridge: "{ ...next(operator) }" },
    { id: "concept", level: 0, bridge: "{ ...next(operator) }" },
    { id: "doesnt", level: 0, bridge: "{ ...context, negation: true }*" },
    { id: "have", level: 0, bridge: "{ ...next(operator), object: before[0], property: after[0], do: { left: 'object', right: 'property' } }" },
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
    [['have', 1], ['does', 0]],
    [['does', 0], ['have', 0], ['doesnt', 0]],
    [['is', 0], ['propertyOf', 0], ['not', 0]],
    [['is', 0], ['questionMark', 0], ['objectPrefix', 0]],
    [['is', 0], ['questionMark', 0], ['possession', 0]],
    [['is', 0], ['questionMark', 0], ['possession', 1]],
    [['have', 0], ['a', 0]],
    [['does', 0], ['have', 0]],
    // [['does', 0], ['have', 1]],
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
      match: ({context}) => context.marker == 'modifies' && context.paraphrase,
      apply: ({context}) => `${context.modifier.word} modifies ${context.concept.word}`,
    },
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
    {
      notes: 'negative do questions',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeDoQuestion') && context.paraphrase && context.negation,
      apply: ({context, g}) => {
        /*
        let query = ''
        if (context.query) {
          query = "?"
        }
        return `${g(context.object)} ${context.word} ${g(context.property)}${query}`
        */
        return `${g(context[context.do.left])} doesnt ${context.word} ${g(context[context.do.right])}`
      },
    },
    {
      notes: 'do questions',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeDoQuestion') && context.paraphrase && context.query,
      apply: ({context, g}) => {
        const right = context['do'].right
        if (context[right].query) {
            const left = context['do'].left
            return `${g(context[right])} does ${g(context[left])} ${context.word}`
        } else {
          return `does ${g(context[context.do.left])} ${context.word} ${g(context[context.do.right])}`
        }
      },
    },
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeDoQuestion') && context.paraphrase && !context.query,
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
      notes: 'the property of object',
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
    {
      notes: 'define a modifier',
      tests: [
        'chicken modifies strips',
      ],
      match: ({context}) => context.marker == 'modifies',
      apply: ({config, km, context}) => {
        debugger;
        km('properties').api.kindOfConcept({ config, modifier: context.modifier.value, object: context.concept.value })
      }
    },
    {
      notes: 'marking something as readonly',
      match: ({context}) => context.marker == 'readonly' && context.same,
      apply: ({context, km, objects}) => {
        km('properties').api.setReadOnly([context.same.value]) 
        context.sameWasProcessed = true
      }
    },
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
      notes: 'crew members. evaluate a concepts to get instances',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'concept') && context.evaluate,
      apply: ({context, objects, api}) => {
        context.value = { 
          marker: 'list', 
          value: api.objects.children[context.marker]
        }
        context.evaluateWasProcessed = true
      }
    },
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
      apply: ({context, objects, km, api}) => {
        const objectContext = context.object;
        const propertyContext = context;
        const objectId = context.object.value
        const propertyId = context.value
        try{
          api.setProperty(pluralize.singular(objectId), pluralize.singular(propertyId), context.same, true)
          context.sameWasProcessed = true
        } catch (e) {
          debugger;
          const config = km('properties')
          const fragment = config.fragment("the property1 of object1 is value1")
          const value = api.getProperty(objectId, propertyId)
          if (value.value == context.same.value) {
            context.response = [
              { marker: 'yesno', value: true, paraphrase: true },
            ]
            context.sameWasProcessed = true
          } else {
            const mappings = [
              {
                match: ({context}) => context.value == 'property1',
                apply: ({context}) => Object.assign(context, { word: propertyContext.word, value: propertyContext.value, paraphrase: true }),
              },
              {
                match: ({context}) => context.value == 'object1',
                apply: ({context}) => {
                  Object.assign(context, { word: objectContext.word, value: objectContext.value, paraphrase: true })
                },
              },
              {
                match: ({context}) => context.value == 'value1',
                apply: ({context}) => Object.assign(context, value),
              },
            ]
            // run the query 'the property of object' then copy that here and template it
            context.response = { 
              verbatim: "no way hose" 
            }
            context.response = [
              { marker: 'yesno', value: false, paraphrase: true },
            ]
            context.response = context.response.concat(fragment.instantiate(mappings))
            context.response.forEach( (r) => r.paraphrase = true )
            context.sameWasProcessed = true
          }
        }
      }
    },
    {
      match: ({context}) => context.marker == 'property' && context.evaluate,
      apply: ({context, api, km, objects, g}) => {
        const object = km("dialogues").api.getVariable(context.object.value);
        if (!api.knownObject(object)) {
          context.verbatim = `There is no object named ${g({...context.object, paraphrase: true})}`
          return
        }
        if (!api.knownProperty(object, context.value)) {
          context.verbatim = `There is no property ${g(context.word)} of ${g({...context.object, paraphrase: true})}`
          return
        }
        context.value = api.getProperty(km("dialogues").api.getVariable(context.object.value), context.value, g)
        context.evaluateWasProcessed = true;
        context.object = undefined;
      }
    }
  ]
};

config = new entodicton.Config(config)
config.api = api
config.add(dialogues)
/*
config.initializer( ({objects, api}) => {
  api.initialize(objects)
})
*/
config.load(template, properties_instance)

entodicton.knowledgeModule( { 
  module,
  description: 'properties of objects',
  config,
  test: {
    name: './properties.test.json',
    contents: properties_tests,
    include: {
      words: true,
      operators: true,
      bridges: true,
    }
  },
})
