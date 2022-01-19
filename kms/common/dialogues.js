const entodicton = require('entodicton')
const meta = require('./meta.js')
const dialogues_tests = require('./dialogues.test.json')
const { indent } = require('./helpers')

class API {
  //
  // duck typing: for operators you want to use here
  //
  //   1. Use hierarchy to make them an instance of queryable. For example add hierarchy entry [<myClassId>, 'queryable']
  //   2. For semantics, if evaluate == true then set the 'value' property of the operator to the value.
  //   3. Generators will get contexts with 'response: true' set. Used for converting 'your' to 'my' to phrases like 'your car' or 'the car'.
  //   4. Generators will get contexts with 'instance: true' and value set. For converting values like a date to a string.
  //

  // used with context sensitive words like 'it', 'that' etc. for example if you have a sentence "create a tank"
  // then call mentioned with the tank created. Then if one asks 'what is it' the 'it' will be found to be the tank.

  mentioned(concept) {
    this.objects.mentioned.push(concept)
  }

  mentions() {
    return this.objects.mentioned
  }

  getVariable(name) {
    return this.objects.variables[name] || name
  }

  setVariable(name, value) {
    this.objects.variables[name] = value
  }
}
const api = new API()

const warningIsANotImplemented = (log, context) => {
  const description = 'WARNING from Dialogues KM: For semantics in order to handle sentences of type "x is y?", set the response to what you like.'
  const match = `({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query && <other conditions as you like>`
  const apply = `({context}) => <do stuff...>; context.response = <value>`
  const input = indent(JSON.stringify(context, null, 2), 2)
  const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
  log(indent(message, 4))
}

const warningNotEvaluated = (log, context, value) => {
  const description = 'WARNING from Dialogues KM: For semantics, implement an evaluations handler, set "value" property of the operator to the value.'
  const match = `({context}) => context.marker == '${value.marker}' && context.evaluate && <other conditions as you like>`
  const apply = `({context}) => <do stuff...>; context.value = <value>`
  const input = indent(JSON.stringify(value, null, 2), 2)
  const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
  log(indent(message, 4))
}

const warningSameNotEvaluated = (log, context, one) => {
  const description = 'WARNING from Dialogues KM: For the "X is Y" type phrase implement a same handler.'
  const match = `({context}) => context.marker == '${one.marker}' && context.same && <other conditions as you like>`
  const apply = '({context}) => <do stuff... context.same is the other value>; context.sameWasProcessed = true'
  const input = indent(JSON.stringify(one, null, 2), 2)
  const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
  log(indent(message, 4))
}

const evaluate = (value, context, log, s) => {
  value.evaluate = true;
  const instance = s(value) 
  if (!instance.evaluateWasProcessed) {
    warningNotEvaluated(log, context, value);
  }
  delete instance.evaluate
  instance.instance = true;
  return instance
}

// TODO implement what / what did you say ...
let config = {
  name: 'dialogues',
  operators: [
    "(([queryable]) [is|is,are] ([queryable|]))",
    "([is:queryBridge|is,are] ([queryable]) ([queryable]))",
    "([it])",
    "([what])",
    "(<the|> ([theAble|]))",
    "(<a|a,an> ([theAble|]))",
    "([unknown])",
    "([not] ([notAble|]))",

    "([canBeQuestion])",
    "(([canBeQuestion/1]) <questionMark|>)",

    "([canBeDoQuestion])",
    "(<does|does,do> ([canBeDoQuestion/1]))",
    // make what is it work <<<<<<<<<<<<<<<<<<<<<<<, what is greg
    // joe is a person the age of joe ...
    //"arm them, what, the phasers"
    //greg is a first name
    "(([theAble|]) [list|and] ([theAble|]))",
    "([yesno|])",
  ],
  bridges: [
    {id: "list", level: 0, selector: {match: "same", type: "infix", passthrough: true}, bridge: "{ ...next(operator), value: append(before, after) }"},
    {id: "list", level: 1, selector: {match: "same", type: "postfix", passthrough: true}, bridge: "{ ...operator, value: append(before, operator.value) }"},

    { id: "notAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "not", level: 0, bridge: "{ ...after, negated: true }" },

    { id: "yesno", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "unknown", level: 0, bridge: "{ ...next(operator), unknown: true }" },
    { id: "what", level: 0, bridge: "{ ...next(operator), query: ['what'], determined: true }" },
    { id: "queryable", level: 0, bridge: "{ ...next(operator) }" },
    { id: "questionMark", level: 0, bridge: "{ ...before[0], query: [before.marker] }" },
    { id: "is", level: 0, bridge: "{ ...next(operator), one: before[0], two: after[0] }", queryBridge: "{ ...next(operator), one: after[0], two: after[1], query: true }" },
    { id: "is", level: 1, bridge: "{ ...next(operator) }" },

    { id: "canBeDoQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 2, bridge: "{ ...next(operator) }" },
    { id: "does", level: 0, bridge: "{ ...after, query: true }" },

    // { id: "the", level: 0, bridge: "{ ...after[0], pullFromContext: true }" },
    { id: 'the', level: 0, bridge: '{ ...after[0], pullFromContext: true, concept: true, wantsValue: true, determiner: "the", modifiers: append(["determiner"], after[0].modifiers)}' },

    { id: "a", level: 0, bridge: "{ ...after[0], pullFromContext: false, concept: true, number: 'one', wantsValue: true, determiner: 'a', modifiers: append(['determiner'], after[0].modifiers) }" },
    { id: "theAble", level: 0, bridge: "{ ...next(operator) }" },

    // TODO make this hierarchy thing work
    { id: "it", level: 0, hierarchy: ['queryable'], bridge: "{ ...next(operator), pullFromContext: true, determined: true }" },
  ],
  words: {
    "?": [{"id": "questionMark", "initial": "{}" }],
    "the": [{"id": "the", "initial": "{ modifiers: [] }" }],
    "who": [{"id": "what", "initial": "{ modifiers: [] }" }],
    "yes": [{"id": "yesno", "initial": "{ value: true }" }],
    "no": [{"id": "yesno", "initial": "{ value: false }" }],
  },

  floaters: ['query'],
  priorities: [
    [['means', 0], ['is', 0]],
    [['questionMark', 0], ['is', 0]],
    [['questionMark', 0], ['is', 1]],
    [["is",0],["what",0]],
    [["is",1],["what",0]],
    [["is",0],["the",0]],
    [["is",0],["a",0]],
    [["is",1],["is",0]],
    [['is', 0], ['does', 0], ['a', 0]],
  ],
  hierarchy: [
    ['unknown', 'notAble'],
    ['unknown', 'theAble'],
    ['unknown', 'queryable'],
    ['it', 'queryable'],
    ['what', 'queryable'],
    ['is', 'canBeQuestion'],
  ],
  debug: false,
  version: '3',
  generators: [
    {
      match: ({context}) => context.marker == 'yesno',
      apply: ({context}) => context.value ? 'yes' : 'no'
    },
    /*
    {
      match: ({context}) => context.truthValue === false && !context.query && context.response,
      apply: ({context, g}) => `no ${g({...context, truthValue: undefined})}`,
      priority: -1,
    },
    {
      match: ({context}) => context.truthValue === true && !context.query && context.response,
      apply: ({context, g}) => `yes ${g({...context, truthValue: null})}`,
      priority: -1,
    },
    */
    /*
     * modifiers = <list of properties>
     */
    [
      //({context}) => context.paraphrase && context.modifiers,
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
      ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      ({context, gs}) => {
        return gs(context.value, ' ', ' and ')
      }
    ],

    {
      notes: 'paraphrase a negation',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'notAble') && context.negated, // && !context.isQuery && !context.paraphrase && context.value,
      apply: ({context, g}) => {
        context.negated = false
        const result = g(context.value)
        context.negated = true
        return `not ${result}`
      }
    },

    {
      notes: 'paraphrase a queryable',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && !context.paraphrase && context.value,
      apply: ({context, g}) => {
        context.value.paraphrase = true;
        return g(context.value)
      }
    },
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.isSelf && context.subject == 'my',
      ({context}) => `your ${context.word}`
    ],
    [ 
      ({context, hierarchy}) => ['it', 'what'].includes(context.marker) && context.paraphrase, 
      ({g, context}) => `${context.marker}`
    ],
    [
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.isSelf && context.subject == 'your',
      ({context}) => `my ${context.word}`
    ],
    [ 
      ({context, hierarchy}) => ['my', 'your'].includes(context.subject) && hierarchy.isA(context.marker, 'queryable') && context.paraphrase, 
      ({g, context}) => `${context.subject} ${context.marker}`
    ],
    [ 
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'theAble') && context.paraphrase && context.wantsValue && !context.pullFromContext, 
      ({g, context}) => `a ${context.word}`
    ],
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
      ({context}) => context.response && context.response.verbatim,
      ({context}) => context.response.verbatim
    ],
    { 
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeQuestion') && context.paraphrase && context.topLevel && context.query,
      apply: ({context, g}) => {
        return `${g({...context, topLevel: undefined})}?` 
      },
      priority: -1,
    },
    { 
      match: ({context, hierarchy}) => { return hierarchy.isA(context.marker, 'is') && context.paraphrase },
      apply: ({context, g}) => {
        context.one.response = true
        context.two.response = true
        return `${g(context.one)} ${context.word} ${g(context.two)}` 
      }
    },
    { 
      notes: 'is with a response defined',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.response,
      apply: ({context, g}) => {
        const response = context.response;
        const concept = response.concept;
        if (concept) {
          concept.paraphrase = true
          concept.isSelf = true
          const instance = g(response.instance)
          return `${g(concept)} ${context.word} ${instance}` 
        } else {
          return `${g(response)}` 
        }
      }
    },
    [ 
      ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && !context.response,
      ({context, g}) => {
        return `${g(context.one)} is ${g(context.two)}`
      }
    ],

    // defaults
    [
      ({context}) => context.paraphrase && context.word,
      ({context}) => `${context.word}` 
    ],

    [
      ({context}) => context.verbatim,
      ({context}) => context.verbatim
    ],

    [
      ({context}) => context.response,
      ({context, g}) => g(context.response)
    ],

    [
      ({context}) => context.response,
      ({context}) => `the ${context.word}` 
    ],

    {
      notes: 'show word',
      match: ({context}) => context.word,
      apply: ({context}) => context.word,
    },

    {
      notes: 'show json',
      match: () => true,
      apply: ({context}) => JSON.stringify(context)
    }
  ],

  semantics: [
    [ 
      ({context}) => context.marker == 'it' && context.pullFromContext,
      ({context, s, api, log}) => {
        context.value = api.mentions()[0]
        const instance = evaluate(context.value, context, log, s)
        if (instance.value) {
          context.value = instance.value
        }
      },
    ],
    { 
      notes: 'what x is y?',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query,
      apply: ({context, s, log, km, objects}) => {
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
        km('dialogues').api.mentioned(concept)
        value = JSON.parse(JSON.stringify(value))
        const instance = evaluate(value, context, log, s)
        if (instance.verbatim) {
          context.response = { verbatim: instance.verbatim }
          return
        }
        concept = JSON.parse(JSON.stringify(value)) 
        concept.isQuery = undefined

        context.response = {
          isResponse: true,
          instance,
          concept,
        }
      }
    },
    { 
      notes: 'x is y?',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query,
      apply: ({context, log}) => {
        warningIsANotImplemented(log, context)
        context.response = {
          verbatim: "I don't know"
        }
      }
    },

    // statement
    { 
      notes: 'x is y',
      match: ({context}) => context.marker == 'is' && !context.query && context.one && context.two,
      apply: ({context, s, log}) => {
        const one = context.one;
        const two = context.two;
        one.same = two;
        one.response = null
        two.response = null
        const onePrime = s(one)
        if (!onePrime.sameWasProcessed) {
          warningSameNotEvaluated(log, context, one)
        } else {
          if (onePrime.response) {
            context.response = onePrime.response
          }
        }
        one.same = undefined
        let twoPrime;
        if (!onePrime.sameWasProcessed) {
          two.same = one
          twoPrime = s(two)
          if (!twoPrime.sameWasProcessed) {
            warningSameNotEvaluated(log, context, two)
          } else {
            if (twoPrime.response) {
              context.response = twoPrime.response
            }
          }
          two.same = undefined
        }
      }
    },
  ],
};


config = new entodicton.Config(config)
config.api = api
config.add(meta)

config.initializer( ({objects, isModule}) => {
  objects.mentioned = []
  objects.variables = {
  }
  if (isModule) {
  } else {
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
