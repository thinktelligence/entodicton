const entodicton = require('entodicton')
const dialogues_tests = require('./dialogues.test.json')

const api = {
  //
  // duck typing: for operators you want to use here
  //
  //   1. Use hierarchy to make them an instance of queryable. For example add hierarchy entry [<myClassId>, 'queryable']
  //   2. For semantics, if evaluate == true then set value to the 'value' property of the operator to the value.
  //   3. Generators will get contexts with 'response: true' set. Used for converting 'your' to 'my' to phrases like 'your car' or 'the car'.
  //   4. Generators will get contexts with 'instance: true' and value set. For converting values like a date to a string.
  //

  // used with context sensitive words like 'it', 'that' etc. for example if you have a sentence "create a tank"
  // then call mentioned with the tank created. Then if one asks 'what is it' the 'it' will be found to be the tank.
  mentioned: (concept) => {
  }
}
// TODO implement what / what did you say ...
let config = {
  name: 'dialogues',
  operators: [
    "(([queryable]) [is] ([queryable|]))",
    "([it])",
    "([what])",
    "(<the|> ([theAble|]))",
    "(<a> ([theAble|]))",
    //"arm them, what, the phasers"
    //greg is a first name

    "(([theAble|]) [list|and] ([theAble|]))",
  ],
  bridges: [
    {id: "list", level: 0, selector: {match: "same", type: "infix", passthrough: true}, bridge: "{ ...next(operator), value: append(before, after) }"},
    {id: "list", level: 1, selector: {match: "same", type: "postfix", passthrough: true}, bridge: "{ ...operator, value: append(before, operator.value) }"},

    { id: "what", level: 0, bridge: "{ ...next(operator), query: true, determined: true }" },
    { id: "queryable", level: 0, bridge: "{ ...next(operator) }" },
    { id: "is", level: 0, bridge: "{ ...next(operator), one: before[0], two: after[0] }" },

    // { id: "the", level: 0, bridge: "{ ...after[0], pullFromContext: true }" },
    { id: 'the', level: 0, bridge: '{ ...after[0], pullFromContext: true, determiner: "the", modifiers: append(["determiner"], after[0].modifiers)}' },
    { id: "a", level: 0, bridge: "{ ...after[0], unspecified: true }" },
    { id: "theAble", level: 0, bridge: "{ ...next(operator) }" },

    // TODO make this hierarchy thing work
    { id: "it", level: 0, hierarchy: ['queryable'], bridge: "{ ...next(operator), pullFromContext: true, determined: true }" },
  ],
  words: {
    "the": [{"id": "the", "initial": "{ modifiers: [] }" }],
  },

  floaters: ['query'],
  priorities: [
    [["is",0],["the",0]],
    [["is",0],["a",0]],
  ],
  hierarchy: [
    ['it', 'queryable'],
    ['what', 'queryable'],
  ],
  debug: false,
  version: '3',
  generators: [
    /*
     * modifiers = <list of properties>
     */
    [
      ({context}) => context.paraphrase && context.modifiers,
      ({context, g}) => {
        const text = []
        for (modifier of context.modifiers) {
          text.push(g(context[modifier]))
        }
        text.push(context.word)
        return text.join(' ')
      }
    ],

    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && !context.paraphrase && context.value,
      ({context}) => context.value
    ],
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.response && context.subject == 'my',
      ({context}) => `your ${context.word}`
    ],
    [ 
      ({context, hierarchy}) => ['it', 'what'].includes(context.marker) && context.paraphrase, 
      ({g, context}) => `${context.marker}`
    ],
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.response && context.subject == 'your',
      ({context}) => `my ${context.word}`
    ],
    [ 
      ({context, hierarchy}) => ['my', 'your'].includes(context.subject) && hierarchy.isA(context.marker, 'queryable') && context.paraphrase, 
      ({g, context}) => `${context.subject} ${context.marker}`
    ],
    [ 
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'theAble') && context.paraphrase && context.unspecified && !context.determined, 
      ({g, context}) => `a ${context.word}`
    ],
    [ 
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'theAble') && context.paraphrase && !context.determined, 
      ({g, context}) => `the ${context.word}`
    ],
    [ 
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'theAble') && context.response && !context.value && !context.determined, 
      ({g, context}) => `the ${context.marker}`
    ],
    /*
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.response && context.subject == 'your',
      ({context}) => `my ${context.word}`
    ],
    */
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.subject,
      ({context}) => `${context.subject} ${context.word}`
    ],
    [ 
      ({context}) => context.marker == 'unknown', 
      ({context}) => {
        if (typeof context.marker === 'string') {
          return context.value
        } else {
          JSON.stringify(context.value)
        }
      }
    ],
    [ 
      ({context}) => context.marker == 'what' && (context.response || context.paraphrase), 
      ({context}) => `what` 
    ],
    [ 
      ({context}) => context.marker == 'it' && !context.isQuery && !context.instance, 
      ({context}) => `it` 
    ],
    [ 
      ({context}) => context.marker == 'it' && !context.isQuery && context.instance, 
      ({context}) => context.value
    ],
    [ 
      ({context}) => context.marker == 'name' && !context.isQuery && context.subject, 
      ({context}) => `${context.subject} ${context.word}` 
    ],
    [ 
      ({context}) => context.marker == 'is' && context.paraphrase,
      ({context, g}) => {
        context.one.response = true
        context.two.response = true
        return `${g(context.one)} is ${g(context.two)}` 
      }
    ],
    [ 
      ({context}) => context.marker == 'is' && context.response,
      ({context, g}) => {
        const response = context.response;
        const concept = response.concept;
        concept.response = true
        const instance = g(response.instance)
        return `${g(concept)} is ${instance}` 
      }
    ],
    [ 
      ({context}) => context.marker == 'is' && !context.response,
      ({context, g}) => {
        return `${g(context.one)} is ${g(context.two)}`
      }
    ],

    // defaults
    [
      ({context}) => context.paraphrase,
      ({context}) => `${context.word}` 
    ],

    [
      ({context}) => context.response && context.verbatim,
      ({context}) => context.verbatim
    ],

    [
      ({context}) => context.response,
      ({context}) => `the ${context.word}` 
    ],
  ],

  semantics: [
    [ 
      ({context}) => context.marker == 'it' && context.pullFromContext,
      ({context, s, objects}) => {
        context.value = objects.dialog.current[0]
      },
    ],

    // query 
    [ 
      ({context}) => context.marker == 'is' && context.query,
      ({context, s}) => {
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
        value = JSON.parse(JSON.stringify(value))
        value.evaluate = true;
        const instance = s(value) 
        delete instance.evaluate
        instance.instance = true;
        concept = JSON.parse(JSON.stringify(value)) 
        concept.isQuery = undefined

        context.response = {
          isResponse: true,
          instance,
          concept,
        }
      }
    ],

    // statement
    [ 
      ({context}) => context.marker == 'is' && !context.query,
      ({context, s}) => {
        const one = context.one;
        const two = context.two;
        one.same = two;
        s(one)
        one.same = undefined
        two.same = one
        s(two)
        two.same = undefined
      }
    ],
  ],
};

config = new entodicton.Config(config)
config.api = api

config.initializer( ({objects, isModule}) => {
  if (isModule) {
    objects.dialog = {
      current: []
    }
  } else {
    objects.dialog = {
      current: ['contextThatItRefersTo']
    }
  }
})

entodicton.knowledgeModule( { 
  module,
  description: 'framework for dialogues',
  config,
  test: {
    name: './dialogues.test.json',
    contents: dialogues_tests
  },
  /*
  module: () => {
    config.initializer( ({objects, api, uuid}) => {
      objects.dialog = {
          current: []
      }
    })

    module.exports = config
  }
  */
})
