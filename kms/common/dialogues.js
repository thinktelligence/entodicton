const entodicton = require('entodicton')
const meta = require('./meta.js')
const _ = require('lodash')
const { isMany } = require('./helpers')
const dialogues_tests = require('./dialogues.test.json')
const { indent, focus } = require('./helpers')
const pluralize = require('pluralize')

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

  setBrief(value) {
    this.objects.brief = value
  }

  getBrief() {
    return this.objects.brief
  }

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

  // value is in response field
  // TODO maybe generalize out query+evaluate along the lines of set value and set reference
  evaluate(value, context, log, s) {
    value.evaluate = true;
    // const instance = s(value, { debug: { apply: true } }) 
    const instance = s(value)
    if (!instance.evaluateWasProcessed && !instance.verbatim) {
      warningNotEvaluated(log, context, value);
    }
    delete instance.evaluate
    instance.instance = true;
    return instance
  }

  evaluateToWord(value, g) {
    return g({ ...value, evaluateToWord: true })
  }

  evaluateToConcept(value, context, log, s) {
    value.evaluate = { toConcept: true }
    // const concept = s(value, { debug: { apply: true } }) 
    const concept = s(value)
    if (!concept.evaluateWasProcessed && !concept.verbatim) {
      warningNotEvaluated(log, context, value);
    }
    delete concept.evaluate
    return concept
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

// TODO implement what / what did you say ...
let config = {
  name: 'dialogues',
  operators: [
    "(([queryable]) [is|] ([queryable|]))",
    "([is:queryBridge|] ([queryable]) ([queryable]))",
    // "(([queryable]) [is:isEdBridge|is,are] ([isEdAble|]))",
    "(([queryable]) [(<isEd|> ([isEdAble|]))])",
    "([it])",
    "([what] ([whatAble|]))",
    "([what:optional])",
    "(<the|> ([theAble|]))",
    "(<a|a,an> ([theAble|]))",
    "([unknown])",
    "([not] ([notAble|]))",

    "([be] ([briefOrWordy|]))",

    "([([canBeQuestion])])",
    "(([canBeQuestion/1,2]) <questionMark|>)",
    // "(([is/2]) <questionMark|>)",

    "(([what]) [(<does|> ([doesAble|]))])",
    "([canBeDoQuestion])",
    "(<does|> ([canBeDoQuestion/0,1]))",
    // make what is it work <<<<<<<<<<<<<<<<<<<<<<<, what is greg
    // joe is a person the age of joe ...
    //"arm them, what, the phasers"
    //greg is a first name
    "(([theAble|]) [list|and] ([theAble|]))",
    "([yesno|])",
    "([articlePOS|])",
    { pattern: "([debug23])" },
  ],
  associations: {
    negative: [
      // [['isEd', 0], ['unknown', 0]],
      // [['isEd', 0], ['unknown', 1]],
      [['is', 0], ['means', 0]],
    ],
    positive: [
      [['is', 0], ['unknown', 0]],
      [['is', 0], ['unknown', 1]],
      [['isEd', 0], ['means', 0]],
    ]
  },
  bridges: [
    { id: "articlePOS", level: 0, bridge: "{ ...next(operator) }" },
    { id: "debug23", level: 0, bridge: "{ ...next(operator) }" },
    // { id: "what", level: 0, bridge: "{ ...next(operator), ...after[0], query: ['what'], determined: true }" },
    { id: "what", level: 0, optional: "{ ...next(operator), query: ['what'], determined: true }", bridge: "{ ...after, query: ['what'], modifiers: ['what'], what: operator }" },
    { id: "whatAble", level: 0, bridge: "{ ...next(operator) }" },

    {id: "list", level: 0, selector: {match: "same", left: [ { variable: 'type' } ], right: [ { variable: 'type' } ], passthrough: true}, bridge: "{ ...next(operator), value: append(before, after) }"},
    {id: "list", level: 1, selector: {match: "same", left: [ { variable: 'type' } ], passthrough: true}, bridge: "{ ...operator, value: append(before, operator.value) }"},

    { id: "be", level: 0, bridge: "{ ...next(operator), type: after[0] }" },
    { id: "briefOrWordy", level: 0, bridge: "{ ...next(operator) }" },

    { id: "notAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "not", level: 0, bridge: "{ ...after, negated: true }" },

    { id: "yesno", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "unknown", level: 0, bridge: "{ ...next(operator), unknown: true }" },
    { id: "unknown", level: 1, bridge: "{ ...next(operator) }" },
    { id: "queryable", level: 0, bridge: "{ ...next(operator) }" },
    { id: "questionMark", level: 0, bridge: "{ ...before[0], query: [before.marker] }" },
    // { id: "isEd", level: 0, bridge: "{ ...context, query: true }" },
    // gregbug
    // context.subject == ['owner'] but could be list of properties
    // { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, [subject].number: operator.number }" },
    // { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, properties(subject).number: operator.number }" },
    // NO or symlink subject: link(current.ownee)  // any other operator...
    // NO { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, subject.number: operator.number }" },
    { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, [context.subject].number: operator.number }" },
    // { id: "isEd", level: 0, bridge: "{ ...context }" },
    { id: "isEdAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "isEdAble", level: 1, bridge: "{ ...next(operator) }" },
    { id: "is", level: 0, 
            bridge: "{ ...next(operator), one: { number: operator.number, ...before[0] }, two: after[0] }", 
            queryBridge: "{ ...next(operator), one: after[0], two: after[1], query: true }" ,
    },
    { id: "is", level: 1, bridge: "{ ...next(operator) }" },

    { id: "canBeDoQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 2, bridge: "{ ...next(operator) }" },
    { id: "doesAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "doesAble", level: 1, bridge: "{ ...next(operator), before: before[0] }" },
    { id: "does", level: 0, bridge: "{ query: true, what: operator.marker, ...context, number: operator.number, object.number: operator.number }*" },

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
    "who": [{"id": "what", "initial": "{ modifiers: [], query: true }" }],
    "yes": [{"id": "yesno", "initial": "{ value: true }" }],
    "no": [{"id": "yesno", "initial": "{ value: false }" }],
    "brief": [{"id": "briefOrWordy", "initial": "{ value: 'brief' }" }],
    "wordy": [{"id": "briefOrWordy", "initial": "{ value: 'wordy' }" }],
    "does": [{"id": "does", "initial": "{ number: 'one' }" }],
    "do": [{"id": "does", "initial": "{ number: 'many' }" }],
    "is": [{"id": "is", "initial": "{ number: 'one' }" }, {"id": "isEd", "initial": "{ number: 'one' }" }],
    "are": [{"id": "is", "initial": "{ number: 'many' }" }, {"id": "isEd", "initial": "{ number: 'many' }" }],
  },

  floaters: ['query'],
  priorities: [
    [['means', 0], ['is', 0]],
    [['questionMark', 0], ['is', 0]],
    [['questionMark', 0], ['is', 1]],
    [["does",0],["what",0]],
    [["is",0],["what",0]],
    [["is",1],["what",0]],
    [["is",0],["articlePOS",0]],
    [["is",1],["is",0]],
    [["isEd",0],["isEdAble",0]],
    [['is', 0], ['does', 0], ['a', 0]],
    [['means', 0], ['isEd', 0]],
  ],
  hierarchy: [
    ['a', 'articlePOS'],
    ['the', 'articlePOS'],
    ['unknown', 'notAble'],
    ['unknown', 'theAble'],
    ['unknown', 'queryable'],
    ['it', 'queryable'],
    ['what', 'queryable'],
    ['is', 'canBeQuestion'],
    // ['isEd', 'means'],
    // ['is', 'means'],
  ],
  debug: false,
  version: '3',
  generators: [
    {
      notes: "handle making responses brief",
      match: ({context, objects}) => (context.topLevel || context.isResponse) && objects.brief && !context.briefWasRun,
      apply: ({context, g}) => {
        const focussed = focus(context)
        context.briefWasRun = true
        return g(focussed)
      },
      priority: -2,
    },
    {
      notes: "unknown ",
      match: ({context}) => context.marker == 'unknown' && context.implicit,
      apply: ({context}) => '',
    },
    {
      notes: "unknown answer default response",
      match: ({context}) => context.marker == 'answerNotKnown',
      apply: ({context}) => `that is not known`,
    },
    {
      notes: "be brief or wordy",
      match: ({context}) => context.marker == 'be',
      apply: ({context}) => `be ${context.type.word}`,
    },
    /*
    {
       notes: 'paraphrase: plural/singular',
       priority: -1,
       match: ({context}) => context.paraphrase && context.word
       apply: ({context, g}) => { return { "self": "your", "other": "my" }[context.value] },
    },
    */
    {
      match: ({context}) => context.marker === 'idontknow',
      apply: ({context}) => "i don't know",
    },
    {
      match: ({context}) => context.marker == 'yesno',
      apply: ({context}) => context.value ? 'yes' : 'no',
      priority: -1,
      // debug: 'call11',
    },
    {
      match: ({context}) => !context.paraphrase && context.response && context.response.marker == 'yesno',
      apply: ({context}) => context.response.value ? 'yes' : 'no',
      priority: -1,
    },
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

    {
      notes: 'handle lists with yes no',
      // ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      // ({context, hierarchy}) => context.marker == 'list' && context.value,
      match: ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value && context.value.length > 0 && context.value[0].marker == 'yesno',
      apply: ({context, g, gs}) => {
        return `${g(context.value[0])} ${gs(context.value.slice(1), ', ', ' and ')}`
      }
    },

    {
      notes: 'handle lists',
      // ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      // ({context, hierarchy}) => context.marker == 'list' && context.value,
      match: ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      apply: ({context, gs}) => {
        return gs(context.value, ', ', ' and ')
      }
    },

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
        const oldValue = context.value.paraphrase
        context.value.paraphrase = true
        const result = g(context.value)
        context.value.paraphrase = oldValue
        return result
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
    {
      match: ({context}) => context.response && context.response.verbatim && !context.paraphrase,
      apply: ({context}) => context.response.verbatim,
    },
    {
      match: ({context}) => context.isResponse && context.verbatim && !context.paraphrase,
      apply: ({context}) => context.verbatim,
      priority: -1,
    },
    { 
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeQuestion') && context.paraphrase && context.topLevel && context.query,
      apply: ({context, g}) => {
        return `${g({...context, topLevel: undefined})}?` 
      },
      priority: -1,
    },
    { 
      notes: "x is y",
      match: ({context, hierarchy}) => { return hierarchy.isA(context.marker, 'is') && context.paraphrase },
      apply: ({context, g}) => {
        context.one.response = true
        context.two.response = true
        return `${g({ ...context.one, paraphrase: true })} ${context.word} ${g(context.two)}` 
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
    { 
      notes: 'x is y (not a response)',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && !context.response,
      apply: ({context, g}) => {
        if ((context.two.value || {}).marker == 'answerNotKnown') {
          return g(context.two.value)
        }
        if (context.two.focusableForPhrase) {
          return `${g(context.two)} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g({...context.one, paraphrase: true}, { assumed: { subphrase: true } })}`
        } else {
          return `${g({...context.one, paraphrase: true}, { assumed: {subphrase: true} })} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g(context.two)}`
        }
        // return `${g({...context.one})} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g(context.two)}`
      },
    },

    {
      priority: -3,
      match: ({context}) => context.evaluateToWord && context.word,
      apply: ({context}) => context.word,
    },

    // defaults
    {
      notes: 'show the input word',
      match: ({context}) => context.paraphrase && context.word,
      apply: ({context}) => `${context.word}` 
    },

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
    {
      todo: 'debug23',
      match: ({context}) => context.marker == 'debug23',
      apply: ({context, hierarchy}) => {
        debugger
        debugger
      },
    },
    { 
      todo: 'be brief or wordy',
      match: ({context}) => context.marker == 'be',
      apply: ({context, api}) => {
        api.setBrief( context.type.value == 'brief' )
      },
    },
    [ 
      ({context}) => context.marker == 'it' && context.pullFromContext,
      ({context, s, api, log}) => {
        context.value = api.mentions()[0]
        const instance = api.evaluate(context.value, context, log, s)
        if (instance.value) {
          context.value = instance.value
        }
      },
    ],
    { 
      notes: 'what x is y?',
      /*
        what type is object (what type is pikachu)   (the type is typeValue)
        what property is object (what color are greg's eyes)
        object is a type (is greg a human) // handled by queryBridge
      */

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
        // TODO wtf is the next line?
        value = JSON.parse(JSON.stringify(value))
        // const instance = api.evaluate(value, context, log, s)
        const instance = km('dialogues').api.evaluate(value, context, log, s)
        if (instance.verbatim) {
          context.response = { verbatim: instance.verbatim }
          return
        }
        // instance.focusable = ['one', 'two']
        instance.focus = true
        // concept = JSON.parse(JSON.stringify(value)) 
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


config = new entodicton.Config(config, module)
config.api = api
config.add(meta)

config.initializer( ({objects, config, isModule}) => {
  objects.mentioned = []
  objects.variables = {
  }
  if (isModule) {
  } else {
    config.addWord("canbedoquestion", { id: "canBeDoQuestion", "initial": "{}" })
    config.addWord("doesable", { id: "doesAble", "initial": "{}" })
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
